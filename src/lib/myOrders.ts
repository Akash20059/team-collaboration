const KEY = "goumandira_my_order_ids_v1";

export const getMyOrderIds = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addMyOrderId = (orderId: string) => {
  const ids = getMyOrderIds().filter((id) => id !== orderId);
  ids.unshift(orderId);
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, 50)));
};

export const removeMyOrderId = (orderId: string) => {
  const ids = getMyOrderIds().filter((id) => id !== orderId);
  localStorage.setItem(KEY, JSON.stringify(ids));
};
