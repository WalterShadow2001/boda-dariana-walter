"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  data: string;
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
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({ data: base64, caption }),
        });
        if (!res.ok) throw new Error();
        toast({ title: "Foto subida con éxito" });
        setFile(null);
        setCaption("");
        load();
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Error al subir la foto", variant: "destructive" });
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
    <section id="fotos" className="py-20 px-4 relative scroll-mt-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            Galería de Momentos
          </h2>
          <div className="flex items-center justify-center gap-4 my-6">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
          <p className="text-amber-50/70 font-display text-lg italic">
            Compartimos con ustedes nuestros momentos más preciados
          </p>
        </motion.div>

        {adminPassword && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mt-8 mb-8 border-violet-500/30"
          >
            <h3 className="font-serif text-xl text-amber-100 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-400" />
              Subir nueva foto
            </h3>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-black/30 border-amber-400/30 text-amber-50 file:bg-amber-500/20 file:text-amber-200 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:font-sans"
              />
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descripción de la foto (opcional)"
                className="bg-black/30 border-amber-400/30 text-amber-50 placeholder:text-amber-100/30 font-display"
              />
              <Button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium tracking-wider uppercase rounded-full"
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
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <ImageIcon className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
            <p className="text-amber-100/50 font-display text-lg italic">
              Aún no hay fotos compartidas
            </p>
            {adminPassword && (
              <p className="text-amber-100/40 text-sm mt-2">
                Sube la primera foto desde el panel de arriba
              </p>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 mt-8">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
                className="relative group break-inside-avoid mb-4 rounded-xl overflow-hidden border border-amber-400/20 cursor-pointer"
                onClick={() => setSelected(photo)}
              >
                <img
                  src={photo.data}
                  alt={photo.caption || "Foto de la boda"}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-amber-50 text-sm font-display italic">
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
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
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
              src={selected.data}
              alt={selected.caption || "Foto de la boda"}
              className="max-w-full max-h-[85vh] rounded-lg border border-amber-400/30"
            />
            {selected.caption && (
              <p className="text-center text-amber-100 mt-4 font-display italic text-lg">
                {selected.caption}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
