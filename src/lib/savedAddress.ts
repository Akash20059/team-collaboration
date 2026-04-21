export interface SavedAddress {
  full_name: string;
  mobile: string;
  pincode: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  landmark?: string;
}

const KEY = "goumandira_saved_addr_v1";

export const getSavedAddress = (): SavedAddress | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAddress = (a: SavedAddress) => localStorage.setItem(KEY, JSON.stringify(a));
export const clearSavedAddress = () => localStorage.removeItem(KEY);
