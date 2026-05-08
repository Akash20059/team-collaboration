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

  // Fire multiple times to account for images/layout shifts rendering dynamically
  const delays = [50, 300, 800, 1500];
  delays.forEach(delay => {
    setTimeout(() => {
      scrollToIdWithOffset(id, delay === 1500 ? "smooth" : "auto");
    }, delay);
  });
}
