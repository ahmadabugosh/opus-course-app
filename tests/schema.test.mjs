import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('database schema contains all required tables', () => {
  const sql = readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8');

  for (const table of ['users', 'progress', 'achievements', 'certificates', 'analytics']) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'));
  }
});
