"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculate(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ targetDate }: { targetDate: string }) {
  // Compute target once. Initial state also computed once.
  const [target] = useState(() => new Date(targetDate));
  const [time, setTime] = useState<TimeLeft>(() => calculate(new Date(targetDate)));

  useEffect(() => {
    const i = setInterval(() => setTime(calculate(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  const items = [
    { label: "Días", value: time.days },
    { label: "Horas", value: time.hours },
    { label: "Minutos", value: time.minutes },
    { label: "Segundos", value: time.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
      {items.map((it) => (
        <div
          key={it.label}
          className="glass-card rounded-lg p-3 sm:p-4 text-center"
        >
          <div className="text-3xl sm:text-5xl font-serif text-amber-300 tabular-nums">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-amber-100/60 mt-1">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
