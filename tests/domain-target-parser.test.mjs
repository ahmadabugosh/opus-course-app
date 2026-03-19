import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRailwayTargetFromJson } from '../lib/domain.js';

test('parseRailwayTargetFromJson resolves target/domain/hostname fields', () => {
  assert.equal(parseRailwayTargetFromJson('{"target":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"domain":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"hostname":"app.up.railway.app"}'), 'app.up.railway.app');
});

test('parseRailwayTargetFromJson resolves Railway CLI domains array and strips protocol', () => {
  const raw = JSON.stringify({ domains: ['https://glorious-warmth-production-d8d2.up.railway.app'] });

  assert.equal(parseRailwayTargetFromJson(raw), 'glorious-warmth-production-d8d2.up.railway.app');
});

test('parseRailwayTargetFromJson resolves Railway CLI domains array objects', () => {
  const raw = JSON.stringify({
    domains: [
      {
        id: 'domain_123',
        serviceDomain: 'https://opus-course-production.up.railway.app',
      },
    ],
  });

  assert.equal(parseRailwayTargetFromJson(raw), 'opus-course-production.up.railway.app');
});

test('parseRailwayTargetFromJson supports top-level array payloads', () => {
  const raw = JSON.stringify([
    {
      hostname: 'https://array-shape.up.railway.app',
    },
  ]);

  assert.equal(parseRailwayTargetFromJson(raw), 'array-shape.up.railway.app');
});

test('parseRailwayTargetFromJson returns null on empty or invalid input', () => {
  assert.equal(parseRailwayTargetFromJson(''), null);
  assert.equal(parseRailwayTargetFromJson('{"domains":[]}'), null);
  assert.equal(parseRailwayTargetFromJson('not json'), null);
});
