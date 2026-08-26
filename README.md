# Dariana & Walter — Cena de Celebración

Invitación web para la cena de celebración de Dariana & Walter.

## Configuración

1. Copia `.env.example` a `.env` y completa los valores
2. Instala dependencias: `bun install`
3. Inicia el servidor: `bun run dev`

## Variables de entorno

- `TURSO_DATABASE_URL` - URL de la base de datos Turso
- `TURSO_AUTH_TOKEN` - Token de autenticación de Turso
- `DATABASE_URL` - (Solo desarrollo local) URL de SQLite

## Stack

- Next.js 16 + TypeScript
- Prisma + Turso (libSQL)
- Tailwind CSS 4 + shadcn/ui
- Framer Motion
