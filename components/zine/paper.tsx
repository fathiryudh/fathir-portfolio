// Cut-and-paste building blocks for the zine look: torn edges, starbursts, barcodes.
// Randomness is seeded so server and client render identical shapes.

export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A clip-path polygon with ragged edges, like paper torn by hand. `amplitude` is
// how deep the tears bite into the top and bottom edges, as a percentage of height.
export function torn(seed: number, amplitude: number, steps = 22) {
  const random = seeded(seed);
  const edge = () => random() * amplitude;
  const pct = (value: number) => `${value.toFixed(2)}%`;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) points.push(`${pct((i / steps) * 100)} ${pct(edge())}`);
  for (let i = 1; i < steps; i++) points.push(`${pct(100 - edge() / 2)} ${pct((i / steps) * 100)}`);
  for (let i = steps; i >= 0; i--) points.push(`${pct((i / steps) * 100)} ${pct(100 - edge())}`);
  for (let i = steps - 1; i > 0; i--) points.push(`${pct(edge() / 2)} ${pct((i / steps) * 100)}`);
  return `polygon(${points.join(", ")})`;
}

// Small seeded tilt in degrees, for scattering stickers and scraps.
export function tilt(seed: number, max = 4) {
  return Number(((seeded(seed)() * 2 - 1) * max).toFixed(1));
}

function starburstPoints(seed: number, spikes = 14) {
  const random = seeded(seed);
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI * i) / spikes;
    const radius = i % 2 === 0 ? 48 + random() * 2 : 30 + random() * 8;
    points.push(`${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

export function Starburst({
  seed,
  className = "",
  children,
}: {
  seed: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`burst ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon points={starburstPoints(seed)} />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function Barcode({ seed, digits, className = "" }: { seed: number; digits: string; className?: string }) {
  const random = seeded(seed);
  const bars = Array.from({ length: 34 }, () => ({
    width: 1 + Math.floor(random() * 3),
    gap: 1 + Math.floor(random() * 2),
  }));

  return (
    <div className={`barcode ${className}`} aria-hidden="true">
      <div className="barcode__bars">
        {bars.map((bar, index) => (
          <i key={index} style={{ width: bar.width, marginRight: bar.gap }} />
        ))}
      </div>
      <span>{digits}</span>
    </div>
  );
}
