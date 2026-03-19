import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { get, run } from '@/lib/db';

type CertificateStats = {
  completedLessons: number;
  achievementsCount: number;
};

type UserSummary = {
  id: number;
  email: string;
  display_name: string | null;
  username: string | null;
};

type CreateCertificateInput = {
  userId: number;
  displayName: string;
};

export function generateCertificateId() {
  return crypto.randomUUID();
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function generateCertificatePdfBuffer({
  certificateId,
  displayName,
  completionDate,
  achievementsCount,
  completedLessons,
}: {
  certificateId: string;
  displayName: string;
  completionDate: string;
  achievementsCount: number;
  completedLessons: number;
}) {
  const lines = [
    'BT',
    '/F1 34 Tf',
    '72 730 Td',
    `(Opus Mastery - Complete Course) Tj`,
    '0 -55 Td',
    '/F1 20 Tf',
    `(${escapePdfText(displayName)}) Tj`,
    '0 -30 Td',
    '/F1 14 Tf',
    `(Completed: ${escapePdfText(completionDate)}) Tj`,
    '0 -22 Td',
    `(Certificate ID: ${escapePdfText(certificateId)}) Tj`,
    '0 -22 Td',
    `(Course stats: ${completedLessons}/12 lessons, ${achievementsCount} achievements) Tj`,
    'ET',
  ];

  const stream = `${lines.join('\n')}\n`;
  const streamLength = Buffer.byteLength(stream, 'utf8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${stream}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000065 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000000 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
0
%%EOF`;

  // Store explicit MIME marker for discoverability in tests/tooling.
  const mime = 'application/pdf';
  void mime;

  return Buffer.from(pdf, 'utf8');
}

export function getCertificateStats(userId: number): CertificateStats {
  const completedRow = get<{ total: number }>(
    "SELECT COUNT(*) as total FROM progress WHERE user_id = ? AND status = 'completed'",
    userId,
  );

  const achievementsRow = get<{ total: number }>(
    'SELECT COUNT(*) as total FROM achievements WHERE user_id = ?',
    userId,
  );

  return {
    completedLessons: completedRow?.total ?? 0,
    achievementsCount: achievementsRow?.total ?? 0,
  };
}

export function getUserSummary(userId: number): UserSummary | null {
  return (
    get<UserSummary>(
      'SELECT id, email, display_name, username FROM users WHERE id = ?',
      userId,
    ) ?? null
  );
}

export function createAndStoreCertificate({ userId, displayName }: CreateCertificateInput) {
  const certificateId = generateCertificateId();
  const completionDate = new Date().toISOString().slice(0, 10);
  const stats = getCertificateStats(userId);

  const pdfBuffer = generateCertificatePdfBuffer({
    certificateId,
    displayName,
    completionDate,
    achievementsCount: stats.achievementsCount,
    completedLessons: stats.completedLessons,
  });

  const certificateDir = path.join(process.env.CERTIFICATES_DIR || '/data/certificates');
  fs.mkdirSync(certificateDir, { recursive: true });

  const pdfPath = path.join(certificateDir, `${certificateId}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  run(
    'INSERT INTO certificates (user_id, certificate_id, pdf_path) VALUES (?, ?, ?)',
    userId,
    certificateId,
    pdfPath,
  );

  return {
    certificateId,
    pdfPath,
    completionDate,
    stats,
  };
}
