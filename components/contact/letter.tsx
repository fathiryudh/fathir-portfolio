"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { EMAIL } from "@/lib/site-content";
import "./letter.css";

// A contact form dressed as a letter on a desk: a ruled sheet you write on, a
// signature you draw in a pop-up pad, and a receipt stub that fills in once the
// letter is posted. Sending hands the letter to the visitor's mail app.

const KINDS = ["A project", "A role", "Just saying hi"] as const;
const LINE = 30; // px between ruled lines; the textarea line-height matches
const INK = "#1b2440";
const PEN_WIDTH = 2.4;

type Kind = (typeof KINDS)[number];
type Point = { x: number; y: number; t: number; p: number };
type Stroke = Point[];
type Field = "email" | "body" | "sign";
type Status = "blank" | "writing" | "signed" | "incomplete" | "posted";

const STATUS_LINE: Record<Status, string> = {
  blank: "NOT YET SIGNED",
  writing: "NOT YET SIGNED",
  signed: "SIGNED, NOT POSTED",
  incomplete: "INCOMPLETE",
  posted: "POSTED",
};

const STUB_STATUS: Record<Status, string> = {
  blank: "ON THE DESK",
  writing: "BEING WRITTEN",
  signed: "SIGNED",
  incomplete: "INCOMPLETE",
  posted: "IN THE POST",
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stamp = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

// Today's date only exists on the client; the server renders the line blank.
const noSubscribe = () => () => {};
const todaySnapshot = () => stamp(new Date());
const serverToday = () => "";

// Strokes are stored in 0–1 pad coordinates so any canvas can redraw them.
// Line width follows pen pressure when there is any, otherwise slows-thick /
// fast-thin like a real nib, then gets smoothed so it never steps.
function drawStroke(ctx: CanvasRenderingContext2D, points: Point[], scale: number) {
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, (PEN_WIDTH * scale) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const widths = points.map((point, i) => {
    const prev = points[Math.max(0, i - 1)];
    if (point.p > 0) return PEN_WIDTH * (0.6 + point.p * 0.95);
    const speed = (Math.hypot(point.x - prev.x, point.y - prev.y) / Math.max(8, point.t - prev.t)) * 16.667;
    return PEN_WIDTH * (1.12 - Math.min(speed / 22, 1) * 0.5);
  });
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < widths.length - 1; i++) {
      widths[i] = (widths[i - 1] + widths[i] * 2 + widths[i + 1]) / 4;
    }
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < points.length; i++) {
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.lineWidth = Math.max(0.4, widths[i] * scale);
    ctx.stroke();
  }
}

// Draws the signature bottom-left aligned into a width × height box, keeping the
// pad's aspect. `progress` (0–1) reveals points in drawing order.
function drawSignature(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  aspect: number,
  progress = 1,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;

  let w = height * aspect;
  let h = height;
  if (w > width) {
    w = width;
    h = width / aspect;
  }
  const top = height - h;
  let budget = Math.ceil(strokes.reduce((sum, s) => sum + s.length, 0) * progress);
  for (const stroke of strokes) {
    if (budget <= 0) break;
    const take = Math.min(stroke.length, budget);
    budget -= take;
    drawStroke(
      ctx,
      stroke.slice(0, take).map((p) => ({ ...p, x: p.x * w, y: top + p.y * h })),
      w / 640,
    );
  }
}

function PostedStamp({ date, seed }: { date: string; seed: number }) {
  const id = `letter-ink-${seed}`;
  return (
    <svg viewBox="0 0 300 132" aria-hidden="true">
      <defs>
        {/* Two noise passes: one roughens the edges, one knocks holes in the ink. */}
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={seed} result="rough" />
          <feDisplacementMap in="SourceGraphic" in2="rough" scale="1.4" result="shifted" />
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed={seed + 7} result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.5 -1.1" result="holes" />
          <feComposite in="shifted" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill="none" stroke="currentColor">
        <rect x="5" y="5" width="290" height="122" rx="7" strokeWidth="4.4" />
        <rect x="14" y="14" width="272" height="104" rx="4" strokeWidth="0.9" />
        <line x1="14" y1="84" x2="286" y2="84" strokeWidth="0.9" />
        <text x="150" y="63" fill="currentColor" stroke="none" textAnchor="middle" fontSize="46" fontWeight="600" letterSpacing="4">
          POSTED
        </text>
        <text x="150" y="107" fill="currentColor" stroke="none" textAnchor="middle" fontSize="17" letterSpacing="4">
          {date}
        </text>
      </g>
    </svg>
  );
}

export default function Letter() {
  const deskRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLFormElement>(null);
  const stubRef = useRef<HTMLElement>(null);
  const rulesRef = useRef<HTMLLabelElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const slipRef = useRef<HTMLDialogElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  const today = useSyncExternalStore(noSubscribe, todaySnapshot, serverToday);
  const [kind, setKind] = useState<Kind>(KINDS[0]);
  const [email, setEmail] = useState("");
  const [via, setVia] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [aspect, setAspect] = useState(640 / 240);
  const [padHasInk, setPadHasInk] = useState(false);
  const [error, setError] = useState<{ field: Field; message: string } | null>(null);
  const [posted, setPosted] = useState<{ ticket: number; on: string; replyBy: string } | null>(null);

  // The pad's strokes change on every pointer sample, so they live in refs and
  // only reach state when the pad closes.
  const padStrokes = useRef<Stroke[]>([]);
  const liveStroke = useRef<Stroke | null>(null);
  const writeNext = useRef(false);

  const signed = strokes.length > 0 || name.trim().length > 1;
  const status: Status = posted
    ? "posted"
    : error
      ? "incomplete"
      : signed
        ? "signed"
        : email.trim() || body.trim()
          ? "writing"
          : "blank";

  // Entrance: the sheet rises onto the desk, the stub drops in after it, and the
  // ruled lines draw across one by one before handing back to the CSS gradient.
  useEffect(() => {
    if (reducedMotion()) return;
    const rules = rulesRef.current;
    const ctx = gsap.context(() => {
      gsap.from(sheetRef.current, { y: 90, duration: 1.6, ease: "expo.out" });
      gsap.from(stubRef.current, { y: -60, duration: 1.2, ease: "expo.out", delay: 0.5 });

      if (!rules) return;
      const count = Math.max(6, Math.round(rules.offsetHeight / LINE));
      const lines = Array.from({ length: count }, () => ({ v: 0 }));
      const paint = () => {
        rules.style.backgroundSize = lines.map((l) => `${(l.v * 100).toFixed(2)}% 1px`).join(",");
      };
      rules.style.backgroundImage = lines.map(() => "linear-gradient(var(--rule), var(--rule))").join(",");
      rules.style.backgroundRepeat = "no-repeat";
      rules.style.backgroundPosition = lines.map((_, i) => `0 ${LINE - 1 + LINE * i}px`).join(",");
      paint();
      gsap.to(lines, {
        v: 1,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.07,
        delay: 0.8,
        onUpdate: paint,
        onComplete: () => {
          rules.style.backgroundImage = "";
          rules.style.backgroundSize = "";
          rules.style.backgroundRepeat = "";
          rules.style.backgroundPosition = "";
        },
      });
    }, deskRef);
    return () => ctx.revert();
  }, []);

  // The stub sits on the desk a little apart from the sheet and drifts against
  // the pointer, so the two read as separate pieces of paper.
  useEffect(() => {
    const stub = stubRef.current;
    if (!stub || reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const toX = gsap.quickTo(stub, "x", { duration: 0.9, ease: "power3.out" });
    const toY = gsap.quickTo(stub, "y", { duration: 0.9, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      toX(-(event.clientX / window.innerWidth - 0.5) * 12);
      toY(-(event.clientY / window.innerHeight - 0.5) * 8);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Paint the signature onto the sheet. A fresh one is written point by point;
  // after that it is only redrawn to stay crisp when the sheet resizes.
  useEffect(() => {
    const canvas = inkRef.current;
    if (!canvas) return;
    const draw = { p: 1 };
    let tween: gsap.core.Tween | null = null;
    if (writeNext.current && strokes.length && !reducedMotion()) {
      draw.p = 0;
      tween = gsap.to(draw, {
        p: 1,
        duration: 0.55,
        ease: "power1.inOut",
        onUpdate: () => drawSignature(canvas, strokes, aspect, draw.p),
      });
    }
    writeNext.current = false;
    const observer = new ResizeObserver(() => drawSignature(canvas, strokes, aspect, draw.p));
    observer.observe(canvas);
    return () => {
      tween?.kill();
      observer.disconnect();
    };
  }, [strokes, aspect]);

  function growBody(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${Math.max(element.scrollHeight, 180)}px`;
  }

  // ---- signature pad ----

  function redrawPad() {
    const canvas = padRef.current;
    if (!canvas) return;
    const all = liveStroke.current ? [...padStrokes.current, liveStroke.current] : padStrokes.current;
    drawSignature(canvas, all, canvas.clientWidth / canvas.clientHeight);
  }

  function openPad() {
    if (posted) return;
    const slip = slipRef.current;
    if (!slip) return;
    padStrokes.current = strokes.map((s) => s.slice());
    setPadHasInk(strokes.length > 0);
    slip.showModal();
    redrawPad();
    if (!reducedMotion()) {
      gsap.fromTo(slip, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "expo.out", clearProps: "transform" });
    }
  }

  function closePad(keep: boolean) {
    const slip = slipRef.current;
    if (!slip) return;
    if (keep) {
      const canvas = padRef.current!;
      const next = padStrokes.current.map((s) => s.slice());
      const nextAspect = canvas.clientWidth / canvas.clientHeight;
      writeNext.current = true;
      setStrokes(next);
      setAspect(nextAspect);
      if (next.length) setError((e) => (e?.field === "sign" ? null : e));
    }
    if (reducedMotion()) {
      slip.close();
      return;
    }
    gsap.to(slip, {
      y: 14,
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        slip.close();
        gsap.set(slip, { clearProps: "all" });
      },
    });
  }

  function padPoint(event: React.PointerEvent<HTMLCanvasElement> | PointerEvent): Point {
    const rect = padRef.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      t: event.timeStamp,
      p: event.pointerType === "pen" ? event.pressure : 0,
    };
  }

  function onPadDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    liveStroke.current = [padPoint(event)];
    redrawPad();
  }

  function onPadMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!liveStroke.current) return;
    // Coalesced events recover the samples the browser merged between frames,
    // which keeps fast flicks smooth instead of polygonal.
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const sample of samples.length ? samples : [event.nativeEvent]) {
      liveStroke.current.push(padPoint(sample));
    }
    redrawPad();
  }

  function onPadUp() {
    if (!liveStroke.current) return;
    padStrokes.current.push(liveStroke.current);
    liveStroke.current = null;
    setPadHasInk(true);
    redrawPad();
  }

  function clearPad() {
    padStrokes.current = [];
    liveStroke.current = null;
    setPadHasInk(false);
    redrawPad();
  }

  function clearSignature() {
    setStrokes([]);
  }

  // ---- sending ----

  function fail(field: Field, message: string) {
    setError({ field, message });
    if (field === "email") emailRef.current?.focus();
    if (field === "body") bodyRef.current?.focus();
    if (field === "sign") openPad();
  }

  function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (posted) return;
    if (!email.trim()) return fail("email", "add a return address so I can write back");
    if (!emailRef.current?.checkValidity()) return fail("email", "that address doesn't look right");
    if (!body.trim()) return fail("body", "the letter is still blank");
    if (!signed) return fail("sign", "sign it, or type your name under the line");
    setError(null);

    const subject = `${kind} — from ${email.trim()}`;
    const sign = name.trim() || email.trim();
    const text = `${body.trim()}\n\n— ${sign}${via.trim() ? `\n\nFound you via: ${via.trim()}` : ""}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

    const now = new Date();
    setPosted({
      ticket: 1000 + (now.getTime() % 9000),
      on: stamp(now),
      replyBy: stamp(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
    });
  }

  // The stamp lands hard and the sheet flinches under it.
  useEffect(() => {
    if (!posted || reducedMotion()) return;
    gsap.fromTo(
      stampRef.current,
      { scale: 1.28, opacity: 0, rotate: -15 },
      { scale: 1, opacity: 1, rotate: -9, duration: 0.34, ease: "expo.out" },
    );
    gsap.to(sheetRef.current, { scale: 0.992, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.inOut", delay: 0.12 });
  }, [posted]);

  const note = (field: Field) =>
    error?.field === field ? (
      <p className="letter__note" id={`letter-note-${field}`} role="alert">
        {error.message}
      </p>
    ) : null;

  return (
    <section
      ref={deskRef}
      className="letter-desk"
      data-error={error?.field}
      data-status={status}
      aria-label="Write me a letter"
    >
      <form ref={sheetRef} className="letter" noValidate onSubmit={onSubmit}>
        <header className="letter__head">
          <span className="letter__mark" aria-hidden="true">
            FY
          </span>
          <div>
            <p className="letter__name">Muhammad Fathir Yudhistira</p>
            <p className="letter__line">Software Builder</p>
            <p className="letter__line">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · Singapore
            </p>
          </div>
          <i className="letter__rule" aria-hidden="true" />
        </header>

        <p className="letter__date">{today || " "}</p>
        <p className="letter__salut">Dear Fathir,</p>

        <fieldset className="letter__re">
          <legend className="letter__label">RE ::</legend>
          {KINDS.map((option) => (
            <label key={option} className="letter__kind">
              <input
                type="radio"
                name="kind"
                value={option}
                checked={kind === option}
                disabled={!!posted}
                onChange={() => setKind(option)}
              />
              <span className="letter__box" aria-hidden="true" />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>

        <label className="letter__field" data-field="email">
          <span className="letter__label">FROM ::</span>
          <input
            ref={emailRef}
            type="email"
            name="email"
            placeholder="you@somewhere.com"
            autoComplete="email"
            required
            readOnly={!!posted}
            value={email}
            aria-describedby={error?.field === "email" ? "letter-note-email" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error?.field === "email") setError(null);
            }}
          />
          <i className="letter__rule" aria-hidden="true" />
        </label>
        {note("email")}

        <label className="letter__field">
          <span className="letter__label">VIA ::</span>
          <input
            type="text"
            name="via"
            maxLength={120}
            placeholder="A friend, LinkedIn, GitHub… (optional)"
            autoComplete="off"
            readOnly={!!posted}
            value={via}
            onChange={(e) => setVia(e.target.value)}
          />
          <i className="letter__rule" aria-hidden="true" />
        </label>

        <label ref={rulesRef} className="letter__body">
          <span className="letter__sr">The letter</span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={6}
            placeholder="What are we building?"
            required
            readOnly={!!posted}
            value={body}
            aria-describedby={error?.field === "body" ? "letter-note-body" : undefined}
            onChange={(e) => {
              setBody(e.target.value);
              growBody(e.target);
              if (error?.field === "body") setError(null);
            }}
          />
        </label>
        {note("body")}

        <p className="letter__close">Sincerely,</p>

        <div
          className="letter__sig"
          data-signed={signed || undefined}
          tabIndex={posted ? -1 : 0}
          role="button"
          aria-label="Sign your name"
          aria-haspopup="dialog"
          onClick={openPad}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPad();
            }
          }}
        >
          <canvas ref={inkRef} className="letter__ink" aria-hidden="true" />
          <span className="letter__ghost" aria-hidden="true">
            sign here
          </span>
          <i className="letter__rule" aria-hidden="true" />
        </div>

        <div className="letter__typed">
          <input
            type="text"
            name="name"
            placeholder="Your name"
            aria-label="Your name"
            autoComplete="name"
            readOnly={!!posted}
            value={name}
            aria-describedby={error?.field === "sign" ? "letter-note-sign" : undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (error?.field === "sign") setError(null);
            }}
          />
          {strokes.length > 0 && !posted && (
            <button type="button" className="letter__link" onClick={clearSignature}>
              clear signature
            </button>
          )}
        </div>
        {note("sign")}

        <footer className="letter__foot">
          <p className="letter__status">
            I READ EVERY ONE · <span aria-live="polite">{STATUS_LINE[status]}</span>
          </p>
          {posted ? (
            <a className="letter__link" href={`mailto:${EMAIL}`}>
              Mail app didn&apos;t open? Write directly
            </a>
          ) : (
            <button type="submit" className="letter__send">
              Post it
            </button>
          )}
        </footer>

        {posted && (
          <div ref={stampRef} className="letter__stamp" aria-hidden="true">
            <PostedStamp date={posted.on} seed={posted.ticket} />
          </div>
        )}
      </form>

      <aside ref={stubRef} className="letter-stub" aria-label="Postage receipt">
        <p className="letter-stub__head">FY :: OUTBOX</p>
        <p className="letter-stub__sub">SINGAPORE · DESK 01</p>
        <dl className="letter-stub__rows">
          <div>
            <dt>TICKET</dt>
            <dd data-empty={!posted || undefined}>{posted ? `N° ${posted.ticket}` : "——"}</dd>
          </div>
          <div>
            <dt>POSTED</dt>
            <dd data-empty={!posted || undefined}>{posted?.on ?? "——"}</dd>
          </div>
          <div>
            <dt>REPLY BY</dt>
            <dd data-empty={!posted || undefined}>{posted?.replyBy ?? "——"}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{STUB_STATUS[status]}</dd>
          </div>
          <div>
            <dt>FILE UNDER</dt>
            <dd>{kind.toUpperCase()}</dd>
          </div>
        </dl>
        <span className="letter-stub__bars" aria-hidden="true" />
        <p className="letter-stub__foot">KEEP THIS HALF</p>
      </aside>

      <dialog
        ref={slipRef}
        className="letter-slip"
        aria-label="Sign your name"
        onCancel={(e) => {
          e.preventDefault();
          closePad(true);
        }}
        onClick={(e) => {
          if (e.target === slipRef.current) closePad(true);
        }}
      >
        <div className="letter-slip__in">
          <p className="letter-slip__head">
            <span>SIGN HERE</span>
            <span className="letter-slip__hint">FINGER, MOUSE OR PEN</span>
          </p>
          <div className="letter-slip__pad">
            <canvas
              ref={padRef}
              aria-label="Signature pad"
              onPointerDown={onPadDown}
              onPointerMove={onPadMove}
              onPointerUp={onPadUp}
              onPointerCancel={onPadUp}
            />
            <span className="letter-slip__x" aria-hidden="true">
              ✕
            </span>
          </div>
          <div className="letter-slip__foot">
            {padHasInk && (
              <button type="button" className="letter__link" onClick={clearPad}>
                Clear
              </button>
            )}
            <button type="button" className="letter__send" onClick={() => closePad(true)}>
              Done
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
