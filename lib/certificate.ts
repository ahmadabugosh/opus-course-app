import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { jsPDF } from 'jspdf';

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
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // === Background ===
  doc.setFillColor(18, 18, 40); // Deep dark blue
  doc.rect(0, 0, w, h, 'F');

  // === Outer border ===
  doc.setDrawColor(180, 140, 60); // Gold
  doc.setLineWidth(2);
  doc.rect(8, 8, w - 16, h - 16);

  // === Inner border ===
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, w - 28, h - 28);

  // === Corner decorations ===
  const cs = 20;
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(1.5);
  // Top-left
  doc.line(8, 8, 8 + cs, 8);
  doc.line(8, 8, 8, 8 + cs);
  // Top-right
  doc.line(w - 8 - cs, 8, w - 8, 8);
  doc.line(w - 8, 8, w - 8, 8 + cs);
  // Bottom-left
  doc.line(8, h - 8, 8 + cs, h - 8);
  doc.line(8, h - 8 - cs, 8, h - 8);
  // Bottom-right
  doc.line(w - 8 - cs, h - 8, w - 8, h - 8);
  doc.line(w - 8, h - 8 - cs, w - 8, h - 8);

  let y = 32;

  // === "OPUS MASTERY" header ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 140, 60);
  doc.text('O P U S   M A S T E R Y', w / 2, y, { align: 'center' });

  // === Divider ===
  y += 5;
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.3);
  doc.line(w / 2 - 35, y, w / 2 + 35, y);

  // === "Certificate of Completion" ===
  y += 12;
  doc.setFontSize(11);
  doc.setTextColor(180, 140, 60);
  doc.text('C E R T I F I C A T E   O F   C O M P L E T I O N', w / 2, y, { align: 'center' });

  // === "This is to certify that" ===
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(160, 160, 180);
  doc.setFont('helvetica', 'italic');
  doc.text('This is to certify that', w / 2, y, { align: 'center' });

  // === User's name ===
  y += 16;
  doc.setFont('times', 'bold');
  // Truncate very long names and adjust font size
  let nameSize = 36;
  let truncatedName = displayName;
  if (displayName.length > 40) {
    truncatedName = displayName.slice(0, 37) + '...';
  }
  if (truncatedName.length > 25) {
    nameSize = 30;
  }
  doc.setFontSize(nameSize);
  doc.setTextColor(255, 220, 130); // Gold/amber
  doc.text(truncatedName, w / 2, y, { align: 'center' });

  // === Divider under name ===
  y += 6;
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.3);
  doc.line(w / 2 - 50, y, w / 2 + 50, y);

  // === Description ===
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 200);
  doc.text('has successfully completed all 12 lessons of the Opus Mastery course', w / 2, y, { align: 'center' });
  doc.text('and demonstrated proficiency in AI workflow automation with Claude.', w / 2, y + 6, { align: 'center' });

  // === Title badge ===
  y += 20;
  const badgeW = 72;
  const badgeH = 14;
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.8);
  doc.setFillColor(35, 30, 50);
  doc.roundedRect(w / 2 - badgeW / 2, y - 8, badgeW, badgeH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 220, 130);
  doc.text('Opus Master', w / 2, y, { align: 'center' });

  // === Footer info section ===
  y += 22;
  const footerY = y;
  doc.setFontSize(8);

  // Date
  doc.setTextColor(140, 140, 160);
  doc.text('DATE ISSUED', w / 2 - 70, footerY, { align: 'center' });
  doc.setTextColor(200, 200, 220);
  doc.text(completionDate, w / 2 - 70, footerY + 5, { align: 'center' });

  // Lessons completed
  doc.setTextColor(140, 140, 160);
  doc.text('LESSONS COMPLETED', w / 2, footerY, { align: 'center' });
  doc.setTextColor(200, 200, 220);
  doc.text(`${completedLessons} / 12`, w / 2, footerY + 5, { align: 'center' });

  // Achievements
  doc.setTextColor(140, 140, 160);
  doc.text('ACHIEVEMENTS', w / 2 + 70, footerY, { align: 'center' });
  doc.setTextColor(200, 200, 220);
  doc.text(`${achievementsCount}`, w / 2 + 70, footerY + 5, { align: 'center' });

  // === Certificate ID ===
  y = footerY + 16;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 120);
  doc.text(`Certificate ID: ${certificateId}`, w / 2, y, { align: 'center' });

  // === Bottom tagline ===
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 120);
  doc.setFont('helvetica', 'italic');
  doc.text('"Master the AI, automate the future."', w / 2, h - 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  doc.text('LearnOpus.com \u2022 Opus Mastery Course', w / 2, h - 17, { align: 'center' });

  // Output as application/pdf buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

export function getCertificateStats(userId: number): CertificateStats {
  // MVP: Hard code to 12 lessons - UI controls access to certificate page
  // const completedRow = get<{ total: number }>(
  //   "SELECT COUNT(*) as total FROM progress WHERE user_id = ? AND status = 'completed'",
  //   userId,
  // );

  const achievementsRow = get<{ total: number }>(
    'SELECT COUNT(*) as total FROM achievements WHERE user_id = ?',
    userId,
  );

  return {
    completedLessons: 12, // Hard coded for MVP
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
