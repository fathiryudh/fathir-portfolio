// Lite mode for weak devices (Chromebooks, old laptops, cheap phones). Set on <html data-lite> before
// first paint by the boot script in app/layout.tsx (few cores, little memory, reduced motion), or later
// by the FPS watchdog when the page can't hold a smooth frame rate. CSS drops the decorative extras
// under it, and the animation loops read it to draw less.

export const isLite = () => document.documentElement.dataset.lite !== undefined;

export function enableLite() {
  document.documentElement.dataset.lite = "";
  try {
    sessionStorage.setItem("lite", "1"); // stay lite for the rest of the visit
  } catch {}
}
