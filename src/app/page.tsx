"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeroSection,
  DetailsSection,
  LocationSection,
  RsvpSection,
  ClosingSection,
} from "@/components/wedding/sections";
import { PhotoGallery } from "@/components/wedding/photo-gallery";
import { AdminPanel, AdminLockButton } from "@/components/wedding/admin-panel";
import { EnvelopeIntro } from "@/components/wedding/envelope-intro";
import { PhotoBackground } from "@/components/wedding/photo-background";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Cargar fotos para el fondo
  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || []))
      .catch(() => {});
  }, []);

  // Cuando el sobre se abre, mostrar el contenido con animación
  useEffect(() => {
    if (envelopeOpened) {
      const t = setTimeout(() => setContentVisible(true), 100);
      return () => clearTimeout(t);
    }
  }, [envelopeOpened]);

  // Seguridad: si después de 6 segundos el sobre no se ha abierto, mostrar el contenido de todos modos
  // Esto previene que si el sobre falla, el usuario se quede viendo una página en blanco
  useEffect(() => {
    const t = setTimeout(() => {
      if (!envelopeOpened) {
        setEnvelopeOpened(true);
        setContentVisible(true);
      }
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  const handleAdminClose = () => {
    setAdminOpen(false);
  };

  const handleAdminVerified = (pwd: string) => {
    setAdminPassword(pwd);
  };

  return (
    <>
      {/* Envelope intro - siempre se renderiza arriba, se cierra al hacer click */}
      {!envelopeOpened && <EnvelopeIntro onOpen={() => setEnvelopeOpened(true)} />}

      {/* Photo background (only after envelope opened) */}
      {envelopeOpened && photos.length > 0 && (
        <PhotoBackground photos={photos} sectionsCount={5} />
      )}

      {/* Main content - siempre presente, solo opacity 0 hasta que se abra el sobre */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
        className="min-h-screen relative z-10"
        style={{ pointerEvents: contentVisible ? "auto" : "none" }}
      >
        {/* Hero */}
        <HeroSection />

        {/* Details */}
        <DetailsSection />

        {/* Location with Google Maps */}
        <LocationSection />

        {/* RSVP form */}
        <RsvpSection />

        {/* Photo gallery */}
        <PhotoGallery />

        {/* Closing */}
        <ClosingSection />

        {/* Footer */}
        <footer className="py-8 px-4 text-center border-t border-amber-600/10">
          <p className="text-stone-800/50 text-xs tracking-widest uppercase font-sans">
            {new Date().getFullYear()} · Con amor, Dariana & Walter
          </p>
        </footer>

        {/* Admin lock button (desktop only) */}
        <AdminLockButton
          onClick={() => {
            setAdminOpen(true);
          }}
        />

        {/* Admin panel */}
        <AnimatePresence>
          {adminOpen && (
            <AdminPanel
              onClose={handleAdminClose}
              onVerified={handleAdminVerified}
            />
          )}
        </AnimatePresence>
      </motion.main>
    </>
  );
}
