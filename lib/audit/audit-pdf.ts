/**
 * @file audit-pdf.ts
 * @purpose Audit hesabatı PDF ixracı
 */

import type { jsPDF } from 'jspdf';

interface AuditData {
  name: string;
  address: string | null;
  phone: string | null;
  category: string;
  status: string;
  createdAt: string;
}

interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{ priority: string; area: string; action: string; dkAgencyHelp: string }>;
  estimatedRevenue: { min: number; max: number; currency: string };
  redFlags: string[];
  summary: string;
}

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

export async function exportAuditToPdf(audit: AuditData, analysis: AiAnalysis) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const ml = 20;
  const mr = 20;
  const cw = pageW - ml - mr;
  let y = 20;

  // ── Header ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RESTORAN AUDIT HESABATI', ml, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitize(audit.name), ml, y);
  y += 6;
  if (audit.address) { doc.text(sanitize(`Unvan: ${audit.address}`), ml, y); y += 6; }
  if (audit.phone) { doc.text(`Telefon: ${audit.phone}`, ml, y); y += 6; }
  doc.text(sanitize(`Kateqoriya: ${audit.category}`), ml, y);
  y += 10;

  // ── Summary ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('XULASE', ml, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(sanitize(analysis.summary), cw);
  doc.text(summaryLines, ml, y);
  y += summaryLines.length * 5 + 4;

  if (analysis.estimatedRevenue) {
    doc.text(
      `Texmini ayliq gelir: ${analysis.estimatedRevenue.min.toLocaleString()}-${analysis.estimatedRevenue.max.toLocaleString()} ${analysis.estimatedRevenue.currency}`,
      ml, y,
    );
    y += 8;
  }

  // ── Strengths ──
  y = printSection(doc, 'GUCLU TEREFLER', analysis.strengths, ml, y, cw, [34, 139, 34]);

  // ── Weaknesses ──
  y = printSection(doc, 'ZEIF TEREFLER', analysis.weaknesses, ml, y, cw, [200, 150, 0]);

  // ── Red Flags ──
  if (analysis.redFlags.length > 0) {
    y = printSection(doc, 'KRITIK PROBLEMLER', analysis.redFlags, ml, y, cw, [200, 30, 30]);
  }

  // ── Recommendations ──
  if (analysis.recommendations.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('TOVSIYELER', ml, y);
    y += 7;

    doc.setFontSize(10);
    for (const rec of analysis.recommendations) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(sanitize(`[${rec.priority.toUpperCase()}] ${rec.area}`), ml, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const actionLines = doc.splitTextToSize(sanitize(rec.action), cw - 5);
      doc.text(actionLines, ml + 5, y);
      y += actionLines.length * 5;
      doc.setTextColor(30, 100, 180);
      const helpLines = doc.splitTextToSize(sanitize(`DK Agency: ${rec.dkAgencyHelp}`), cw - 5);
      doc.text(helpLines, ml + 5, y);
      y += helpLines.length * 5 + 4;
      doc.setTextColor(30, 30, 30);
    }
  }

  // ── Footer ──
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`DK Agency | ${new Date().toLocaleDateString('az-AZ')}`, ml, 285);

  doc.save(`audit-${sanitize(audit.name).replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

function printSection(
  doc: jsPDF,
  title: string,
  items: string[],
  ml: number,
  y: number,
  cw: number,
  rgb: [number, number, number],
): number {
  if (items.length === 0) return y;
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(title, ml, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  for (const item of items) {
    if (y > 270) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(sanitize(`• ${item}`), cw - 5);
    doc.text(lines, ml + 3, y);
    y += lines.length * 5 + 2;
  }

  doc.setTextColor(30, 30, 30);
  return y + 4;
}
