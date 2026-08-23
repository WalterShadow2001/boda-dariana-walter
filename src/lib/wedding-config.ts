/**
 * ============================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN - CENA DE CELEBRACIÓN
 * ============================================================
 *  Modifica este archivo para personalizar toda la invitación.
 *  - Cambia nombres, fechas, lugar, mensaje, etc.
 *  - Las fotos se cargan desde el panel de administración.
 * ============================================================
 */

export const weddingConfig = {
  // 👰🤵 Nombres de los novios
  bride: {
    name: "Dariana",
    shortName: "Dariana",
  },
  groom: {
    name: "Walter",
    shortName: "Walter",
  },

  // 📅 Fecha y hora de la cena (formato: YYYY-MM-DDTHH:mm:ss)
  weddingDate: "2026-09-05T20:00:00",

  // 📍 Ubicación del evento
  venue: {
    name: "Restaurante San Ángel",
    address: "Av. de las Flores 1234, San Ángel, Ciudad de México",
    // URL de Google Maps (puedes obtenerla buscando el lugar en Google Maps y copiando el enlace)
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Restaurante+San+Angel+CDMX",
    // Coordenadas opcionales (para abrir directamente la app de mapas)
    lat: 19.3406,
    lng: -99.1865,
  },

  // 🕊️ Frase principal que aparece bajo los nombres
  tagline: "¡Nos casamos! Celebremos juntos",

  // 💌 Texto de invitación (párrafo principal)
  invitationText:
    "Con mucha alegría queremos compartir que dimos el sí. Nos encantaría que nos acompañes a brindar por esta nueva etapa de nuestras vidas en una cena entre amigos y familiares queridos.",

  // 🍽️ Orden de la noche / Itinerario
  schedule: [
    { time: "20:00", title: "Recepción", description: "Bienvenida con bebida" },
    { time: "20:30", title: "Brindis", description: "Por los novios" },
    { time: "21:00", title: "Cena", description: "Cena de celebración" },
    { time: "22:30", title: "Sobremesa", description: "Tiempo para charlar" },
  ],

  // 🎁 Información adicional (opcional)
  additionalInfo: {
    dressCode: "Elegante casual",
    giftNote:
      "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, agradecemos tu contribución a nuestra luna de miel.",
  },

  // 🔐 Contraseña del panel de administración (para subir fotos y ver confirmaciones)
  // ¡Cambia esta contraseña por una que solo tú conozcas!
  adminPassword: "1303",

  // 📸 Clave pública de Uploadcare (OPCIONAL)
  // Por defecto usa "demopublickey" que funciona pero las imágenes se borran tras 30 días.
  // Para tener fotos PERMANENTES y sin límites:
  //   1. Crea cuenta GRATIS en https://uploadcare.com
  //   2. Ve a "Dashboard" → "API keys" → copia la "Public key" (empieza con "demopublickey" o similar)
  //   3. Pégala aquí abajo:
  uploadcarePublicKey: "demopublickey",

  // 📱 Texto del botón principal
  ctaText: "Confirmar Asistencia",

  // 🌸 Frase final
  closingText: "¡Esperamos compartir esta noche contigo!",
} as const;

export type WeddingConfig = typeof weddingConfig;
