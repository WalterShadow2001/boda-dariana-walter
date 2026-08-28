"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Loader2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/photos");
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section id="fotos" className="py-12 sm:py-20 px-4 sm:px-6 relative scroll-mt-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            Galería de Momentos
          </h2>
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-4 sm:my-6">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
          <p className="text-stone-800/70 font-display text-sm sm:text-lg italic px-2">
            Compartimos con ustedes nuestros momentos más preciados
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl sm:rounded-2xl">
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700/30 mx-auto mb-3" />
            <p className="text-stone-700/50 font-display text-base sm:text-lg italic px-2">
              Aún no hay fotos compartidas
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-2 sm:gap-4 mt-6 sm:mt-8">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
                className="relative group break-inside-avoid mb-2 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden border border-amber-600/20 cursor-pointer"
                onClick={() => setSelected(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto de la cena"}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
                    <p className="text-white text-sm sm:text-base font-display italic">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-5xl max-h-full"
          >
            <img
              src={selected.url}
              alt={selected.caption || "Foto de la cena"}
              className="max-w-full max-h-[80vh] sm:max-h-[85vh] rounded-lg border border-amber-600/30"
            />
            {selected.caption && (
              <p className="text-center text-white mt-4 font-display italic text-sm sm:text-lg px-2">
                {selected.caption}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
