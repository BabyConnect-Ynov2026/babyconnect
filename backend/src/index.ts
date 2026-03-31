import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { seedTables } from "./lib/seed";
import prisma from "./lib/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

const PORT = process.env["SERVER_PORT"] ?? "8080";

async function main(): Promise<void> {
  await seedTables();

  app.listen(PORT, () => {
    console.log(`BabyConnect API running on :${PORT}`);
  });
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
