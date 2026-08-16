"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Shirt, Gift, Check, X, Loader2 } from "lucide-react";
import { weddingConfig } from "@/lib/wedding-config";
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
  const { bride, groom, weddingDate, tagline } = weddingConfig;

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

        <p className="mt-4 sm:mt-6 text-amber-200/70 tracking-[0.25em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-sm font-sans">
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
            <span className="text-2xl sm:text-4xl font-serif text-amber-300">&</span>
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

        <p className="text-amber-100/80 text-[11px] sm:text-base tracking-[0.15em] sm:tracking-widest uppercase font-sans px-2">
          {formatDateLong(weddingDate)}
        </p>

        <DecorativeDivider className="mt-8 sm:mt-12" />

        <p className="max-w-md text-amber-50/70 text-sm sm:text-lg font-display leading-relaxed italic px-1">
          {weddingConfig.invitationText}
        </p>

        <div className="mt-8 sm:mt-10 w-full">
          <Countdown targetDate={weddingDate} />
        </div>

        <a
          href="#rsvp"
          className="mt-8 sm:mt-12 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 px-6 sm:px-8 py-3 text-xs sm:text-sm font-medium uppercase tracking-widest text-black hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
        >
          {weddingConfig.ctaText}
        </a>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="text-amber-400/60 text-[10px] tracking-widest">▼</div>
      </div>
    </section>
  );
}

export function DetailsSection() {
  const { weddingDate, venue, additionalInfo } = weddingConfig;
  const items = [
    {
      icon: Calendar,
      label: "Cuándo",
      value: formatDateLong(weddingDate),
    },
    {
      icon: Clock,
      label: "Hora",
      value: `${formatTime(weddingDate)} hrs`,
    },
    {
      icon: MapPin,
      label: "Dónde",
      value: venue.name,
    },
    {
      icon: Shirt,
      label: "Código de vestimenta",
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
            Detalles del Evento
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
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:border-amber-400/50 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-600/20 flex items-center justify-center border border-amber-400/40">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200/60">
                  {item.label}
                </div>
                <div className="text-base sm:text-lg font-display text-amber-50 break-words">
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
            <Gift className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-amber-300 mt-1" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl text-amber-100 mb-2">Mesa de regalos</h3>
              <p className="text-amber-50/70 font-display text-sm sm:text-lg leading-relaxed italic">
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
  const { venue } = weddingConfig;

  const openMaps = () => {
    window.open(venue.mapsUrl, "_blank", "noopener,noreferrer");
  };

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
            Ubicación
          </h2>
          <DecorativeDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-10 mt-6 sm:mt-8"
        >
          <div className="text-center">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-3xl font-serif text-amber-100 px-2">
              {venue.name}
            </h3>
            <p className="text-amber-50/70 font-display text-sm sm:text-lg mt-2 max-w-md mx-auto italic px-2">
              {venue.address}
            </p>

            <Button
              onClick={openMaps}
              size="sm"
              className="mt-6 sm:mt-8 sm:size-lg bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 hover:from-amber-500 hover:via-amber-300 hover:to-amber-500 text-black font-medium tracking-wider uppercase rounded-full px-6 sm:px-8 shadow-lg shadow-amber-500/20 h-11 sm:h-12"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Cómo llegar
            </Button>
          </div>

          {/* Embedded map preview */}
          <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl overflow-hidden border border-amber-400/20 aspect-video">
            <iframe
              title="Ubicación del evento"
              src={`https://www.google.com/maps?q=${venue.lat},${venue.lng}&z=15&output=embed`}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ filter: "invert(0.9) hue-rotate(180deg) saturate(0.7)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ScheduleSection() {
  const { schedule } = weddingConfig;

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            Orden del Día
          </h2>
          <DecorativeDivider />
        </motion.div>

        <div className="relative mt-8 sm:mt-12">
          {/* Vertical line - left on mobile, center on desktop */}
          <div className="absolute left-2 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />

          {schedule.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative mb-4 sm:mb-8 pl-8 sm:w-1/2 sm:pl-0 ${
                i % 2 === 0 ? "sm:ml-0 sm:pr-8 sm:text-right" : "sm:ml-auto sm:pl-8"
              }`}
            >
              {/* Dot */}
              <div
                className={`absolute top-3 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20 left-1 ${
                  i % 2 === 0 ? "sm:left-auto sm:right-[-7px]" : "sm:left-[-7px]"
                }`}
              />
              <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-amber-300 font-serif text-xl sm:text-2xl">{item.time}</div>
                <div className="text-amber-50 font-display text-base sm:text-lg mt-1">{item.title}</div>
                <div className="text-amber-100/60 text-xs sm:text-sm mt-1">{item.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
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
    <section id="rsvp" className="py-20 px-4 relative scroll-mt-10">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-serif italic text-gold-gradient mb-2">
            Confirmación de Asistencia
          </h2>
          <DecorativeDivider />
          <p className="text-amber-50/70 font-display text-lg italic mt-4">
            Por favor confirma tu asistencia antes del 1 de noviembre
          </p>
        </motion.div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 sm:p-12 mt-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center mx-auto mb-4">
              {done === "yes" ? (
                <Check className="w-10 h-10 text-black" />
              ) : (
                <X className="w-10 h-10 text-black" />
              )}
            </div>
            <h3 className="text-2xl font-serif text-amber-100 mb-2">
              {done === "yes" ? "¡Nos emociona compartir este día contigo!" : "Gracias por avisarnos"}
            </h3>
            <p className="text-amber-50/70 font-display text-lg italic">
              {done === "yes"
                ? `Hemos registrado tu confirmación, ${name.split(" ")[0]}.`
                : "Te llevaremos en nuestros pensamientos."}
            </p>
            <Button
              variant="outline"
              className="mt-6 border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
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
            className="glass-card rounded-3xl p-6 sm:p-10 mt-8 space-y-6"
          >
            <div>
              <Label htmlFor="name" className="text-amber-200/80 tracking-widest uppercase text-xs">
                Nombre completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="mt-2 bg-black/30 border-amber-400/30 text-amber-50 placeholder:text-amber-100/30 font-display text-lg"
              />
            </div>

            <div>
              <Label className="text-amber-200/80 tracking-widest uppercase text-xs">
                ¿Asistirás?
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`rounded-xl px-4 py-3 font-display text-lg border transition-all ${
                    attending === true
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-300 shadow-lg shadow-amber-500/30"
                      : "bg-black/30 border-amber-400/30 text-amber-100 hover:border-amber-400/60"
                  }`}
                >
                  ✓ Con gusto asistiré
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`rounded-xl px-4 py-3 font-display text-lg border transition-all ${
                    attending === false
                      ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white border-violet-400 shadow-lg shadow-violet-500/30"
                      : "bg-black/30 border-amber-400/30 text-amber-100 hover:border-amber-400/60"
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
                <Label htmlFor="guests" className="text-amber-200/80 tracking-widest uppercase text-xs">
                  Número de invitados (incluyéndote)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10 w-12 h-12"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  >
                    −
                  </Button>
                  <div className="flex-1 text-center text-3xl font-serif text-amber-300">
                    {guests}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10 w-12 h-12"
                    onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  >
                    +
                  </Button>
                </div>
              </motion.div>
            )}

            <div>
              <Label htmlFor="msg" className="text-amber-200/80 tracking-widest uppercase text-xs">
                Mensaje para los novios (opcional)
              </Label>
              <Textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tus buenos deseos..."
                className="mt-2 bg-black/30 border-amber-400/30 text-amber-50 placeholder:text-amber-100/30 font-display text-base min-h-[100px]"
              />
            </div>

            <Button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 hover:from-amber-500 hover:via-amber-300 hover:to-amber-500 text-black font-medium tracking-widest uppercase rounded-full py-6 text-base shadow-lg shadow-amber-500/20"
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
    <section className="py-20 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-2xl mx-auto"
      >
        <FloralCorner className="mx-auto opacity-50" />
        <DecorativeDivider className="my-8" />
        <p className="font-display text-2xl sm:text-3xl text-amber-100/90 italic leading-relaxed">
          {weddingConfig.closingText}
        </p>
        <p className="mt-6 text-amber-300/70 tracking-[0.3em] uppercase text-xs font-sans">
          {weddingConfig.bride.shortName} & {weddingConfig.groom.shortName}
        </p>
        <DecorativeDivider className="my-8" />
      </motion.div>
    </section>
  );
}
