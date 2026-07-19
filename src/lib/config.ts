// Site-wide config (edit values via admin or here)
export const SITE_CONFIG = {
  upiId: "9353564002@ybl",
  upiName: "ADHOKSHA JAVALI",
  whatsappNumber: "919110268570", // International format (no +)
  bankDetails: {
    accountName: "Shreemata Goumandira",
    accountNumber: "—",
    ifsc: "—",
    bankName: "—",
  },
  delivery: {
    // Tiered courier delivery
    free_above: 1000,
    mid_threshold: 500,
    low_charge: 80,
    mid_charge: 60,
  },
  ownerEmail: "shreematagomandira@gmail.com",
};

export const computeDelivery = (subtotal: number) => {
  return 0; // Testing: Free delivery
};

export const formatINR = (n: number) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
