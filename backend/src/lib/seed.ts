import prisma from "./prisma";

export async function seedTables(): Promise<void> {
  const count = await prisma.table.count();
  if (count > 0) return;

  await prisma.table.createMany({
    data: [
      { name: "Table 1", location: "Souk - Rez-de-chaussée", available: true },
      { name: "Table 2", location: "Souk - Rez-de-chaussée", available: true },
      { name: "Table 3", location: "Souk - 1er étage", available: true },
    ],
  });

  console.log("Seeded default tables");
}
