import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

(async () => {
  await db.rsvp.deleteMany();
  await db.photo.deleteMany();
  const r = await db.rsvp.count();
  const p = await db.photo.count();
  console.log(`RSVPs: ${r}, Photos: ${p}`);
  await db.$disconnect();
})();
