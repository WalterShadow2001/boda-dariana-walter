"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  HeroSection,
  DetailsSection,
  LocationSection,
  ScheduleSection,
  RsvpSection,
  ClosingSection,
} from "@/components/wedding/sections";
import { PhotoGallery } from "@/components/wedding/photo-gallery";
import { AdminPanel, AdminLockButton } from "@/components/wedding/admin-panel";

export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  const handleAdminClose = () => {
    setAdminOpen(false);
    // keep adminPassword so user stays "logged in" for the photo gallery
  };

  const handleAdminVerified = (pwd: string) => {
    setAdminPassword(pwd);
  };

  return (
    <main className="min-h-screen relative">
      {/* Hero */}
      <HeroSection />

      {/* Details */}
      <DetailsSection />

      {/* Location with Google Maps */}
      <LocationSection />

      {/* Schedule */}
      <ScheduleSection />

      {/* RSVP form */}
      <RsvpSection />

      {/* Photo gallery */}
      <PhotoGallery adminPassword={adminPassword} />

      {/* Closing */}
      <ClosingSection />

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-amber-400/10">
        <p className="text-amber-100/40 text-xs tracking-widest uppercase font-sans">
          {new Date().getFullYear()} · Con amor, María & Alejandro
        </p>
      </footer>

      {/* Admin lock button (desktop only) */}
      <AdminLockButton
        onClick={() => {
          // When opening, we need to verify password first via AdminPanel
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
  );
}
