import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatINR, SITE_CONFIG } from "@/lib/config";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── UPI scheme map ─── */
const SCHEMES: Record<string, string> = {
  bhim:      "upi",
  paytm:     "paytmmp",
  gpay:      "tez",
  phonepe:   "phonepe",
  amazonpay: "upi",
  navi:      "upi",
};

const buildLink = (appId: string, amount: number) => {
  const scheme = SCHEMES[appId] ?? "upi";
  const pa = encodeURIComponent(SITE_CONFIG.upiId);
  const pn = encodeURIComponent(SITE_CONFIG.upiName);
  const tn = encodeURIComponent("Shreemata Goumandira Order");
  const path = appId === "phonepe" ? "pay" : "upi/pay";
  return scheme === "upi"
    ? `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`
    : `${scheme}://${path}?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
};

/* App display names */
const APP_NAMES: Record<string, string> = {
  bhim: "BHIM UPI", paytm: "Paytm UPI", gpay: "Google Pay UPI",
  phonepe: "PhonePe UPI", amazonpay: "Amazon Pay UPI", navi: "Navi UPI",
};

const CheckoutPay = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { state } = useLocation() as {
    state?: { appId?: string; appName?: string; total?: number };
  };
  const nav = useNavigate();

  const appId   = state?.appId   ?? "gpay";
  const appName = APP_NAMES[appId] ?? (state?.appName ?? "UPI App");
  const total   = state?.total   ?? 0;
  const link    = buildLink(appId, total);

  const [status, setStatus] = useState<"idle" | "launched" | "returned">("idle");
  // guard: don't listen for visibilitychange immediately (page load triggers it)
  const listenRef = useRef(false);

  /* Open the UPI app */
  const openApp = () => {
    setStatus("launched");
    window.location.href = link;

    // Start listening for return only after a delay so the app has time to open
    setTimeout(() => {
      listenRef.current = true;
    }, 2500);
  };

  /* Listen for user returning from the UPI app */
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden && listenRef.current && status === "launched") {
        setStatus("returned");
        setTimeout(() => {
          nav(`/order-confirmed/${orderId}`, { replace: true });
        }, 800);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [status, orderId, nav]);

  /* If no order info in state, redirect to home */
  useEffect(() => {
    if (!orderId) nav("/", { replace: true });
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">

        {status === "idle" && (
          <>
            {/* App icon placeholder */}
            <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <span className="text-3xl">💳</span>
            </div>

            <h1 className="text-xl font-bold text-secondary font-display mb-1">
              Complete Payment
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Tap below to open{" "}
              <span className="font-semibold text-secondary">{appName}</span>.
              The amount will be pre‑filled — just enter your UPI PIN.
            </p>

            {/* Amount pill */}
            <div className="bg-primary/10 rounded-full px-5 py-2 inline-block mb-6">
              <span className="text-2xl font-bold text-primary">{formatINR(total)}</span>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl py-6"
              onClick={openApp}
            >
              Open {appName} & Pay
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Paying to: <span className="font-mono">{SITE_CONFIG.upiId}</span>
            </p>
          </>
        )}

        {status === "launched" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-5 animate-spin" />
            <h2 className="text-lg font-bold text-secondary mb-1">Waiting for payment…</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complete the payment in{" "}
              <span className="font-semibold">{appName}</span> and come back here.
            </p>

            {/* Manual fallback — desktop or if app didn't open */}
            <button
              type="button"
              onClick={() => nav(`/order-confirmed/${orderId}`, { replace: true })}
              className="text-sm text-primary underline underline-offset-2"
            >
              Payment done? Continue →
            </button>
          </>
        )}

        {status === "returned" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-secondary">Redirecting…</h2>
          </>
        )}

      </div>
    </div>
  );
};

export default CheckoutPay;
