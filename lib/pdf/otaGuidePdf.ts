/**
 * OTA Guide PDF Generator — Server-side jsPDF
 * Pattern: lib/audit/audit-pdf.ts
 */

import type { jsPDF } from 'jspdf';
import { OTA_GUIDE_AZ } from '@/lib/data/otaGuide';

function sanitize(text: string): string {
  return text
    .replace(/ə/g, 'e').replace(/Ə/g, 'E')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G');
}

const ML = 20;
const MR = 20;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawCover(doc: jsPDF): number {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const guide = OTA_GUIDE_AZ;

  // Dark background rectangle
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Gold accent line
  doc.setFillColor(197, 160, 34);
  doc.rect(ML, 40, 60, 3, 'F');

  // Branding
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(197, 160, 34);
  doc.text(sanitize(guide.coverBranding), ML, 55);

  // Title
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const cw = pageW - ML - MR;
  const titleLines = doc.splitTextToSize(sanitize(guide.coverTitle), cw);
  doc.text(titleLines, ML, 90);

  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const subLines = doc.splitTextToSize(sanitize(guide.coverSubtitle), cw);
  doc.text(subLines, ML, 110 + titleLines.length * 12);

  // Tool badges
  const badges = ['OTA Hazirliq Testi', 'ROI Kalkulyator', 'WhatsApp Sablonlar'];
  let bx = ML;
  const by = 180;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  for (const badge of badges) {
    const tw = doc.getTextWidth(badge) + 16;
    doc.setFillColor(197, 160, 34, 0.15);
    doc.setDrawColor(197, 160, 34);
    doc.roundedRect(bx, by - 6, tw, 18, 4, 4, 'FD');
    doc.setTextColor(197, 160, 34);
    doc.text(badge, bx + 8, by + 6);
    bx += tw + 8;
  }

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(new Date().toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' }), ML, pageH - 30);

  return 0; // cover page done, next content starts on new page
}

function drawSections(doc: jsPDF): void {
  const guide = OTA_GUIDE_AZ;
  const cw = doc.internal.pageSize.getWidth() - ML - MR;

  doc.addPage();
  let y = 25;

  for (const section of guide.sections) {
    y = ensureSpace(doc, y, 30);

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 46);

    // Gold accent bar
    doc.setFillColor(197, 160, 34);
    doc.rect(ML, y - 4, 4, 16, 'F');

    const titleLines = doc.splitTextToSize(sanitize(section.title), cw - 10);
    doc.text(titleLines, ML + 10, y + 6);
    y += titleLines.length * 7 + 10;

    // Bullets
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    for (const bullet of section.bullets) {
      y = ensureSpace(doc, y, 15);
      const lines = doc.splitTextToSize(sanitize(`• ${bullet}`), cw - 8);
      doc.text(lines, ML + 6, y);
      y += lines.length * 5 + 3;
    }

    y += 8;
  }
}

function drawCtaPage(doc: jsPDF): void {
  const guide = OTA_GUIDE_AZ;
  const pageW = doc.internal.pageSize.getWidth();
  const cw = pageW - ML - MR;

  doc.addPage();

  // CTA section
  doc.setFillColor(26, 26, 46);
  doc.rect(ML - 5, 30, cw + 10, 80, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(sanitize(guide.ctaHeadline), ML + 10, 55);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const bodyLines = doc.splitTextToSize(sanitize(guide.ctaBody), cw - 20);
  doc.text(bodyLines, ML + 10, 68);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(197, 160, 34);
  doc.text(sanitize(guide.ctaContact), ML + 10, 95);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `DK Agency | ${new Date().toLocaleDateString('az-AZ')} | dkagency.com.tr`,
    ML,
    doc.internal.pageSize.getHeight() - 15,
  );
}

export async function generateOtaGuidePdf(): Promise<Buffer> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawCover(doc);
  drawSections(doc);
  drawCtaPage(doc);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
