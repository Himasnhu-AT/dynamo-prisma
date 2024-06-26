/**
 * @description This is just for manual testing
 * run: npx ts-node test/cli.ts ./test/schemas/no_unique.json
 */
import { generatePrismaSchemaFile } from "../src/schemaGenerator";
import { readJsonFile } from "../src/utils/utils";
import {
  applyMigrations,
  createMigrations,
  validateAndMigrate,
} from "../src/commands";

export async function main(argv: string[]) {
  console.warn(argv);
  if (argv.length < 3) {
    console.error("Please provide the file address as an argument.");
    process.exit(1);
  }

  const filePath = argv[2];
  const data = readJsonFile(filePath);
  const migrateModels: any = await generatePrismaSchemaFile(data);
  console.log("migration models: ", migrateModels);
  await createMigrations(migrateModels);
  await applyMigrations();
  return filePath;
}

main(process.argv);
