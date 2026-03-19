import test from 'node:test';
import assert from 'node:assert/strict';
import { expandRecordName, inferZoneNameFromHostname, isSelfReferentialCname, parseRailwayTargetFromJson } from '../lib/domain.js';

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

test('parseRailwayTargetFromJson resolves nested Railway payloads', () => {
  const dataWrapped = JSON.stringify({
    data: {
      domains: [
        {
          domain: 'https://nested-data-shape.up.railway.app',
        },
      ],
    },
  });

  const serviceWrapped = JSON.stringify({
    service: {
      domains: ['https://nested-service-shape.up.railway.app'],
    },
  });

  assert.equal(parseRailwayTargetFromJson(dataWrapped), 'nested-data-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson(serviceWrapped), 'nested-service-shape.up.railway.app');
});

test('parseRailwayTargetFromJson prefers railway host when payload also contains custom domain', () => {
  const raw = JSON.stringify({
    domains: [
      { domain: 'https://opus-course.learnopenclaw.ai' },
      { serviceDomain: 'https://opus-course-production.up.railway.app' },
    ],
  });

  assert.equal(parseRailwayTargetFromJson(raw), 'opus-course-production.up.railway.app');
});

test('parseRailwayTargetFromJson returns null on empty or invalid input', () => {
  assert.equal(parseRailwayTargetFromJson(''), null);
  assert.equal(parseRailwayTargetFromJson('{"domains":[]}'), null);
  assert.equal(parseRailwayTargetFromJson('not json'), null);
});

test('inferZoneNameFromHostname resolves an apex zone from app hostnames', () => {
  assert.equal(inferZoneNameFromHostname('opus-course.learnopenclaw.ai'), 'learnopenclaw.ai');
  assert.equal(inferZoneNameFromHostname('https://opus-course.learnopenclaw.ai'), 'learnopenclaw.ai');
  assert.equal(inferZoneNameFromHostname('https://opus-course.learnopenclaw.ai/dashboard?x=1'), 'learnopenclaw.ai');
  assert.equal(inferZoneNameFromHostname('opus-course.learnopenclaw.ai/path/ignored'), 'learnopenclaw.ai');
  assert.equal(inferZoneNameFromHostname('localhost'), null);
  assert.equal(inferZoneNameFromHostname(''), null);
});

test('expandRecordName resolves apex/relative/FQDN Cloudflare record names safely', () => {
  assert.equal(expandRecordName('@', 'learnopenclaw.ai'), 'learnopenclaw.ai');
  assert.equal(expandRecordName('opus-course', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('opus-course.learnopenclaw.ai', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('https://opus-course.learnopenclaw.ai/path', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('*', 'learnopenclaw.ai'), '*.learnopenclaw.ai');
  assert.equal(expandRecordName('', 'learnopenclaw.ai'), null);
});

test('isSelfReferentialCname detects self-referential domain targets', () => {
  assert.equal(isSelfReferentialCname('opus-course.learnopenclaw.ai', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('https://opus-course.learnopenclaw.ai/path', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('OPUS-COURSE.LEARNOPENCLAW.AI.', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('opus-course.learnopenclaw.ai', 'https://opus-course-production.up.railway.app'), false);
  assert.equal(isSelfReferentialCname('', 'opus-course.learnopenclaw.ai'), false);
});
