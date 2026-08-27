"use client";

import { useEffect, useState } from "react";
import { weddingConfig } from "@/lib/wedding-config";

export interface DynamicSettings {
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  venueLat: string;
  venueLng: string;
}

const defaultSettings: DynamicSettings = {
  weddingDate: weddingConfig.weddingDate,
  venueName: weddingConfig.venue.name,
  venueAddress: weddingConfig.venue.address,
  venueMapsUrl: weddingConfig.venue.mapsUrl,
  venueLat: weddingConfig.venue.lat.toString(),
  venueLng: weddingConfig.venue.lng.toString(),
};

export function useSettings() {
  const [settings, setSettings] = useState<DynamicSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoaded(true);
      })
      .catch(() => {
        setSettings(defaultSettings);
        setLoaded(true);
      });
  }, []);

  return { settings, loaded };
}
