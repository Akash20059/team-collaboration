export function scrollToIdWithOffset(id: string, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector("header");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const offset = 12; // small gap below header
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - offset;

  window.scrollTo({ top, behavior });
}

export function tryScrollHashOnLoad() {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.replace("#", "");

  // Wait for layout to settle and element to exist
  const maxAttempts = 10;
  let attempts = 0;
  const t = setInterval(() => {
    const el = document.getElementById(id);
    if (el || attempts >= maxAttempts) {
      clearInterval(t);
      if (el) scrollToIdWithOffset(id, "smooth");
    }
    attempts++;
  }, 80);
}
