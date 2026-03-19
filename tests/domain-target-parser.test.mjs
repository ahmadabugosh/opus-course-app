import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCloudflareHeaders, expandRecordName, inferZoneNameFromHostname, isSelfReferentialCname, parseRailwayTargetFromJson } from '../lib/domain.js';

test('parseRailwayTargetFromJson resolves target/domain/hostname fields', () => {
  assert.equal(parseRailwayTargetFromJson('{"target":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"domain":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"hostname":"app.up.railway.app"}'), 'app.up.railway.app');
});

test('parseRailwayTargetFromJson resolves cname/dnsTarget fields from Railway variants', () => {
  assert.equal(parseRailwayTargetFromJson('{"cname":"cname-shape.up.railway.app"}'), 'cname-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"dnsTarget":"dns-target-shape.up.railway.app"}'), 'dns-target-shape.up.railway.app');
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

  const customServiceShape = JSON.stringify({
    service: {
      customDomains: [
        'https://opus-course.learnopenclaw.ai',
      ],
      serviceDomains: [
        'https://nested-service-domain.up.railway.app',
      ],
    },
  });

  assert.equal(parseRailwayTargetFromJson(dataWrapped), 'nested-data-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson(serviceWrapped), 'nested-service-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson(customServiceShape), 'nested-service-domain.up.railway.app');
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

test('parseRailwayTargetFromJson ignores IP-only candidates and keeps hostnames', () => {
  const mixed = JSON.stringify({
    target: '34.117.12.5',
    serviceDomain: 'https://kept-host.up.railway.app',
  });

  const ipOnly = JSON.stringify({
    target: '34.117.12.5',
    dnsTarget: '2606:4700:4700::1111',
  });

  assert.equal(parseRailwayTargetFromJson(mixed), 'kept-host.up.railway.app');
  assert.equal(parseRailwayTargetFromJson(ipOnly), null);
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
  assert.equal(inferZoneNameFromHostname('app.learnopenclaw.co.uk'), 'learnopenclaw.co.uk');
  assert.equal(inferZoneNameFromHostname('api.learnopenclaw.com.au'), 'learnopenclaw.com.au');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.in'), 'learnopenclaw.co.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.sg'), 'learnopenclaw.com.sg');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.za'), 'learnopenclaw.co.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.za'), 'learnopenclaw.org.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.il'), 'learnopenclaw.co.il');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.tr'), 'learnopenclaw.com.tr');
  assert.equal(inferZoneNameFromHostname('localhost'), null);
  assert.equal(inferZoneNameFromHostname(''), null);
});

test('expandRecordName resolves apex/relative/FQDN Cloudflare record names safely', () => {
  assert.equal(expandRecordName('@', 'learnopenclaw.ai'), 'learnopenclaw.ai');
  assert.equal(expandRecordName('opus-course', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('opus-course.learnopenclaw.ai', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('https://opus-course.learnopenclaw.ai/path', 'learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(expandRecordName('*', 'learnopenclaw.ai'), '*.learnopenclaw.ai');
  assert.equal(expandRecordName('*.learnopenclaw.ai', 'learnopenclaw.ai'), '*.learnopenclaw.ai');
  assert.equal(expandRecordName('*.LEARNOPENCLAW.AI.', 'learnopenclaw.ai'), '*.learnopenclaw.ai');
  assert.equal(expandRecordName('', 'learnopenclaw.ai'), null);
});

test('isSelfReferentialCname detects self-referential domain targets', () => {
  assert.equal(isSelfReferentialCname('opus-course.learnopenclaw.ai', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('https://opus-course.learnopenclaw.ai/path', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('OPUS-COURSE.LEARNOPENCLAW.AI.', 'opus-course.learnopenclaw.ai'), true);
  assert.equal(isSelfReferentialCname('opus-course.learnopenclaw.ai', 'https://opus-course-production.up.railway.app'), false);
  assert.equal(isSelfReferentialCname('', 'opus-course.learnopenclaw.ai'), false);
});

test('buildCloudflareHeaders supports bearer tokens and global API key/email auth', () => {
  assert.deepEqual(buildCloudflareHeaders({ token: 'tok_123' }), {
    Authorization: 'Bearer tok_123',
    'Content-Type': 'application/json',
  });

  assert.deepEqual(
    buildCloudflareHeaders({ apiKey: 'key_123', apiEmail: 'rose@example.com' }),
    {
      'X-Auth-Key': 'key_123',
      'X-Auth-Email': 'rose@example.com',
      'Content-Type': 'application/json',
    },
  );

  assert.equal(buildCloudflareHeaders({ apiKey: 'key_123' }), null);
  assert.equal(buildCloudflareHeaders({}), null);
});
