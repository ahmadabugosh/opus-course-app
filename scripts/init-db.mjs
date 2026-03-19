import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'opus-course.db');
const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.close();

console.log(`Database initialized at ${databasePath}`);
