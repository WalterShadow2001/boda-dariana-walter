import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
(async () => {
  await db.photo.deleteMany();
  const count = await db.photo.count();
  console.log(`Fotos limpias. Total: ${count}`);
  await db.$disconnect();
})();
