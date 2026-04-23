import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Minus, Plus, MapPin, Phone, Receipt, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "@/hooks/useCart";
import { computeDelivery, formatINR, SITE_CONFIG } from "@/lib/config";
import { toast } from "sonner";
import { UPISheet, UPI_APPS, ANY_UPI, type UPIApp } from "@/components/checkout/UPISheet";

const Cart = () => {
  const { items, setQty, subtotal, mrpTotal, clear } = useCart();
  const nav = useNavigate();
  
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [upiApp, setUpiApp] = useState<UPIApp>(UPI_APPS[0]);
  const [qrOpen, setQrOpen] = useState(false);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const delivery = computeDelivery(subtotal);
  const total = subtotal + delivery;
  const savings = mrpTotal - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="font-display text-3xl font-bold text-secondary">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2 max-w-md">Discover our pure Gau products lovingly made in our gaushala.</p>
          <Button variant="hero" size="lg" className="mt-6" onClick={() => nav("/#products")}>
            Explore Our Products
          </Button>
        </main>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (!name.trim()) return toast.error("Please enter your name");
    if (!phone.trim() || phone.length < 10) return toast.error("Please enter a valid phone number");
    if (!address.trim()) return toast.error("Please enter your delivery address");

    if (isMobile) {
      // Construct Intent URI
      const upiLink = `${upiApp.intentCode}?pa=${encodeURIComponent(SITE_CONFIG.upiId)}&pn=${encodeURIComponent(SITE_CONFIG.upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent("Goumandira Order")}`;

      // Send WhatsApp msg as backup since there is no backend DB for orders
      const itemsList = items.map((i) => `• ${i.name} x ${i.quantity}`).join("%0A");
      const msg = `🙏 New Order Request%0A👤 ${name} (${phone})%0A📍 ${address}%0A💰 Total: ${formatINR(total)}%0A💳 Paying via ${upiApp.name}%0A%0AItems:%0A${itemsList}`;
      
      setTimeout(() => {
        window.location.href = upiLink;
        clear(); // Clear cart after initiating payment
      }, 1500);

      window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
      toast.success("Opening UPI app...");
    } else {
      // Desktop fallback: Show QR Code
      setQrOpen(true);
    }
  };

  const confirmDesktopOrder = () => {
    const itemsList = items.map((i) => `• ${i.name} x ${i.quantity}`).join("%0A");
    const msg = `🙏 New Order Request%0A👤 ${name} (${phone})%0A📍 ${address}%0A💰 Total: ${formatINR(total)}%0A💳 Paid via UPI QR code%0A%0AItems:%0A${itemsList}`;
    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
    clear();
    setQrOpen(false);
    toast.success("Order request sent!");
    nav("/");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col pb-[120px]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-md mx-auto w-full space-y-4 px-3 sm:px-4 mt-4">

          {/* Delivery Estimate */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border/40 flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-600 shrink-0" fill="currentColor" />
            <div>
              <p className="font-semibold text-[15px] text-secondary">Delivery in <span className="text-green-600">5-7 business days</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">Dispatched securely via trusted couriers</p>
            </div>
          </div>

          {/* Contact & Address forms (inline) */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 divide-y divide-border/40">
            {/* Address Row */}
            <div className="p-4 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] text-muted-foreground font-semibold mb-1">Delivery Address *</p>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address with pincode..."
                  className="w-full text-[15px] text-secondary font-medium outline-none resize-none bg-transparent placeholder:font-normal placeholder:text-muted-foreground/60 h-14"
                />
              </div>
            </div>

            {/* Contact Row */}
            <div className="p-4 flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[13px] text-muted-foreground font-semibold mb-1">Name *</p>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adhoksh Javali"
                    className="w-full text-[15px] text-secondary font-medium outline-none bg-transparent placeholder:font-normal placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="border-t border-border/40 pt-3">
                  <p className="text-[13px] text-muted-foreground font-semibold mb-1">Phone Number *</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-secondary font-medium">+91</span>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full text-[15px] text-secondary font-medium outline-none bg-transparent placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden">
            <div className="p-4 bg-orange-50/50 border-b border-orange-100/50">
              <p className="text-sm font-semibold text-secondary">Items in cart</p>
            </div>
            <div className="divide-y divide-border/40">
              {items.map((it) => (
                <div key={it.id} className="p-4 flex gap-3">
                  <div className="mt-1">
                    <div className="h-4 w-4 border border-green-600 flex items-center justify-center rounded-sm">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[15px] text-secondary leading-tight">{it.name}</h3>
                        {it.mrp && it.mrp > it.price ? (
                          <div className="mt-1 flex gap-2 items-center">
                            <p className="text-[14px] text-secondary font-medium">{formatINR(it.price * it.quantity)}</p>
                            <span className="text-xs text-muted-foreground line-through">{formatINR(it.mrp * it.quantity)}</span>
                          </div>
                        ) : (
                          <p className="text-[14px] text-secondary font-medium mt-1">{formatINR(it.price * it.quantity)}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{it.description?.substring(0, 50)}...</p>
                      </div>
                      
                      {/* Quantity button */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-between border border-primary/40 rounded-lg shadow-sm w-[76px] h-[34px] bg-primary/5">
                          <button onClick={() => setQty(it.id, it.quantity - 1)} className="w-[26px] h-full flex items-center justify-center text-primary/80 hover:bg-primary/10 rounded-l-lg transition-colors">
                            <Minus className="h-3 w-3" strokeWidth={3} />
                          </button>
                          <span className="text-[14px] font-bold text-primary">{it.quantity}</span>
                          <button onClick={() => setQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.max_stock} className="w-[26px] h-full flex items-center justify-center text-primary/80 hover:bg-primary/10 rounded-r-lg transition-colors disabled:opacity-50">
                            <Plus className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border/40 text-center">
              <button onClick={() => nav("/#products")} className="text-[15px] font-medium text-primary flex items-center justify-center gap-1 mx-auto">
                <Plus className="h-4 w-4" /> Add more items
              </button>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-4 text-secondary">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-bold text-[15px]">Bill Details</h2>
            </div>
            
            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Item Total</span>
                <span className="text-secondary">{formatINR(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Delivery Partner Fee</span>
                <span className="text-secondary">{delivery === 0 ? "FREE" : formatINR(delivery)}</span>
              </div>
              <div className="border-b border-border/50 border-dashed" />
              
              <div className="flex justify-between items-center font-bold text-[16px] text-secondary">
                <span>Total Pay</span>
                <span>{formatINR(total)}</span>
              </div>
              
              {savings > 0 && (
                <div className="bg-[#e5f7ed] rounded-lg p-2.5 mt-2 text-center text-[#11883e] text-xs font-semibold">
                  You're saving {formatINR(savings)} on this order!
                </div>
              )}
            </div>
          </div>
          
          <div className="text-[11px] text-muted-foreground/70 text-center pb-8 px-4 leading-relaxed">
            By placing this order, you agree to the conditions of Goumandira. Authentic products packed with devotion.
          </div>
        </div>
      </main>

      {/* Zomato style fixed bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border shadow-[0_-5px_15px_rgba(0,0,0,0.05)] rounded-t-xl overflow-hidden">
        
        {/* Payment selector strip */}
        <UPISheet 
          selectedApp={upiApp} 
          onSelect={setUpiApp}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        >
          <button className="w-full flex items-center justify-between px-4 py-2.5 bg-[#f8f8f8] border-b border-border/40 hover:bg-[#f0f0f0] transition-colors">
            <div className="flex flex-col items-start">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pay using ▼</p>
              <div className="flex items-center gap-2">
                {upiApp.icon ? (
                  <img src={upiApp.icon} alt="" className="h-4 object-contain" />
                ) : (
                  <div className="h-4 w-4 bg-secondary rounded flex items-center justify-center">
                    <span className="text-xs text-white">UP</span>
                  </div>
                )}
                <span className="text-[14px] font-bold text-secondary">{upiApp.name}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/70">Tap to change</p>
          </button>
        </UPISheet>

        {/* Place order strip */}
        <div className="flex px-4 py-3 bg-white">
          <button onClick={handlePlaceOrder} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-colors flex items-stretch overflow-hidden h-[52px]">
            <div className="flex flex-col justify-center px-4 bg-black/20 items-start min-w-[120px]">
              <span className="text-[16px] font-bold leading-tight text-white">{formatINR(total)}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white opacity-90">Total</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1 font-bold text-[17px] text-white">
              Place Order
              <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        </div>
      </div>

      {/* Desktop QR Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md text-center border-border/40 select-text">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl text-secondary">Scan to Pay</DialogTitle>
            <DialogDescription className="text-center text-[15px] pt-1">
              Please scan this QR code with any UPI app on your phone to complete your order of <strong className="text-primary">{formatINR(total)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-xl border border-border/40 my-2 mx-auto w-fit shadow-inner">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-border/30">
              <QRCodeSVG 
                value={`${upiApp.intentCode}?pa=${encodeURIComponent(SITE_CONFIG.upiId)}&pn=${encodeURIComponent(SITE_CONFIG.upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent("Goumandira Order")}`} 
                size={220} 
              />
            </div>
          </div>
          <div className="bg-muted/40 py-2.5 px-4 rounded-lg flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Merchant UPI ID</span>
            <code className="text-sm font-bold text-secondary">{SITE_CONFIG.upiId}</code>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 shadow-md" size="lg" onClick={confirmDesktopOrder}>
            I have made the payment
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
