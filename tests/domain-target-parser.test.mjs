import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCloudflareHeaders, expandRecordName, inferZoneNameFromHostname, isEquivalentCnameRecord, isSelfReferentialCname, parseRailwayTargetFromJson, resolveCnameTarget } from '../lib/domain.js';

test('parseRailwayTargetFromJson resolves target/domain/hostname fields', () => {
  assert.equal(parseRailwayTargetFromJson('{"target":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"domain":"app.up.railway.app"}'), 'app.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"hostname":"app.up.railway.app"}'), 'app.up.railway.app');
});

test('parseRailwayTargetFromJson resolves cname/dnsTarget fields from Railway variants', () => {
  assert.equal(parseRailwayTargetFromJson('{"cname":"cname-shape.up.railway.app"}'), 'cname-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"dnsTarget":"dns-target-shape.up.railway.app"}'), 'dns-target-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"cnameTarget":"cname-target-shape.up.railway.app"}'), 'cname-target-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"dns_name":"dns-name-shape.up.railway.app"}'), 'dns-name-shape.up.railway.app');
  assert.equal(parseRailwayTargetFromJson('{"publicDomain":"public-domain-shape.up.railway.app"}'), 'public-domain-shape.up.railway.app');
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

test('parseRailwayTargetFromJson only prioritizes real Railway suffix hosts', () => {
  const raw = JSON.stringify({
    domains: [
      { domain: 'https://trap-railway.app.example.com' },
      { domain: 'https://actual-service.up.railway.app' },
    ],
  });

  assert.equal(parseRailwayTargetFromJson(raw), 'actual-service.up.railway.app');
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
  assert.equal(inferZoneNameFromHostname('app.learnopenclaw.net.uk'), 'learnopenclaw.net.uk');
  assert.equal(inferZoneNameFromHostname('app.learnopenclaw.sch.uk'), 'learnopenclaw.sch.uk');
  assert.equal(inferZoneNameFromHostname('api.learnopenclaw.com.au'), 'learnopenclaw.com.au');
  assert.equal(inferZoneNameFromHostname('api.learnopenclaw.net.au'), 'learnopenclaw.net.au');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.or.jp'), 'learnopenclaw.or.jp');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.ne.jp'), 'learnopenclaw.ne.jp');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.go.jp'), 'learnopenclaw.go.jp');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.ac.jp'), 'learnopenclaw.ac.jp');
  assert.equal(inferZoneNameFromHostname('api.learnopenclaw.edu.au'), 'learnopenclaw.edu.au');
  assert.equal(inferZoneNameFromHostname('api.learnopenclaw.gov.in'), 'learnopenclaw.gov.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.in'), 'learnopenclaw.co.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.ac.in'), 'learnopenclaw.ac.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.gov.in'), 'learnopenclaw.gov.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.in'), 'learnopenclaw.org.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.net.in'), 'learnopenclaw.net.in');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.sg'), 'learnopenclaw.com.sg');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.za'), 'learnopenclaw.co.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.za'), 'learnopenclaw.org.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.net.za'), 'learnopenclaw.net.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.gov.za'), 'learnopenclaw.gov.za');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.il'), 'learnopenclaw.co.il');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.tr'), 'learnopenclaw.com.tr');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.id'), 'learnopenclaw.co.id');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.my'), 'learnopenclaw.com.my');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.br'), 'learnopenclaw.com.br');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.gov.br'), 'learnopenclaw.gov.br');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.br'), 'learnopenclaw.org.br');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.net.br'), 'learnopenclaw.net.br');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.mx'), 'learnopenclaw.com.mx');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.ar'), 'learnopenclaw.com.ar');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.th'), 'learnopenclaw.co.th');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.hk'), 'learnopenclaw.com.hk');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.ph'), 'learnopenclaw.com.ph');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.au'), 'learnopenclaw.org.au');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.kr'), 'learnopenclaw.co.kr');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.or.kr'), 'learnopenclaw.or.kr');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.com.cn'), 'learnopenclaw.com.cn');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.net.cn'), 'learnopenclaw.net.cn');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.org.cn'), 'learnopenclaw.org.cn');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.co.ke'), 'learnopenclaw.co.ke');
  assert.equal(inferZoneNameFromHostname('portal.learnopenclaw.or.ke'), 'learnopenclaw.or.ke');
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

test('resolveCnameTarget normalizes host-like values and rejects IP literals', () => {
  assert.equal(resolveCnameTarget('https://Opus-Course-Prod.UP.RAILWAY.APP/path'), 'opus-course-prod.up.railway.app');
  assert.equal(resolveCnameTarget('opus-course-prod.up.railway.app.'), 'opus-course-prod.up.railway.app');
  assert.equal(resolveCnameTarget('34.117.12.5'), null);
  assert.equal(resolveCnameTarget('2606:4700:4700::1111'), null);
});

test('isEquivalentCnameRecord matches normalized host + target + proxied state', () => {
  const desired = {
    name: 'opus-course.learnopenclaw.ai',
    content: 'opus-course-production.up.railway.app',
    proxied: true,
  };

  assert.equal(
    isEquivalentCnameRecord(
      {
        type: 'CNAME',
        name: 'OPUS-COURSE.LEARNOPENCLAW.AI.',
        content: 'https://Opus-Course-Production.UP.RAILWAY.APP/path',
        proxied: true,
      },
      desired,
    ),
    true,
  );

  assert.equal(
    isEquivalentCnameRecord(
      {
        type: 'CNAME',
        name: 'opus-course.learnopenclaw.ai',
        content: 'another-target.up.railway.app',
        proxied: true,
      },
      desired,
    ),
    false,
  );

  assert.equal(
    isEquivalentCnameRecord(
      {
        type: 'CNAME',
        name: 'opus-course.learnopenclaw.ai',
        content: 'opus-course-production.up.railway.app',
        proxied: false,
      },
      desired,
    ),
    false,
  );

  assert.equal(isEquivalentCnameRecord({ type: 'A', name: 'opus-course.learnopenclaw.ai', content: '34.117.12.5' }, desired), false);
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
