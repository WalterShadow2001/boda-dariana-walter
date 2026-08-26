"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Cargar fotos para el fondo
  useEffect(() => {
    if (!envelopeOpened) return;
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || []))
      .catch(() => {});
  }, [envelopeOpened]);

  const handleAdminClose = () => {
    setAdminOpen(false);
  };

  const handleAdminVerified = (pwd: string) => {
    setAdminPassword(pwd);
  };

  return (
    <>
      {/* Envelope intro */}
      {!envelopeOpened && <EnvelopeIntro onOpen={() => setEnvelopeOpened(true)} />}

      {/* Photo background (only after envelope opened) */}
      {envelopeOpened && photos.length > 0 && (
        <PhotoBackground photos={photos} sectionsCount={5} />
      )}

      <main className="min-h-screen relative z-10">
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
      </main>
    </>
  );
}
