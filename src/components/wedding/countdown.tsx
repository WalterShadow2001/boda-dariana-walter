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
    <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 max-w-md sm:max-w-xl mx-auto px-1">
      {items.map((it) => (
        <div
          key={it.label}
          className="glass-card rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 text-center"
        >
          <div className="text-xl sm:text-4xl md:text-5xl font-serif text-amber-600 tabular-nums leading-none">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="text-[8px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-stone-700/60 mt-1 sm:mt-2">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
