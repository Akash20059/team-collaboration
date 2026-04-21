// Site-wide config (edit values via admin or here)
export const SITE_CONFIG = {
  upiId: "337437337963378@cnrb",
  upiName: "Shreemata Goumandira",
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
  const { free_above, mid_threshold, low_charge, mid_charge } = SITE_CONFIG.delivery;
  if (subtotal >= free_above) return 0;
  if (subtotal >= mid_threshold) return mid_charge;
  return low_charge;
};

export const formatINR = (n: number) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
