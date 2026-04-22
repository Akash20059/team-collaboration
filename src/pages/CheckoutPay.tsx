import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { formatINR, SITE_CONFIG } from "@/lib/config";
import { Loader2, CheckCircle2, Copy, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

/* ─── Desktop QR Code View ─── */
const DesktopQRView = ({ total, orderId, onDone }: { total: number; orderId: string; onDone: () => void }) => {
  const qrLink = `upi://pay?pa=${encodeURIComponent(SITE_CONFIG.upiId)}&pn=${encodeURIComponent(SITE_CONFIG.upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent("Shreemata Goumandira Order")}`;
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onDone, 800);
  };

  if (confirmed) {
    return (
      <div className="text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-secondary">Redirecting…</h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-secondary font-display">Scan & Pay</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Open any UPI app on your phone and scan this QR code to pay
      </p>

      {/* Amount */}
      <div className="bg-primary/10 rounded-full px-5 py-2 inline-block mb-5">
        <span className="text-2xl font-bold text-primary">{formatINR(total)}</span>
      </div>

      {/* QR Code */}
      <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 inline-block mb-4 shadow-sm">
        <QRCodeSVG value={qrLink} size={200} />
      </div>

      {/* UPI ID */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">{SITE_CONFIG.upiId}</code>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(SITE_CONFIG.upiId); toast.success("UPI ID copied!"); }}
          className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors"
          aria-label="Copy UPI ID"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left space-y-1">
        <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5" /> How to pay:
        </p>
        <ol className="text-xs text-amber-700 list-decimal ml-4 space-y-0.5">
          <li>Open Google Pay, PhonePe, or any UPI app</li>
          <li>Tap "Scan QR" and scan the code above</li>
          <li>Confirm the amount and enter your UPI PIN</li>
          <li>Come back here and click the button below</li>
        </ol>
      </div>

      <Button
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl py-6"
        onClick={handleConfirm}
      >
        ✅ I have completed the payment
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        Order #{orderId}
      </p>
    </div>
  );
};

/* ─── Mobile UPI Intent View ─── */
const MobileIntentView = ({ appId, appName, total, orderId, onReturn }: {
  appId: string; appName: string; total: number; orderId: string; onReturn: () => void;
}) => {
  const link = buildLink(appId, total);
  const [status, setStatus] = useState<"idle" | "launched" | "returned">("idle");
  const listenRef = useRef(false);

  const openApp = () => {
    setStatus("launched");
    window.location.href = link;
    setTimeout(() => { listenRef.current = true; }, 2500);
  };

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden && listenRef.current && status === "launched") {
        setStatus("returned");
        setTimeout(onReturn, 800);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [status, onReturn]);

  if (status === "returned") {
    return (
      <div className="text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-secondary">Redirecting…</h2>
      </div>
    );
  }

  if (status === "launched") {
    return (
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-5 animate-spin" />
        <h2 className="text-lg font-bold text-secondary mb-1">Waiting for payment…</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Complete the payment in{" "}
          <span className="font-semibold">{appName}</span> and come back here.
        </p>
        <button
          type="button"
          onClick={onReturn}
          className="text-sm text-primary underline underline-offset-2"
        >
          Payment done? Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* App icon */}
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
        Open {appName} &amp; Pay
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Paying to: <span className="font-mono">{SITE_CONFIG.upiId}</span>
      </p>
    </div>
  );
};

/* ─── Main Page ─── */
const CheckoutPay = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { state } = useLocation() as {
    state?: { appId?: string; appName?: string; total?: number };
  };
  const nav = useNavigate();

  const appId   = state?.appId   ?? "gpay";
  const appName = APP_NAMES[appId] ?? (state?.appName ?? "UPI App");
  const total   = state?.total   ?? 0;
  const isDesktop = appId === "desktop_qr";

  useEffect(() => {
    if (!orderId) nav("/", { replace: true });
  }, [orderId]);

  const handleDone = () => {
    nav(`/order-confirmed/${orderId}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {isDesktop ? (
          <DesktopQRView total={total} orderId={orderId!} onDone={handleDone} />
        ) : (
          <MobileIntentView
            appId={appId}
            appName={appName}
            total={total}
            orderId={orderId!}
            onReturn={handleDone}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPay;
