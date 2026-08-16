/**
 * ============================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN DE BODA
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

  // 📅 Fecha y hora de la boda (formato: YYYY-MM-DDTHH:mm:ss)
  // Ejemplo: "2026-12-12T18:00:00"
  weddingDate: "2026-12-12T18:00:00",

  // 📍 Ubicación del evento
  venue: {
    name: "Hacienda San Cristóbal",
    address: "Av. de las Flores 1234, San Ángel, Ciudad de México",
    // URL de Google Maps (puedes obtenerla buscando el lugar en Google Maps y copiando el enlace)
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hacienda+San+Cristobal+CDMX",
    // Coordenadas opcionales (para abrir directamente la app de mapas)
    lat: 19.3406,
    lng: -99.1865,
  },

  // 🕊️ Frase principal que aparece bajo los nombres
  tagline: "¡Nos casamos!",

  // 💌 Texto de invitación (párrafo principal)
  invitationText:
    "Con la bendición de Dios y el amor de nuestras familias, tenemos el honor de invitarte a celebrar el día más importante de nuestras vidas. Tu presencia hará aún más especial este momento que marcara el inicio de nuestro camino juntos.",

  // ⛪ Orden del día / Itinerario
  schedule: [
    { time: "17:30", title: "Recepción", description: "Bienvenida a los invitados" },
    { time: "18:00", title: "Ceremonia", description: "Ceremonia religiosa" },
    { time: "19:30", title: "Cóctel", description: "Hora del brindis" },
    { time: "20:30", title: "Banquete", description: "Cena de gala" },
    { time: "22:00", title: "Fiesta", description: "Que comience la celebración" },
  ],

  // 🎁 Información adicional (opcional)
  additionalInfo: {
    dressCode: "Etiqueta rigurosa",
    giftNote: "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros, agradecemos tu contribución a nuestra luna de miel.",
  },

  // 🔐 Contraseña del panel de administración (para subir fotos y ver RSVPs)
  // ¡Cambia esta contraseña por una que solo tú conozcas!
  adminPassword: "1303",

  // 📱 Texto del botón principal
  ctaText: "Confirmar Asistencia",

  // 🌸 Frase final
  closingText: "¡Esperamos contar con tu presencia!",
} as const;

export type WeddingConfig = typeof weddingConfig;
