// The component library at /library: every reusable piece of the site, with a live preview and its
// source. `files` are read from disk at build time (app/api/library/[slug]/route.ts), so the code
// shown is always the code that ships. Styles for most of these live in app/(site)/site.css.

export type LibraryEntry = {
  slug: string;
  name: string;
  summary: string;
  reference: string;
  tags: string[];
  files: string[];
};

const demo = (slug: string, extra: string[] = []) => [
  `components/library/demos/${slug}.tsx`,
  `components/library/demos/${slug}.module.css`,
  ...extra,
];

export const library: LibraryEntry[] = [
  {
    slug: "dial",
    name: "Dial Picker",
    summary:
      "A tuner dial for picking one of N: a ring hubbed off to the left, the item crossing the axis is live. Drag, scroll or arrow-key it; it damps toward your hand and settles into each detent with an elastic overshoot.",
    reference: "Carter Ogunsola · Lab: Dial",
    tags: ["React", "GSAP"],
    files: ["components/library/dial.tsx"],
  },
  {
    slug: "liquid-gradient",
    name: "Liquid Gradient",
    summary:
      "A WebGL gradient that drifts on domain-warped noise and smears like dye when the cursor stirs it: a small ping-pong fluid sim, painted blurred into a low-res mosaic.",
    reference: "Balky Studio · Footer",
    tags: ["WebGL", "GLSL"],
    files: ["components/site/liquid-gradient.tsx"],
  },
  {
    slug: "icon-trail",
    name: "Cursor Icon Trail",
    summary:
      "Skill badges dropped along the cursor's path, spawned by distance travelled, popped in with a tilt and retired oldest-first, never repeating a colour back to back.",
    reference: "Deji Ajetomobi · Cursor Icon Trail",
    tags: ["React", "CSS transitions"],
    files: ["components/site/icon-trail.tsx"],
  },
  {
    slug: "physics-tags",
    name: "Physics Tags",
    summary:
      "Pills that tumble into a box, pile up with a sideways lean and can be grabbed and thrown. Matter.js only positions real list items, so they stay selectable text.",
    reference: "Balky Studio · About: Physics Tags",
    tags: ["React", "Matter.js"],
    files: ["components/site/physics-tags.tsx"],
  },
  {
    slug: "hover-rows",
    name: "Hover Image Rows",
    summary:
      "Editorial project rows with an image that follows the cursor while a row is hovered and leans with its velocity. Fine pointers only.",
    reference: "Balky Studio · Hover Image Reveals",
    tags: ["React", "GSAP"],
    files: ["components/site/work-rows.tsx"],
  },
  {
    slug: "text-reveal",
    name: "Split Text Reveal",
    summary:
      "Words rise from behind an overflow mask with a stagger as they scroll in; blocks fade up. The motion is CSS, the component only decides when.",
    reference: "Balky Studio · Text Reveals",
    tags: ["React", "CSS"],
    files: ["components/site/reveal.tsx"],
  },
  {
    slug: "signature",
    name: "Signature Draw",
    summary:
      "Sign on the pad and watch it write itself back. Pointer samples become smoothed strokes, replayed one after another with pathLength=1 dash offsets, each timed by its length.",
    reference: "dqnamo · Animated Signature",
    tags: ["SVG", "CSS"],
    files: demo("signature-draw", ["components/animations/signature.tsx"]),
  },
  {
    slug: "live-readouts",
    name: "Live Readouts",
    summary: "A local-time clock whose colons blink out of phase, and a frames-per-second counter for a HUD.",
    reference: "Balky Studio clock · Carter Ogunsola HUD",
    tags: ["React"],
    files: ["components/site/live-readouts.tsx"],
  },
  {
    slug: "command-menu",
    name: "Command Menu",
    summary: "A ⌘K palette: a search field over grouped results, arrow keys to move, Enter to run, Esc to close.",
    reference: "Carter Ogunsola · Small UI Atoms",
    tags: ["React"],
    files: ["components/site/command-menu.tsx"],
  },
  {
    slug: "contact-letter",
    name: "Contact Letter",
    summary:
      "A contact form dressed as a letter on a desk: a ruled sheet on a 30px baseline, a signature drawn in a pop-up pad, a postage stamp when posted, and a receipt stub that fills in with a ticket number. Posting hands it to the visitor's mail app.",
    reference: "Carter Ogunsola · Contact: Letter on a Desk",
    tags: ["React", "GSAP", "Canvas"],
    files: ["components/contact/letter.tsx", "components/contact/letter.css"],
  },
  {
    slug: "paper-veil",
    name: "Torn Paper Veil",
    summary:
      "The page transition: a paper sheet sweeps up with a torn, fibrous WebGL edge while the old page recedes, swaps the route once covered, then tears away to uncover the new one.",
    reference: "Carter Ogunsola · Page Transition",
    tags: ["React", "WebGL2"],
    files: ["components/site/veil.tsx", "components/site/veil-paper.ts"],
  },
  {
    slug: "receipt-printer",
    name: "Receipt Printer",
    summary:
      "A checkout status as a small plastic printer. When payment clears, a receipt with a torn edge feeds out of the slot in jerky thermal-printer steps that shrink as it finishes.",
    reference: "dqnamo · Receipt Printer",
    tags: ["React", "Framer Motion"],
    files: demo("receipt-printer"),
  },
  {
    slug: "hold-to-confirm",
    name: "Hold to Confirm",
    summary:
      "A destructive button you press and hold: a red fill wipes across over 1.6s and confirms when full. Paired with an Undo notice that visibly drains over 5s.",
    reference: "dqnamo · Hold to Confirm",
    tags: ["React", "CSS clip-path"],
    files: demo("hold-to-confirm"),
  },
  {
    slug: "tactile-button",
    name: "Tactile Button",
    summary:
      "A keycap button: a face on a darker base that peeks out by its depth. Hover nudges it 2px, pressing pushes it flush. One CSS variable drives padding, offset and travel.",
    reference: "dqnamo · Tactile Button",
    tags: ["React", "CSS"],
    files: demo("tactile-button"),
  },
  {
    slug: "dynamic-button",
    name: "Dynamic Button",
    summary:
      "Label and icon roll to the new state while the width springs to fit. An invisible twin is measured so the width can tween.",
    reference: "dqnamo · Dynamic Button",
    tags: ["React", "Framer Motion"],
    files: demo("dynamic-button"),
  },
  {
    slug: "scramble-text",
    name: "Scramble Text",
    summary:
      "Text that arrives as symbols and resolves left to right. Steps are capped, so any length finishes in about 1.5s.",
    reference: "dqnamo · Scramble Text",
    tags: ["React"],
    files: demo("scramble-text"),
  },
  {
    slug: "logo-trace-loader",
    name: "Logo Trace Loader",
    summary:
      "A comet chases round the logo outline while loading, then closes the outline at the same speed, traces the inner line and fades in the filled mark.",
    reference: "dqnamo · Logo Trace Loader",
    tags: ["SVG", "Framer Motion"],
    files: demo("logo-trace-loader"),
  },
  {
    slug: "magnetic-drop-zone",
    name: "Magnetic Drop Zone",
    summary:
      "A drop target that senses a file being dragged nearby, leans toward it, glows under the cursor and changes its copy with proximity.",
    reference: "dqnamo · Magnetic Drop Zone",
    tags: ["React", "Framer Motion"],
    files: demo("magnetic-drop-zone"),
  },
  {
    slug: "scroll-fade-list",
    name: "Scroll Fade List",
    summary:
      "A list whose top and bottom fades are exactly as tall as the distance left to scroll, so the fade never covers what you’ve reached.",
    reference: "dqnamo · Scroll Fade List",
    tags: ["React", "CSS"],
    files: demo("scroll-fade-list"),
  },
  {
    slug: "ticket",
    name: "Ticket",
    summary:
      "An event ticket with V notches, a perforated stub and a sheen, tilting toward the cursor. The whole silhouette is one clip-path polygon driven by CSS variables.",
    reference: "dqnamo · Ticket",
    tags: ["React", "CSS clip-path"],
    files: demo("ticket"),
  },
  {
    slug: "stamp",
    name: "Stamp",
    summary:
      "A postage-stamp frame with perforations on every edge, generated as one clip-path polygon, around any content.",
    reference: "dqnamo · Stamp",
    tags: ["React", "CSS clip-path"],
    files: demo("stamp"),
  },
  {
    slug: "iridescent-foil",
    name: "Iridescent Foil",
    summary:
      "A holographic surface from layered gradients: a faint rainbow band slid by scroll, oil-slick blobs, and a shine and glare that follow the pointer.",
    reference: "dqnamo · Iridescent Foil",
    tags: ["CSS", "Blend modes"],
    files: demo("iridescent-foil"),
  },
];
