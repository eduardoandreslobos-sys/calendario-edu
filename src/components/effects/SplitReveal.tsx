"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface Props {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  duration?: number;
  by?: "words" | "chars";
  className?: string;
  y?: number;
}

/**
 * Lightweight split-text reveal — no GSAP SplitText plugin needed.
 * Wraps each word/char in a span and staggers a translateY + opacity rise.
 */
export function SplitReveal({
  children,
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  by = "words",
  className,
  y = 60,
}: Props) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const text = el.textContent ?? "";
    const tokens = by === "words" ? text.split(/(\s+)/) : Array.from(text);

    el.textContent = "";
    const pieces: HTMLSpanElement[] = [];
    tokens.forEach((tok) => {
      if (/^\s+$/.test(tok)) {
        el.appendChild(document.createTextNode(tok));
        return;
      }
      const span = document.createElement("span");
      span.textContent = tok;
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      el.appendChild(span);
      pieces.push(span);
    });

    if (reduced) return;

    gsap.set(pieces, { opacity: 0, yPercent: 100, y });
    const tw = gsap.to(pieces, {
      opacity: 1,
      yPercent: 0,
      y: 0,
      duration,
      ease: "expo.out",
      stagger,
      delay,
    });

    return () => {
      tw.kill();
    };
  }, [by, delay, duration, stagger, y]);

  return (
    <span ref={wrap} className={className}>
      {children}
    </span>
  );
}
