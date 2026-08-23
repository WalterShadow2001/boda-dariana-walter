"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
}

export function PhotoGallery({ adminPassword }: { adminPassword: string | null }) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

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

  // Comprime una imagen antes de subirla para que no ocupe tanto espacio
  // Max ancho 1600px, calidad 0.85 - resulta en archivos de ~200-500KB
  const compressImage = (file: File, maxWidth = 1600, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Calcular dimensiones manteniendo aspect ratio
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo crear contexto de canvas"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Usar JPEG para fotos (mejor compresión), PNG para transparencias
          const isPng = file.type === "image/png";
          const mime = isPng ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(mime, quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Selecciona una imagen", variant: "destructive" });
      return;
    }
    if (!adminPassword) {
      toast({ title: "Se requiere acceso de administrador", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Comprimir imagen antes de subir
      const compressed = await compressImage(file);
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ data: compressed, caption }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al subir");
      }
      toast({ title: "Foto subida con éxito" });
      setFile(null);
      setCaption("");
      load();
    } catch (err) {
      toast({
        title: "Error al subir la foto",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminPassword) return;
    try {
      const res = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });
      if (!res.ok) throw new Error();
      toast({ title: "Foto eliminada" });
      load();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

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

        {adminPassword && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8 mb-6 sm:mb-8 border-violet-600/30"
          >
            <h3 className="font-serif text-lg sm:text-xl text-stone-700 mb-3 sm:mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-violet-700" />
              Subir nueva foto
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-white/70 border-amber-600/30 text-stone-800 file:bg-amber-500/20 file:text-amber-700 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:font-sans text-xs sm:text-sm h-10 sm:h-11"
              />
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descripción (opcional)"
                className="bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-sm sm:text-base h-10 sm:h-11"
              />
              <Button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium tracking-wider uppercase rounded-full h-11 text-xs sm:text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir foto
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

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
            {adminPassword && (
              <p className="text-stone-700/40 text-xs sm:text-sm mt-2">
                Sube la primera foto desde el panel de arriba
              </p>
            )}
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
                  alt={photo.caption || "Foto de la boda"}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
                    <p className="text-stone-800 text-xs sm:text-sm font-display italic">
                      {photo.caption}
                    </p>
                  </div>
                )}
                {adminPassword && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
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
              alt={selected.caption || "Foto de la boda"}
              className="max-w-full max-h-[80vh] sm:max-h-[85vh] rounded-lg border border-amber-600/30"
            />
            {selected.caption && (
              <p className="text-center text-stone-700 mt-4 font-display italic text-sm sm:text-lg px-2">
                {selected.caption}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
