import logging
import os
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
import requests
import google.genai as genai

# ------------------------------
# Setup
# ------------------------------
logging.basicConfig(level=logging.DEBUG)
load_dotenv()

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# GMX API endpoints
GMX_TICKERS_URL = "https://arbitrum-api.gmxinfra.io/prices/tickers"
GMX_TOKENS_URL = "https://arbitrum-api.gmxinfra.io/tokens"
GENIE_API_KEY = os.getenv("GEMINI_API_KEY")

# ------------------------------
# Helper: Currency conversion
# ------------------------------
def convert_currency(amount, from_currency="USD", to_currency="USD"):
    if from_currency.upper() == to_currency.upper():
        return amount
    try:
        response = requests.get(
            f"https://api.exchangerate.host/convert?from={from_currency.upper()}&to={to_currency.upper()}&amount={amount}"
        )
        response.raise_for_status()
        data = response.json()
        return data.get("result", amount)
    except Exception as e:
        logging.error(f"Error converting currency: {e}")
        return amount

# ------------------------------
# Helper: Fetch valid GMX token symbols
# ------------------------------
def get_valid_tokens():
    """Return a list of valid token symbols (uppercased).

    Tries the tokens endpoint first. If the returned shape is unexpected or
    empty, falls back to the tickers endpoint to extract symbols.
    """
    try:
        r = requests.get(GMX_TOKENS_URL, timeout=5)
        r.raise_for_status()
        tokens = r.json()

        symbols = []
        # tokens may be a list of dicts, or a dict with a 'tokens' key
        if isinstance(tokens, dict):
            # common wrappers
            for key in ("tokens", "data", "result"):
                if key in tokens and isinstance(tokens[key], list):
                    tokens_list = tokens[key]
                    symbols = [t.get("symbol", "").upper() for t in tokens_list if isinstance(t, dict) and t.get("symbol")]
                    break
        elif isinstance(tokens, list):
            symbols = [t.get("symbol", "").upper() for t in tokens if isinstance(t, dict) and t.get("symbol")]

        symbols = [s for s in symbols if s]
        if symbols:
            return list(dict.fromkeys(symbols))

    except Exception as e:
        logging.debug(f"Tokens endpoint failed or returned unexpected shape: {e}")

    # Fallback: extract symbols from tickers endpoint
    try:
        r2 = requests.get(GMX_TICKERS_URL, timeout=5)
        r2.raise_for_status()
        tickers = r2.json()
        if isinstance(tickers, list):
            symbols = [c.get("symbol", "").upper() for c in tickers if c.get("symbol")]
            symbols = [s for s in symbols if s]
            return list(dict.fromkeys(symbols))
    except Exception as e:
        logging.error(f"Error fetching symbols from tickers as fallback: {e}")

    logging.error("Unable to determine valid GMX token symbols from API.")
    return []


def get_tokens_map():
    """Return a dict mapping symbol->token info (including decimals) where available."""
    try:
        r = requests.get(GMX_TOKENS_URL, timeout=5)
        r.raise_for_status()
        data = r.json()
        tokens = []
        if isinstance(data, dict) and 'tokens' in data and isinstance(data['tokens'], list):
            tokens = data['tokens']
        elif isinstance(data, list):
            tokens = data
        mapping = {t.get('symbol', '').upper(): t for t in tokens if isinstance(t, dict) and t.get('symbol')}
        return mapping
    except Exception as e:
        logging.debug(f"Could not build tokens map: {e}")
        return {}

# ------------------------------
# Helper: Fetch GMX prices (cleaned)
# ------------------------------
def fetch_gmx_prices(top_n=5, currency="USD", filter_symbol: str = None):
    try:
        response = requests.get(GMX_TICKERS_URL, timeout=5)
        response.raise_for_status()
        prices = response.json()
        logging.debug(f"Raw GMX API data: {prices[:top_n]}")

        valid_symbols = get_valid_tokens()
        if not valid_symbols:
            logging.debug("get_valid_tokens returned empty list")
            return "No valid GMX token symbols found."

        converted_prices = []
        # Normalize filter if provided
        filter_symbol_norm = filter_symbol.upper() if filter_symbol else None

        tokens_map = get_tokens_map()

        def _extract_symbol(coin):
            # support various key names returned by different endpoints
            for k in ("tokenSymbol", "token_symbol", "symbol", "token"):
                v = coin.get(k)
                if v:
                    return str(v).upper()
            return ""

        def _extract_min_price(coin):
            for k in ("minPrice", "min_price", "price"):
                v = coin.get(k)
                if v is not None:
                    return v
            return None

        def _scale_price(raw_price, decimals=None):
            # raw_price is numeric or numeric-string possibly very large. We try different
            # exponents to find a human-friendly USD price. Prefer using token decimals
            # if provided: try scaling = 10 ** (decimals - 6) as a first guess.
            try:
                mp = float(raw_price)
            except Exception:
                return None

            # candidate exponents to try (powers of 10)
            candidates = []
            if decimals is not None:
                guess_exp = max(0, int(decimals) - 6)
                candidates.append(guess_exp)
            # common reasonable exponents
            candidates.extend([0, 2, 6, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24])
            seen = set()
            for e in candidates:
                if e in seen:
                    continue
                seen.add(e)
                val = mp / (10 ** e)
                if 0.0001 <= val <= 10_000_000:
                    return val
            # as a fallback, choose exponent to bring value into range by magnitude
            import math
            if mp <= 0:
                return None
            exp = max(0, int(math.floor(math.log10(mp))) - 3)
            val = mp / (10 ** exp)
            return val

        for coin in prices:
            # price items might have different keys depending on API shape
            symbol = _extract_symbol(coin)
            min_price = _extract_min_price(coin)

            if not symbol:
                continue

            # If symbol not in known list, allow loose matching with filter
            if symbol not in valid_symbols:
                if filter_symbol_norm and filter_symbol_norm in symbol:
                    # allow
                    pass
                else:
                    continue

            if not min_price:
                continue

            # get decimals if known
            decimals = None
            token_info = tokens_map.get(symbol)
            if token_info:
                decimals = token_info.get('decimals')

            scaled = _scale_price(min_price, decimals)
            if scaled is None:
                continue

            try:
                price_in_currency = convert_currency(scaled, "USD", currency)
                if price_in_currency <= 0 or price_in_currency > 10_000_000:
                    continue
                converted_prices.append({
                    "symbol": symbol,
                    "price": round(price_in_currency, 6),
                    "unit": currency.upper()
                })
            except Exception as e:
                logging.error(f"Error processing coin {coin}: {e}")
                continue
            # If user requested a specific symbol, continue scanning the full list
            # to find matches (don't stop at top_n which represents a generic top list).
            if not filter_symbol and len(converted_prices) >= top_n:
                break

        if not converted_prices:
            if filter_symbol:
                return f"No GMX data found for '{filter_symbol}'."
            return "No valid GMX prices found."
        return converted_prices

    except Exception as e:
        logging.error(f"Error fetching GMX data: {e}")
        return f"Error fetching GMX data: {e}"

# ------------------------------
# Home page
# ------------------------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# ------------------------------
# Chat endpoint
# ------------------------------
@app.post("/chat")
async def chat(user_input: str = Form(...), currency: str = Form("USD")):
    # Try to detect if user asked about a specific symbol (e.g., 'BTC' or 'price of ETH')
    tokens = get_valid_tokens()
    # simple heuristic: look for any known symbol in the user input
    requested_symbol = None
    user_up = user_input.upper()
    for t in tokens:
        if t in user_up:
            requested_symbol = t
            break

    prices = fetch_gmx_prices(currency=currency.upper(), filter_symbol=requested_symbol)
    if isinstance(prices, str):
        # if user asked for a token specifically and it wasn't found, log available symbols
        if requested_symbol:
            logging.debug(f"Requested symbol '{requested_symbol}' not found. Available symbols sample: {tokens[:20]}")
        return JSONResponse({"reply": prices})

    # Prepare a clean string for the AI
    price_text = "\n".join([f"{p['symbol']}: {p['price']} {p['unit']}" for p in prices])

    context = f"""
You are a helpful assistant specializing in GMX crypto data.
Here are the latest top GMX prices in {currency.upper()}:

{price_text}

User query: {user_input}
"""

    try:
        client = genai.Client(api_key=GENIE_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=context
        )
        reply = response.text
    except Exception as e:
        logging.error(f"Error calling Gemini API: {e}")
        reply = f"Error calling Gemini API: {e}"

    return {"reply": reply}
