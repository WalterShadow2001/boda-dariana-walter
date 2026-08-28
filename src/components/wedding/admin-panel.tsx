"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Users,
  Check,
  X,
  Loader2,
  Download,
  ArrowLeft,
  ImageIcon,
  Upload,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Settings,
  Calendar,
  MapPin,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Rsvp {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  message: string | null;
  createdAt: string;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

interface Settings {
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  venueLat: string;
  venueLng: string;
}

type Tab = "rsvps" | "photos" | "settings";

export function AdminPanel({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified?: (pwd: string) => void;
}) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("rsvps");

  // RSVP state
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState<Settings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const verify = async () => {
    if (!password) {
      toast({ title: "Ingresa la contraseña", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast({ title: "Contraseña incorrecta", variant: "destructive" });
        return;
      }
      setVerified(true);
      onVerified?.(password);
      toast({ title: "Acceso concedido" });
      await Promise.all([loadRsvps(password), loadPhotos(), loadSettings()]);
    } catch {
      toast({ title: "Error al verificar", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const loadRsvps = async (pwd: string) => {
    setLoadingRsvps(true);
    try {
      const res = await fetch("/api/rsvp", {
        headers: { "x-admin-password": pwd },
      });
      const data = await res.json();
      setRsvps(data.rsvps || []);
    } catch {
      toast({ title: "Error al cargar la lista", variant: "destructive" });
    } finally {
      setLoadingRsvps(false);
    }
  };

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const res = await fetch("/api/photos");
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      // ignore
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettingsForm(data);
    } catch {
      // ignore
    }
  };

  const saveSettings = async () => {
    if (!settingsForm) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al guardar");
      }
      toast({ title: "✓ Configuración guardada" });
      // Recargar para confirmar
      await loadSettings();
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Comprime una imagen antes de subirla
  const compressImage = (file: File, maxWidth = 1600, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
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
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
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
      loadPhotos();
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

  const [deletingPhoto, setDeletingPhoto] = useState<Photo | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error();
      toast({ title: "Foto eliminada" });
      setDeletingPhoto(null);
      loadPhotos();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const movePhoto = async (id: string, direction: "up" | "down") => {
    const currentIndex = photos.findIndex((p) => p.id === id);
    if (currentIndex === -1) return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    // Swap localmente para feedback inmediato
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(currentIndex, 1);
    newPhotos.splice(newIndex, 0, moved);
    setPhotos(newPhotos);

    setReordering(id);
    try {
      await fetch("/api/photos/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          photos: newPhotos.map((p, i) => ({ id: p.id, order: i })),
        }),
      });
    } catch {
      toast({ title: "Error al reordenar", variant: "destructive" });
      loadPhotos();
    } finally {
      setReordering(null);
    }
  };

  const attending = rsvps.filter((r) => r.attending);
  const notAttending = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + r.guests, 0);

  const exportCSV = () => {
    const headers = ["Nombre", "Asiste", "Invitados", "Mensaje", "Fecha"];
    const rows = rsvps.map((r) => [
      `"${r.name}"`,
      r.attending ? "Sí" : "No",
      r.guests,
      `"${r.message || ""}"`,
      new Date(r.createdAt).toLocaleString("es-MX"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmaciones-cena.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!verified) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-stone-50/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 max-w-md w-full text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-amber-700/60 hover:text-amber-700 p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4 sm:mb-6 pulse-gold">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif italic text-gold-gradient mb-2">
            Panel Privado
          </h2>
          <p className="text-stone-700/70 font-display text-lg sm:text-xl italic mb-6 sm:mb-8 px-2">
            Ingresa la contraseña para administrar
          </p>

          <div className="space-y-4 text-left">
            <div>
              <Label htmlFor="pwd" className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-xl">
                Contraseña
              </Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                placeholder="••••••••"
                className="mt-2 bg-white/80 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-lg sm:text-xl tracking-widest h-11"
                autoFocus
              />
            </div>

            <Button
              onClick={verify}
              disabled={verifying}
              className="w-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 hover:from-amber-600 hover:via-amber-400 hover:to-amber-500 text-white font-medium tracking-widest uppercase rounded-full h-12 sm:py-6 text-lg sm:text-xl"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Ingresar
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-stone-50/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif italic text-gold-gradient truncate">
              Panel de Administración
            </h1>
            <p className="text-stone-700/60 font-display text-lg sm:text-xl mt-1">
              Contraseña verificada ✓
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-amber-600/40 text-amber-700 hover:bg-amber-400/10 h-9 sm:h-10 px-2 sm:px-3 text-lg sm:text-xl shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 border-b border-amber-600/20">
          <button
            onClick={() => setActiveTab("rsvps")}
            className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-display text-lg sm:text-xl border-b-2 transition-all ${
              activeTab === "rsvps"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-700/60 hover:text-stone-800"
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Confirmaciones</span>
            {rsvps.length > 0 && (
              <span className="ml-1 bg-amber-600/20 text-amber-700 text-lg px-1.5 py-0.5 rounded-full">
                {rsvps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-display text-lg sm:text-xl border-b-2 transition-all ${
              activeTab === "photos"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-700/60 hover:text-stone-800"
            }`}
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Fotos</span>
            {photos.length > 0 && (
              <span className="ml-1 bg-amber-600/20 text-amber-700 text-lg px-1.5 py-0.5 rounded-full">
                {photos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-display text-lg sm:text-xl border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-700/60 hover:text-stone-800"
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Configuración</span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "rsvps" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-amber-600/30">
                <Check className="w-5 h-5 sm:w-7 sm:h-7 text-amber-700 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-4xl font-serif text-amber-700 leading-none">{attending.length}</div>
                <div className="text-[15px] sm:text-xl uppercase tracking-widest text-stone-700/60 mt-1">
                  Confirmados
                </div>
              </div>
              <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-amber-500/20">
                <Users className="w-5 h-5 sm:w-7 sm:h-7 text-amber-700 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-4xl font-serif text-amber-600 leading-none">{totalGuests}</div>
                <div className="text-[15px] sm:text-xl uppercase tracking-widest text-stone-700/60 mt-1">
                  Invitados
                </div>
              </div>
              <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-stone-700/30">
                <X className="w-5 h-5 sm:w-7 sm:h-7 text-stone-800 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-4xl font-serif text-stone-800 leading-none">{notAttending.length}</div>
                <div className="text-[15px] sm:text-xl uppercase tracking-widest text-stone-700/60 mt-1">
                  No asistirán
                </div>
              </div>
            </div>

            {/* Export button */}
            {rsvps.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={exportCSV}
                  className="border-amber-600/40 text-amber-700 hover:bg-amber-400/10 h-9 sm:h-10 text-lg sm:text-xl"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            )}

            {/* Lists */}
            {loadingRsvps ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Attending */}
                <div>
                  <h2 className="text-lg sm:text-xl font-serif text-amber-700 mb-3 sm:mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Confirmados ({attending.length})
                  </h2>
                  <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                    {attending.length === 0 ? (
                      <p className="text-stone-700/40 text-lg italic">Aún nadie ha confirmado</p>
                    ) : (
                      attending.map((r) => (
                        <div
                          key={r.id}
                          className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border-amber-600/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-display text-lg sm:text-xl text-stone-800 truncate">{r.name}</div>
                              <div className="text-lg sm:text-xl text-amber-700/80">
                                {r.guests} {r.guests === 1 ? "invitado" : "invitados"}
                              </div>
                            </div>
                            <div className="text-[16px] sm:text-xl text-stone-700/40 shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("es-MX")}
                            </div>
                          </div>
                          {r.message && (
                            <p className="mt-2 text-lg sm:text-xl text-stone-700/70 italic font-display border-l-2 border-amber-600/30 pl-2 sm:pl-3 break-words">
                              {r.message}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Not attending */}
                <div>
                  <h2 className="text-lg sm:text-xl font-serif text-stone-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    No asistirán ({notAttending.length})
                  </h2>
                  <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                    {notAttending.length === 0 ? (
                      <p className="text-stone-700/40 text-lg italic">Nadie ha declinado aún</p>
                    ) : (
                      notAttending.map((r) => (
                        <div
                          key={r.id}
                          className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border-stone-700/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-display text-lg sm:text-xl text-stone-800 truncate min-w-0 flex-1">{r.name}</div>
                            <div className="text-[16px] sm:text-xl text-stone-700/40 shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("es-MX")}
                            </div>
                          </div>
                          {r.message && (
                            <p className="mt-2 text-lg sm:text-xl text-stone-700/70 italic font-display border-l-2 border-amber-600/30 pl-2 sm:pl-3 break-words">
                              {r.message}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "photos" && (
          <>
            {/* Upload panel */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 border-amber-600/30">
              <h3 className="font-serif text-lg sm:text-xl text-stone-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                Subir nueva foto
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-white/70 border-amber-600/30 text-stone-800 file:bg-amber-500/20 file:text-amber-700 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:font-sans text-lg sm:text-xl h-10 sm:h-11"
                />
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-lg sm:text-xl h-10 sm:h-11"
                />
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-medium tracking-wider uppercase rounded-full h-11 text-lg sm:text-xl"
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
                <p className="text-[16px] sm:text-xl text-stone-700/50 text-center">
                  Las imágenes se comprimen automáticamente (máx 1600px de ancho)
                </p>
              </div>
            </div>

            {/* Photo management grid */}
            {loadingPhotos ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-xl sm:rounded-2xl">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700/30 mx-auto mb-3" />
                <p className="text-stone-700/50 font-display text-lg sm:text-xl italic px-2">
                  Aún no hay fotos
                </p>
                <p className="text-stone-700/40 text-lg sm:text-xl mt-2">
                  Sube la primera foto desde el panel de arriba
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    layout
                    className={`relative group rounded-lg sm:rounded-xl overflow-hidden border border-amber-600/30 bg-stone-100 ${reordering === photo.id ? "ring-2 ring-amber-500" : ""}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || "Foto"}
                      className="w-full aspect-square object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-[16px] sm:text-xl font-display italic line-clamp-2">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                    {/* Order controls */}
                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                      <button
                        onClick={() => movePhoto(photo.id, "up")}
                        disabled={i === 0}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => movePhoto(photo.id, "down")}
                        disabled={i === photos.length - 1}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    {/* Delete button - SIEMPRE VISIBLE, más grande y rojo */}
                    <button
                      onClick={() => setDeletingPhoto(photo)}
                      className="absolute top-1 right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 flex items-center justify-center shadow-lg transition-all z-20"
                      title="Eliminar foto"
                      aria-label="Eliminar foto"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    {/* Order number */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-600/80 flex items-center justify-center text-white text-[16px] font-bold">
                      {i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "settings" && (
          <>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border-amber-600/30">
              <h3 className="font-serif text-lg sm:text-xl text-stone-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                Configuración del evento
              </h3>
              <p className="text-lg sm:text-xl text-stone-700/60 mb-4 sm:mb-6 font-display italic">
                Cambia la fecha, hora y lugar de la cena. Los cambios se reflejan inmediatamente en la invitación.
              </p>

              {!settingsForm ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-700 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {/* Fecha y hora */}
                  <div>
                    <Label className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-xl flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Fecha y hora de la cena
                    </Label>
                    <Input
                      type="datetime-local"
                      value={toLocalDatetimeInput(settingsForm.weddingDate)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;
                        // Convertir de datetime-local (YYYY-MM-DDTHH:mm) a ISO string
                        const isoDate = new Date(value).toISOString();
                        setSettingsForm({ ...settingsForm, weddingDate: isoDate });
                      }}
                      className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 font-display text-lg sm:text-xl h-10 sm:h-11"
                    />
                    <p className="text-[16px] sm:text-xl text-stone-700/50 mt-1">
                      Formato: AAAA-MM-DD HH:MM (24 hrs)
                    </p>
                  </div>

                  {/* Nombre del lugar */}
                  <div>
                    <Label className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-xl flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Nombre del lugar
                    </Label>
                    <Input
                      value={settingsForm.venueName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, venueName: e.target.value })}
                      placeholder="Ej: Restaurante San Ángel"
                      className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-lg sm:text-xl h-10 sm:h-11"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <Label className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-xl flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Dirección
                    </Label>
                    <Input
                      value={settingsForm.venueAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, venueAddress: e.target.value })}
                      placeholder="Calle, número, colonia, ciudad"
                      className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-lg sm:text-xl h-10 sm:h-11"
                    />
                  </div>

                  {/* URL de Google Maps */}
                  <div>
                    <Label className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-xl flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Enlace de Google Maps
                    </Label>
                    <Input
                      value={settingsForm.venueMapsUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, venueMapsUrl: e.target.value })}
                      placeholder="https://www.google.com/maps/place/..."
                      className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-mono text-lg sm:text-xl h-10 sm:h-11"
                    />
                    <p className="text-[16px] sm:text-xl text-stone-700/50 mt-1">
                      Tip: Busca el lugar en Google Maps, click en "Compartir" → "Copiar enlace" y pégalo aquí. Las coordenadas se detectan automáticamente del enlace.
                    </p>
                  </div>

                  {/* Vista previa del mapa */}
                  {settingsForm.venueMapsUrl && (
                    <div className="rounded-lg overflow-hidden border border-amber-600/20 aspect-video bg-stone-100">
                      <iframe
                        title="Vista previa"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(settingsForm.venueName || settingsForm.venueAddress)}&z=15&output=embed`}
                        className="w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Botón guardar */}
                  <Button
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-medium tracking-wider uppercase rounded-full h-11 text-lg sm:text-xl"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar foto */}
      <AnimatePresence>
        {deletingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeletingPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">¿Eliminar foto?</h3>
                <p className="text-stone-700/70 text-lg mb-2 font-display">
                  Esta acción no se puede deshacer.
                </p>
                {deletingPhoto.caption && (
                  <p className="text-stone-600 text-lg italic mb-4 px-4">
                    "{deletingPhoto.caption}"
                  </p>
                )}
                {!deletingPhoto.caption && (
                  <div className="mb-4" />
                )}
                {/* Preview de la foto */}
                <div className="rounded-lg overflow-hidden mb-6 max-h-40 mx-auto border border-stone-200">
                  <img
                    src={deletingPhoto.url}
                    alt={deletingPhoto.caption || "Foto a eliminar"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingPhoto(null)}
                    className="flex-1 px-4 py-3 rounded-full border border-stone-300 text-stone-700 text-lg font-medium uppercase tracking-wider hover:bg-stone-50 transition-colors"
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deletingPhoto.id)}
                    className="flex-1 px-4 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-lg font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper: convertir ISO string a formato YYYY-MM-DDTHH:mm para input datetime-local
function toLocalDatetimeInput(isoString: string): string {
  try {
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset en ms
    const local = new Date(d.getTime() - tzOffset);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export function AdminLockButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Panel de administración"
      title="Panel de administración"
      className="hidden md:flex fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-amber-600/30 items-center justify-center text-amber-700/70 hover:text-amber-600 hover:scale-110 hover:border-amber-600/60 transition-all shadow-lg group"
    >
      <Lock className="w-5 h-5" />
      <span className="absolute inset-0 rounded-full bg-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-ping" />
    </button>
  );
}
