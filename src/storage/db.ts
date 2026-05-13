import { Database } from "bun:sqlite";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(process.env.HOME ?? "~", ".goalever", "goalever.db");
const MIGRATIONS_PATH = join(__dirname, "../../migrations");

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) throw new Error("DB not initialized — call initDb() first");
  return _db;
}

export async function initDb(): Promise<Database> {
  const { mkdirSync } = await import("fs");
  mkdirSync(join(process.env.HOME ?? "~", ".goalever"), { recursive: true });

  _db = new Database(DB_PATH, { create: true });
  _db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");

  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: Database): Promise<void> {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )`);

  const applied = new Set(
    db.query<{ version: string }, []>("SELECT version FROM schema_migrations")
      .all()
      .map((r) => r.version)
  );

  const files = (await readdir(MIGRATIONS_PATH))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(MIGRATIONS_PATH, file), "utf-8");
    db.exec(sql);
    db.run("INSERT INTO schema_migrations (version) VALUES (?)", [file]);
  }
}
