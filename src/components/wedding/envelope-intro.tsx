"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { weddingConfig } from "@/lib/wedding-config";
import { Monogram } from "./decorative";

interface EnvelopeProps {
  onOpen: () => void;
}

export function EnvelopeIntro({ onOpen }: EnvelopeProps) {
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);

  // Generar partículas fijas (evita hydration mismatch)
  const [particles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: `${(i * 9 + 5) % 100}%`,
      delay: (i * 0.4) % 4,
      duration: 4 + (i % 3),
    }))
  );

  // Bloquear scroll mientras el sobre está visible
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    // Restaurar el scroll inmediatamente para que la transición se vea bien
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    // Esperar a que termine la animación del sobre (2.5s) + transición suave (1.5s)
    setTimeout(() => {
      setVisible(false);
      onOpen();
    }, 2500);
  }, [opening, onOpen]);

  // Seguridad: si por alguna razón el componente no se desmonta, ocultarlo después de 5s
  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(() => {
      setVisible(false);
      onOpen();
    }, 5000);
    return () => clearTimeout(t);
  }, [opening, onOpen]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{
          background: "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)",
        }}
      >
        {/* Subtle gold shimmer in background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(184, 134, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Floating gold particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-amber-400"
            initial={{
              x: p.x,
              y: "110%",
              opacity: 0,
            }}
            animate={{
              y: "-10%",
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Tags above envelope */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center text-amber-300/70 tracking-[0.4em] uppercase text-[10px] sm:text-xs font-sans mb-6"
          >
            Tienes una invitación
          </motion.p>

          {/* Envelope */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <motion.div
              animate={
                opening
                  ? {
                      y: [0, -8, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {/* Envelope body */}
              <div
                className="relative w-[280px] sm:w-[400px] h-[180px] sm:h-[260px] mx-auto"
                style={{
                  background: "linear-gradient(135deg, #faf8f3 0%, #fffbf2 100%)",
                  boxShadow: "0 30px 60px -15px rgba(184, 134, 11, 0.3), 0 0 0 1px rgba(184, 134, 11, 0.15)",
                  borderRadius: "4px",
                }}
              >
                {/* Gold border accent */}
                <div
                  className="absolute inset-2 border border-amber-600/40 rounded-sm pointer-events-none"
                  style={{ background: "transparent" }}
                />

                {/* Letter peeking out */}
                <motion.div
                  className="absolute inset-x-4 top-3 bottom-3 bg-white rounded-sm shadow-inner overflow-hidden z-10"
                  animate={
                    opening
                      ? {
                          y: -200,
                          opacity: [1, 1, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  style={{
                    boxShadow: "inset 0 0 20px rgba(184, 134, 11, 0.1)",
                  }}
                >
                  <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-start text-center pt-2 sm:pt-3">
                    <Monogram initials="D&W" />
                    <p className="mt-12 sm:mt-16 text-stone-800 font-display italic text-xs sm:text-sm leading-tight">
                      {weddingConfig.bride.shortName} & {weddingConfig.groom.shortName}
                    </p>
                    <div className="mt-2 w-8 h-px bg-amber-600/40" />
                    <p className="mt-2 text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-amber-700/60">
                      Invitación
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Envelope flap (top triangle that opens) */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -top-px w-[280px] sm:w-[400px] h-[90px] sm:h-[130px] origin-top z-30"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                animate={
                  opening
                    ? {
                        rotateX: [0, -180],
                      }
                    : {}
                }
                transition={{ duration: 1.6, ease: "easeInOut" }}
              >
                <svg
                  viewBox="0 0 400 130"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="flapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fffbf2" />
                      <stop offset="100%" stopColor="#faf8f3" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="0,0 400,0 200,130"
                    fill="url(#flapGrad)"
                    stroke="rgba(184, 134, 11, 0.2)"
                    strokeWidth="1"
                  />
                  <polygon
                    points="10,5 390,5 200,120"
                    fill="none"
                    stroke="rgba(184, 134, 11, 0.25)"
                    strokeWidth="0.5"
                  />
                </svg>
              </motion.div>

              {/* Sello dorado - DEBAJO del envelope body en el HTML pero con z-50
                  para que quede POR ENCIMA de TODO (flap tiene z-30) */}
              {!opening && (
                <motion.button
                  onClick={handleOpen}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.6, type: "spring" }}
                  className="absolute left-1/2 top-[130px] sm:top-[190px] -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center z-50 cursor-pointer group active:scale-95 transition-transform"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #d4af37 0%, #b8860b 60%, #8b6914 100%)",
                    boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                  }}
                  type="button"
                  aria-label="Abrir invitación"
                >
                  <span className="text-amber-50 font-serif italic text-lg sm:text-xl leading-none pointer-events-none">
                    D&W
                  </span>
                  <span className="text-amber-100/70 text-[8px] sm:text-[9px] uppercase tracking-widest mt-0.5 pointer-events-none">
                    Abrir
                  </span>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Hint text */}
          {!opening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="text-center text-amber-300/50 text-[10px] sm:text-xs tracking-[0.3em] uppercase mt-8 font-sans"
            >
              Toca el sello para abrir
            </motion.p>
          )}

          {/* Botón de respaldo (texto) por si el sello no responde */}
          {!opening && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              onClick={handleOpen}
              type="button"
              className="block mx-auto mt-6 px-6 py-3 text-amber-200 text-xs uppercase tracking-widest border border-amber-400/40 rounded-full hover:bg-amber-400/10 active:scale-95 transition-all"
              style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
            >
              Abrir invitación
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
