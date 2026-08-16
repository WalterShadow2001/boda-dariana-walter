"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Users, Check, X, Loader2, Download, ArrowLeft } from "lucide-react";
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
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loadingList, setLoadingList] = useState(false);

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
      await loadRsvps(password);
    } catch {
      toast({ title: "Error al verificar", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const loadRsvps = async (pwd: string) => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/rsvp", {
        headers: { "x-admin-password": pwd },
      });
      const data = await res.json();
      setRsvps(data.rsvps || []);
    } catch {
      toast({ title: "Error al cargar la lista", variant: "destructive" });
    } finally {
      setLoadingList(false);
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
    a.download = "confirmaciones-boda.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!verified) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 max-w-md w-full text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-amber-200/60 hover:text-amber-200 p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 pulse-gold">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif italic text-gold-gradient mb-2">
            Panel Privado
          </h2>
          <p className="text-amber-100/70 font-display text-sm sm:text-lg italic mb-6 sm:mb-8 px-2">
            Ingresa la contraseña para administrar
          </p>

          <div className="space-y-4 text-left">
            <div>
              <Label htmlFor="pwd" className="text-amber-200/80 tracking-widest uppercase text-[10px] sm:text-xs">
                Contraseña
              </Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                placeholder="••••••••"
                className="mt-2 bg-black/40 border-amber-400/30 text-amber-50 placeholder:text-amber-100/30 font-display text-base sm:text-lg tracking-widest h-11"
                autoFocus
              />
            </div>

            <Button
              onClick={verify}
              disabled={verifying}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 hover:from-amber-500 hover:via-amber-300 hover:to-amber-500 text-black font-medium tracking-widest uppercase rounded-full h-12 sm:py-6 text-sm sm:text-base"
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

            <p className="text-[10px] sm:text-xs text-amber-100/40 text-center mt-4 px-2">
              Contraseña por defecto: <span className="text-amber-300/70 font-mono">boda2026</span>
              <br />
              (cámbiala en <code className="text-amber-300/70">src/lib/wedding-config.ts</code>)
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif italic text-gold-gradient truncate">
              Panel de Confirmaciones
            </h1>
            <p className="text-amber-100/60 font-display text-xs sm:text-sm mt-1">
              Contraseña verificada ✓
            </p>
          </div>
          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-emerald-500/20">
            <Check className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400 mx-auto mb-1 sm:mb-2" />
            <div className="text-xl sm:text-4xl font-serif text-emerald-300 leading-none">{attending.length}</div>
            <div className="text-[9px] sm:text-xs uppercase tracking-widest text-amber-100/60 mt-1">
              Confirmados
            </div>
          </div>
          <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-amber-500/20">
            <Users className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 mx-auto mb-1 sm:mb-2" />
            <div className="text-xl sm:text-4xl font-serif text-amber-300 leading-none">{totalGuests}</div>
            <div className="text-[9px] sm:text-xs uppercase tracking-widest text-amber-100/60 mt-1">
              Invitados
            </div>
          </div>
          <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 text-center border-rose-500/20">
            <X className="w-5 h-5 sm:w-7 sm:h-7 text-rose-400 mx-auto mb-1 sm:mb-2" />
            <div className="text-xl sm:text-4xl font-serif text-rose-300 leading-none">{notAttending.length}</div>
            <div className="text-[9px] sm:text-xs uppercase tracking-widest text-amber-100/60 mt-1">
              No asistirán
            </div>
          </div>
        </div>

        {/* Lists */}
        {loadingList ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Attending */}
            <div>
              <h2 className="text-base sm:text-xl font-serif text-emerald-300 mb-3 sm:mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Confirmados ({attending.length})
              </h2>
              <div className="space-y-2 sm:space-y-3 max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                {attending.length === 0 ? (
                  <p className="text-amber-100/40 text-sm italic">Aún nadie ha confirmado</p>
                ) : (
                  attending.map((r) => (
                    <div
                      key={r.id}
                      className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border-emerald-500/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-display text-sm sm:text-lg text-amber-50 truncate">{r.name}</div>
                          <div className="text-xs sm:text-sm text-emerald-300/80">
                            {r.guests} {r.guests === 1 ? "invitado" : "invitados"}
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-amber-100/40 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("es-MX")}
                        </div>
                      </div>
                      {r.message && (
                        <p className="mt-2 text-xs sm:text-sm text-amber-100/70 italic font-display border-l-2 border-amber-400/30 pl-2 sm:pl-3 break-words">
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
              <h2 className="text-base sm:text-xl font-serif text-rose-300 mb-3 sm:mb-4 flex items-center gap-2">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                No asistirán ({notAttending.length})
              </h2>
              <div className="space-y-2 sm:space-y-3 max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                {notAttending.length === 0 ? (
                  <p className="text-amber-100/40 text-sm italic">Nadie ha declinado aún</p>
                ) : (
                  notAttending.map((r) => (
                    <div
                      key={r.id}
                      className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border-rose-500/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-display text-sm sm:text-lg text-amber-50 truncate min-w-0 flex-1">{r.name}</div>
                        <div className="text-[10px] sm:text-xs text-amber-100/40 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("es-MX")}
                        </div>
                      </div>
                      {r.message && (
                        <p className="mt-2 text-xs sm:text-sm text-amber-100/70 italic font-display border-l-2 border-amber-400/30 pl-2 sm:pl-3 break-words">
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
      </div>
    </motion.div>
  );
}

export function AdminLockButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Panel de administración"
      title="Panel de administración"
      className="hidden md:flex fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 items-center justify-center text-amber-400/70 hover:text-amber-300 hover:scale-110 hover:border-amber-400/60 transition-all shadow-lg group"
    >
      <Lock className="w-5 h-5" />
      <span className="absolute inset-0 rounded-full bg-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-ping" />
    </button>
  );
}
