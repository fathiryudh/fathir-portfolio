"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PiCheckCircleFill, PiCircleNotchBold } from "react-icons/pi";
import styles from "./receipt-printer.module.css";

// A checkout status drawn as a small plastic printer: the screen shows the order, and when payment
// clears a receipt feeds out of the slot in jerky thermal-printer steps. After dqnamo's Receipt
// Printer (Design References/dqnamo.com/Receipt Printer). The parent owns the stage.

export type PrinterStage = "processing" | "printing" | "complete";

const PrinterContext = createContext<{ stage: PrinterStage; reduced: boolean }>({ stage: "processing", reduced: false });

const EASE = [0.23, 1, 0.32, 1] as const;
const LABELS: Record<PrinterStage, string> = {
  processing: "Processing your order",
  printing: "Printing your receipt",
  complete: "Order complete",
};

// Paired keyframes: move, hold, move, hold… with steps that shrink toward the end so it decelerates.
const FEED_Y = ["-99%", "-91%", "-91%", "-81%", "-81%", "-70%", "-70%", "-58%", "-58%", "-45%", "-45%", "-32%", "-32%", "-20%", "-20%", "-10%", "-10%", "-3%", "-3%", "0%"];
const FEED_TIMES = [0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6, 0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1];

const TEETH = 40;
const DEPTH = 4;
const TORN = `polygon(0 0, 100% 0, 100% calc(100% - ${DEPTH}px), ${Array.from({ length: TEETH * 2 }, (_, i) => {
  const x = 100 - ((i + 1) * 100) / (TEETH * 2);
  return `${x}% ${i % 2 === 0 ? "100%" : `calc(100% - ${DEPTH}px)`}`;
}).join(", ")})`;

function Root({ stage, children }: { stage: PrinterStage; children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <PrinterContext.Provider value={{ stage, reduced }}>
      <section className={styles.root} data-stage={stage}>
        {children}
      </section>
    </PrinterContext.Provider>
  );
}

function Machine({ children }: { children: ReactNode }) {
  return (
    <div className={styles.machine}>
      {children}
      <span className={styles.slot} aria-hidden="true" />
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return <div className={styles.screen}>{children}</div>;
}

function Status() {
  const { stage, reduced } = useContext(PrinterContext);
  const done = stage === "complete";
  return (
    <div className={styles.status}>
      <span className={styles.cell}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={done ? "done" : "busy"}
            className={done ? styles.check : styles.spinner}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
            transition={{ duration: 0.16, ease: EASE }}
          >
            {done ? <PiCheckCircleFill /> : <PiCircleNotchBold />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className={styles.cell} role="status" aria-live="polite">
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={stage}
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            {LABELS[stage]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function Output({ children }: { children: ReactNode }) {
  const { stage, reduced } = useContext(PrinterContext);
  const hidden = stage === "processing";
  return (
    <div className={styles.output}>
      <span className={styles.slotShadow} aria-hidden="true" />
      <motion.div
        className={styles.feed}
        initial={false}
        animate={
          hidden
            ? { y: "-99%", opacity: 0 }
            : reduced || stage === "complete"
              ? { y: "0%", opacity: 1 }
              : { y: FEED_Y, opacity: 1 }
        }
        transition={
          hidden || reduced || stage === "complete"
            ? { duration: reduced ? 0.16 : 0.3 }
            : { y: { duration: 1.75, ease: "linear", times: FEED_TIMES }, opacity: { duration: 0.16 } }
        }
        aria-hidden={stage !== "complete"}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Paper({ children }: { children: ReactNode }) {
  return (
    <article className={styles.paper} style={{ clipPath: TORN }}>
      {children}
    </article>
  );
}

export const ReceiptPrinter = { Root, Machine, Screen, Status, Output, Paper };

export default function ReceiptPrinterDemo() {
  const [stage, setStage] = useState<PrinterStage>("processing");
  const [run, setRun] = useState(0);

  useEffect(() => {
    const timers = [window.setTimeout(() => setStage("printing"), 1600), window.setTimeout(() => setStage("complete"), 3600)];
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <div className={styles.stage}>
      <ReceiptPrinter.Root stage={stage}>
        <ReceiptPrinter.Machine>
          <header className={styles.header}>
            <span className={styles.logo}>FY</span>
            <button
              type="button"
              className={styles.again}
              onClick={() => {
                setStage("processing");
                setRun((value) => value + 1);
              }}
            >
              Again
            </button>
          </header>
          <ReceiptPrinter.Screen>
            <p className={styles.plan}>Custom build · Pro</p>
            <p className={styles.total}>$1,200.00</p>
            <ReceiptPrinter.Status />
          </ReceiptPrinter.Screen>
        </ReceiptPrinter.Machine>
        <ReceiptPrinter.Output>
          <ReceiptPrinter.Paper>
            <p className={styles.micro}>Receipt · #2026-0417</p>
            <h3 className={styles.title}>Thanks!</h3>
            <dl className={styles.lines}>
              <div>
                <dt>Website build</dt>
                <dd>$1,000.00</dd>
              </div>
              <div>
                <dt>Hosting, 1 yr</dt>
                <dd>$200.00</dd>
              </div>
              <div className={styles.sum}>
                <dt>Total</dt>
                <dd>$1,200.00</dd>
              </div>
            </dl>
            <span className={styles.barcode} aria-hidden="true" />
          </ReceiptPrinter.Paper>
        </ReceiptPrinter.Output>
      </ReceiptPrinter.Root>
    </div>
  );
}
