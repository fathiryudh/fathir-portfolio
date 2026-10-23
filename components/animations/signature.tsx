const DEFAULT_SIGNATURE_PATH =
  "M126.4 164.1 C166.4 156.1 259 148.8 283 148.8 C324.3 150 299 276.7 295.5 324.1 C289.2 368.9 262.9 382.1 233.3 337.2 C213.9 310 221.2 240 360.2 244.9 C362 288.1 349.3 387.5 344.7 458.2 C344.7 458.2 348.9 289.8 382.8 245.7 C404.5 222.9 450.3 223.3 442.3 269.4 C414.9 328.6 344.9 333.4 316.2 334.3 C340.2 334.3 547.2 320.3 571.2 320.3";
const DEFAULT_SIGNATURE_EASING = "cubic-bezier(0.2, 0.2, 0.8, 0.9)";

export type SignatureStroke = {
  d: string;
  length: number;
};

export type SignatureData = {
  viewBox: string;
  strokes: SignatureStroke[];
};

type SignatureProps = {
  path?: string;
  strokes?: SignatureStroke[];
  viewBox?: string;
  size?: number | string;
  strokeWidth?: number;
  duration?: number | string;
  delay?: number | string;
  easing?: string;
  className?: string;
  ariaLabel?: string;
};

// Shared by the dev signature pad and the library demo, so a saved signature replays like the demo.
type Point = { x: number; y: number };

export const round = (value: number) => Math.round(value * 10) / 10;

// Quadratic curves through each sample's midpoints: smooth, and still passes near every point.
export function toPathData(points: Point[]) {
  const [first] = points;
  if (points.length === 1) return `M${round(first.x)} ${round(first.y)} L${round(first.x + 0.1)} ${round(first.y)}`;
  let d = `M${round(first.x)} ${round(first.y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q${round(points[i].x)} ${round(points[i].y)} ${round(midX)} ${round(midY)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${round(last.x)} ${round(last.y)}`;
}

export function strokeLength(points: Point[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return Math.max(length, 1);
}

function toCssTime(value: number | string) {
  return typeof value === "number" ? `${value}s` : value;
}

export function Signature({
  path = DEFAULT_SIGNATURE_PATH,
  strokes,
  viewBox = "0 0 900 460",
  size = "100%",
  strokeWidth = 10,
  duration = 2.8,
  delay = 0,
  easing = DEFAULT_SIGNATURE_EASING,
  className,
  ariaLabel = "Animated signature",
}: SignatureProps) {
  const width = typeof size === "number" ? `${size}px` : size;
  // Multi-stroke signatures draw one stroke after another, each getting a share
  // of the total duration proportional to its length.
  const segments = strokes?.length ? strokes : [{ d: path, length: 1 }];
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
  const starts = segments.map((_, index) =>
    segments.slice(0, index).reduce((sum, segment) => sum + segment.length, 0) / totalLength,
  );

  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      role="img"
      style={{ display: "block", overflow: "visible", width, height: "auto" }}
      viewBox={viewBox}
    >
      {segments.map((segment, index) => {
        const start = starts[index];
        const share = segment.length / totalLength;

        return (
          <path
            key={index}
            className="signature-stroke"
            d={segment.d}
            pathLength={1}
            style={{
              animationDelay: `calc(${toCssTime(delay)} + ${toCssTime(duration)} * ${start})`,
              animationDuration: `calc(${toCssTime(duration)} * ${share})`,
              animationTimingFunction: easing,
              strokeWidth,
            }}
          />
        );
      })}

      <style>{`
        .signature-stroke {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation-name: draw-signature;
          animation-fill-mode: forwards;
        }

        @keyframes draw-signature {
          to {
            stroke-dashoffset: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signature-stroke {
            animation-duration: 1ms !important;
            animation-delay: 0s !important;
          }
        }
      `}</style>
    </svg>
  );
}

export default Signature;
