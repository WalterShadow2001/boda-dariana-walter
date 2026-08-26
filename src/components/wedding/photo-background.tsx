"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

interface PhotoBackgroundProps {
  photos: Photo[];
  sectionsCount: number;
}

/**
 * Fondo de fotos fijas que cambian (crossfade) conforme bajas en la página.
 * Las fotos se muestran en semi-transparente para no competir con el contenido.
 */
export function PhotoBackground({ photos, sectionsCount }: PhotoBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (photos.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = Math.min(1, Math.max(0, scrollY / totalHeight));
      // Mapear el progreso a índices de fotos
      const index = Math.min(
        photos.length - 1,
        Math.floor(progress * photos.length * sectionsCount / Math.max(1, sectionsCount))
      );
      setCurrentIndex(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [photos, sectionsCount]);

  if (photos.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.18, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${photos[currentIndex].url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "grayscale(0.3) contrast(1.05)",
          }}
        />
      </AnimatePresence>

      {/* Gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(250, 248, 243, 0.85) 0%, rgba(250, 248, 243, 0.75) 50%, rgba(250, 248, 243, 0.85) 100%)",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10, 10, 10, 0.15) 100%)",
        }}
      />

      {/* Photo counter indicator (subtle) */}
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {photos.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex % 8 ? "bg-amber-600 w-4" : "bg-amber-600/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
