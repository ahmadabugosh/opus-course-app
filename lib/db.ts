import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'opus-course.db');
const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');

let db: Database.Database;

function initializeSchema(connection: Database.Database) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  connection.exec(schema);
  connection.pragma('journal_mode = WAL');
  connection.pragma('foreign_keys = ON');
}

export function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    db = new Database(databasePath);
    initializeSchema(db);
  }

  return db;
}

export function run(sql: string, ...params: unknown[]): Database.RunResult {
  const statement = getDb().prepare(sql);
  return statement.run(...params);
}

export function get<T = unknown>(sql: string, ...params: unknown[]): T | undefined {
  const statement = getDb().prepare(sql);
  return statement.get(...params) as T | undefined;
}

export function all<T = unknown>(sql: string, ...params: unknown[]): T[] {
  const statement = getDb().prepare(sql);
  return statement.all(...params) as T[];
}
