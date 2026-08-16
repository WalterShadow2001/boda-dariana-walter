"use client";

import { motion } from "framer-motion";

interface DividerProps {
  symbol?: string;
  className?: string;
}

export function DecorativeDivider({ symbol = "✦", className = "" }: DividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`flex items-center justify-center gap-4 my-8 ${className}`}
    >
      <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-amber-500/60" />
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-amber-400">
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
          </g>
        </svg>
      </div>
      <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-amber-500/60" />
    </motion.div>
  );
}

export function Monogram({ initials = "M&A" }: { initials?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="text-amber-400">
        <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
        <text
          x="40"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-playfair), serif"
          fontSize="28"
          fill="currentColor"
          fontStyle="italic"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

export function FloralCorner({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-16 h-16 text-amber-400/40 ${flip ? "scale-x-[-1]" : ""} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
    >
      <path d="M5 5 Q 20 10, 30 25 Q 35 35, 40 50" />
      <path d="M5 5 Q 10 20, 25 30 Q 35 35, 50 40" />
      <circle cx="15" cy="15" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="28" cy="28" r="2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" fillOpacity="0.6" />
      <path d="M10 25 Q 15 20, 22 22 Q 18 28, 10 25 Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M22 35 Q 28 30, 35 32 Q 30 38, 22 35 Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}
