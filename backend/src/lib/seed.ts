import prisma from "./prisma";

const defaultTables = [
  { name: "Table 1", location: "Souk - Rez-de-chaussée", available: true },
  { name: "Table 2", location: "Souk - Rez-de-chaussée", available: true },
  { name: "Table 3", location: "Souk - 1er étage", available: true },
];

export async function seedTables(): Promise<void> {
  const result = await prisma.table.createMany({
    data: defaultTables,
    skipDuplicates: true,
  });

  if (result.count > 0) {
    console.log(`Seeded ${result.count} default tables`);
  }
}
