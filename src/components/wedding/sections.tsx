"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Shirt, Gift, Check, X, Loader2 } from "lucide-react";
import { weddingConfig } from "@/lib/wedding-config";
import { useSettings } from "@/hooks/use-settings";
import { DecorativeDivider, Monogram, FloralCorner } from "./decorative";
import { Countdown } from "./countdown";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HeroSection() {
  const { bride, groom, tagline } = weddingConfig;
  const { settings, loaded } = useSettings();
  const weddingDate = settings.weddingDate;

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 py-16 sm:py-20 text-center overflow-hidden">
      <FloralCorner className="absolute top-4 left-3 sm:top-6 sm:left-6" />
      <FloralCorner className="absolute top-4 right-3 sm:top-6 sm:right-6" flip />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center w-full"
      >
        <Monogram initials={`${bride.shortName[0]}&${groom.shortName[0]}`} />

        <p className="mt-4 sm:mt-6 text-amber-700/70 tracking-[0.25em] sm:tracking-[0.4em] uppercase text-[16px] sm:text-base font-sans">
          {tagline}
        </p>

        <div className="my-5 sm:my-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-[3.5rem] leading-[0.95] sm:text-7xl md:text-8xl font-serif italic text-gold-gradient"
          >
            {bride.shortName}
          </motion.h1>
          <div className="my-2 sm:my-4 flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="text-2xl sm:text-4xl font-serif text-amber-600">&</span>
            <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-[3.5rem] leading-[0.95] sm:text-7xl md:text-8xl font-serif italic text-gold-gradient"
          >
            {groom.shortName}
          </motion.h1>
        </div>

        <p className="text-amber-700/80 text-[14px] sm:text-base tracking-[0.15em] sm:tracking-widest uppercase font-sans px-2">
          {loaded ? `${formatDateLong(weddingDate)} · ${formatTime(weddingDate)} hrs` : "···"}
        </p>

        <DecorativeDivider className="mt-8 sm:mt-12" />

        <p className="max-w-md text-stone-800/80 text-sm sm:text-lg font-display leading-relaxed italic px-1">
          {weddingConfig.invitationText}
        </p>

        <div className="mt-8 sm:mt-10 w-full">
          <Countdown targetDate={weddingDate} />
        </div>

        <a
          href="#rsvp"
          className="mt-8 sm:mt-12 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium uppercase tracking-widest text-white hover:scale-105 transition-transform shadow-lg shadow-amber-700/20"
        >
          {weddingConfig.ctaText}
        </a>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="text-amber-700/60 text-[16px] tracking-widest">▼</div>
      </div>
    </section>
  );
}

export function DetailsSection() {
  const { additionalInfo } = weddingConfig;
  const { settings, loaded } = useSettings();

  const items = [
    {
      icon: Calendar,
      label: "Cuándo",
      value: loaded ? formatDateLong(settings.weddingDate) : "···",
    },
    {
      icon: Clock,
      label: "Hora",
      value: loaded ? `${formatTime(settings.weddingDate)} hrs` : "···",
    },
    {
      icon: MapPin,
      label: "Dónde",
      value: loaded ? settings.venueName : "···",
    },
    {
      icon: Shirt,
      label: "Vestimenta",
      value: additionalInfo.dressCode,
    },
  ];

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            La Cena
          </h2>
          <DecorativeDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mt-8 sm:mt-10">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:border-amber-600/50 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center border border-amber-600/40">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[16px] sm:text-base uppercase tracking-widest text-amber-700/60">
                  {item.label}
                </div>
                <div className="text-base sm:text-lg font-display text-stone-800 break-words">
                  {item.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {additionalInfo.giftNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-6 sm:mt-10 glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8 flex items-start gap-3 sm:gap-4 max-w-2xl mx-auto"
          >
            <Gift className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl text-stone-700 mb-2">Un detalle opcional</h3>
              <p className="text-stone-800/70 font-display text-sm sm:text-lg leading-relaxed italic">
                {additionalInfo.giftNote}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function LocationSection() {
  const { settings, loaded } = useSettings();

  const openMaps = () => {
    if (settings.venueMapsUrl) {
      window.open(settings.venueMapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-10 mt-6 sm:mt-8"
        >
          <div className="text-center">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-700 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-3xl font-serif text-stone-800 px-2">
              {loaded ? settings.venueName : "···"}
            </h3>
            {loaded && settings.venueAddress && settings.venueAddress.trim() && (
              <p className="text-stone-800/70 font-display text-sm sm:text-lg mt-2 max-w-md mx-auto italic px-2">
                {settings.venueAddress}
              </p>
            )}

            <Button
              onClick={openMaps}
              size="sm"
              className="mt-6 sm:mt-8 sm:size-lg bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 hover:from-amber-600 hover:via-amber-400 hover:to-amber-500 text-white font-medium tracking-wider uppercase rounded-full px-6 sm:px-8 shadow-lg shadow-amber-700/20 h-11 sm:h-12"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Cómo llegar
            </Button>
          </div>

          {/* Embedded map preview */}
          {loaded && (
            <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl overflow-hidden border border-amber-600/20 aspect-video">
              <iframe
                title="Ubicación del evento"
                src={`https://www.google.com/maps?q=${settings.venueLat},${settings.venueLng}&z=15&output=embed`}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ filter: "saturate(0.9)" }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export function RsvpSection() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | "yes" | "no">(null);

  const submit = async () => {
    if (!name.trim()) {
      toast({ title: "Falta tu nombre", variant: "destructive" });
      return;
    }
    if (attending === null) {
      toast({ title: "Selecciona si asistirás", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          attending,
          guests: attending ? guests : 0,
          message,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(attending ? "yes" : "no");
      toast({
        title: attending ? "¡Gracias por confirmar!" : "Lamentamos que no puedas asistir",
        description: attending
          ? `Hemos registrado a ${guests} ${guests === 1 ? "invitado" : "invitados"} a tu nombre.`
          : "Te llevaremos en nuestros corazones.",
      });
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="py-12 sm:py-20 px-4 sm:px-6 relative scroll-mt-10">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            Confirmación
          </h2>
          <DecorativeDivider />
          <p className="text-stone-800/70 font-display text-sm sm:text-lg italic mt-4 px-2">
            Por favor confirma antes del 1 de septiembre
          </p>
        </motion.div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 mt-6 sm:mt-8 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4">
              {done === "yes" ? (
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <X className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-stone-800 mb-2 px-2">
              {done === "yes" ? "¡Nos emociona compartir esta noche contigo!" : "Gracias por avisarnos"}
            </h3>
            <p className="text-stone-800/70 font-display text-base sm:text-lg italic px-2">
              {done === "yes"
                ? `Hemos registrado tu confirmación, ${name.split(" ")[0]}.`
                : "Te llevaremos en nuestros pensamientos."}
            </p>
            <Button
              variant="outline"
              className="mt-6 border-amber-600/40 text-amber-700 hover:bg-amber-400/10 h-11"
              onClick={() => {
                setDone(null);
                setName("");
                setAttending(null);
                setGuests(1);
                setMessage("");
              }}
            >
              Enviar otra confirmación
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-10 mt-6 sm:mt-8 space-y-5 sm:space-y-6"
          >
            <div>
              <Label htmlFor="name" className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-base">
                Nombre completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-base sm:text-lg h-11"
              />
            </div>

            <div>
              <Label className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-base">
                ¿Asistirás?
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`rounded-lg sm:rounded-xl px-2 py-3 font-display text-sm sm:text-lg border transition-all ${
                    attending === true
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500 shadow-lg shadow-amber-700/30"
                      : "bg-white/70 border-amber-600/30 text-stone-800 hover:border-amber-600/60"
                  }`}
                >
                  ✓ Con gusto asistiré
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`rounded-lg sm:rounded-xl px-2 py-3 font-display text-sm sm:text-lg border transition-all ${
                    attending === false
                      ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-500 shadow-lg shadow-amber-700/30"
                      : "bg-white/70 border-amber-600/30 text-stone-800 hover:border-amber-600/60"
                  }`}
                >
                  ✗ No podré asistir
                </button>
              </div>
            </div>

            {attending === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Label htmlFor="guests" className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-base">
                  Número de invitados (incluyéndote)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-600/40 text-amber-700 hover:bg-amber-400/10 w-11 h-11 sm:w-12 sm:h-12 shrink-0"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  >
                    −
                  </Button>
                  <div className="flex-1 text-center text-2xl sm:text-3xl font-serif text-amber-600">
                    {guests}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-600/40 text-amber-700 hover:bg-amber-400/10 w-11 h-11 sm:w-12 sm:h-12 shrink-0"
                    onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  >
                    +
                  </Button>
                </div>
              </motion.div>
            )}

            <div>
              <Label htmlFor="msg" className="text-amber-700/80 tracking-widest uppercase text-[16px] sm:text-base">
                Mensaje para los novios (opcional)
              </Label>
              <Textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tus buenos deseos..."
                className="mt-2 bg-white/70 border-amber-600/30 text-stone-800 placeholder:text-stone-400 font-display text-sm sm:text-base min-h-[90px]"
              />
            </div>

            <Button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 hover:from-amber-600 hover:via-amber-400 hover:to-amber-500 text-white font-medium tracking-widest uppercase rounded-full h-12 sm:h-14 text-sm sm:text-base shadow-lg shadow-amber-700/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar confirmación"
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function ClosingSection() {
  return (
    <section className="py-12 sm:py-20 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-2xl mx-auto"
      >
        <FloralCorner className="mx-auto opacity-50" />
        <DecorativeDivider className="my-6 sm:my-8" />
        <p className="font-display text-xl sm:text-3xl text-stone-800/90 italic leading-relaxed px-2">
          {weddingConfig.closingText}
        </p>
        <p className="mt-6 text-amber-700/70 tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[16px] sm:text-base font-sans">
          {weddingConfig.bride.shortName} & {weddingConfig.groom.shortName}
        </p>
        <DecorativeDivider className="my-6 sm:my-8" />
      </motion.div>
    </section>
  );
}
