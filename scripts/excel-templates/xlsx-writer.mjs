/**
 * @file xlsx-writer.mjs
 * @purpose TASK-0532 — tiny Office Open XML writer for the DK Excel templates (owner 10.10: «üye olanlara excel
 *          verelim, dili düzgün, bizi tanıtsın, logo olsun»). SheetJS community cannot write styles or images, so
 *          the workbook XML is written directly: styles (DK colours), formulas (recalculated on open), merged
 *          cells, frozen panes, conditional formatting, the DK logo as a drawing, hyperlinks via HYPERLINK().
 *          Dev-time only (run by scripts/excel-templates/build.mjs); zips with fflate (present via jspdf).
 */
import { zipSync, strToU8 } from 'fflate';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const col = (n) => {
  let s = '';
  n += 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};
const parseRef = (ref) => {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  let c = 0;
  for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
  return { c: c - 1, r: Number(m[2]) };
};

// ── styles ────────────────────────────────────────────────────────────────
const INK = 'FF0F172A';
const CREAM = 'FFF6F1E9';
const PAPER = 'FFFBF8F3';
const GREY = 'FFF1F5F9';
const LINE = 'FFE4DCCD';
const RED = 'FFD63B54';
const RED_D = 'FFBE2F47';
const SAND = 'FFEFE9DE';

const FONTS = [
  '<font><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/><family val="2"/></font>', // 0 body
  '<font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>', // 1 title
  '<font><sz val="10.5"/><color rgb="FFCBD5E1"/><name val="Calibri"/><family val="2"/></font>', // 2 band text
  '<font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>', // 3 table head
  '<font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/><family val="2"/></font>', // 4 bold
  '<font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/><family val="2"/></font>', // 5 note
  '<font><b/><sz val="11"/><color rgb="FFBE2F47"/><name val="Calibri"/><family val="2"/></font>', // 6 section
  '<font><b/><u/><sz val="11"/><color rgb="FFBE2F47"/><name val="Calibri"/><family val="2"/></font>', // 7 link
  '<font><b/><sz val="13"/><color rgb="FF0F172A"/><name val="Calibri"/><family val="2"/></font>', // 8 h2
  '<font><sz val="10.5"/><color rgb="FF475569"/><name val="Calibri"/><family val="2"/></font>', // 9 hint
];
const fill = (rgb) => `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
const FILLS = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>', fill(INK), fill(CREAM), fill(GREY), fill(SAND), fill(PAPER), fill(RED)];
const BORDERS = [
  '<border><left/><right/><top/><bottom/><diagonal/></border>',
  `<border><left style="thin"><color rgb="${LINE}"/></left><right style="thin"><color rgb="${LINE}"/></right><top style="thin"><color rgb="${LINE}"/></top><bottom style="thin"><color rgb="${LINE}"/></bottom><diagonal/></border>`,
  `<border><left/><right/><top style="medium"><color rgb="${INK}"/></top><bottom/><diagonal/></border>`,
];
// numFmt: 164 money, 165 percent, 166 integer
const NUMFMTS = '<numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="0.0%"/><numFmt numFmtId="166" formatCode="#,##0"/></numFmts>';
// [font, fill, border, numFmt, align]
const XF = {
  default: [0, 0, 0, 0, ''],
  title: [1, 2, 0, 0, 'vertical="center"'],
  band: [2, 2, 0, 0, 'vertical="center"'],
  head: [3, 2, 1, 0, 'horizontal="center" vertical="center" wrapText="1"'],
  inText: [0, 3, 1, 0, 'vertical="center"'],
  inMoney: [0, 3, 1, 164, 'vertical="center"'],
  inInt: [0, 3, 1, 166, 'vertical="center"'],
  inPct: [0, 3, 1, 165, 'vertical="center"'],
  fMoney: [0, 4, 1, 164, 'vertical="center"'],
  fInt: [0, 4, 1, 166, 'vertical="center"'],
  fPct: [0, 4, 1, 165, 'vertical="center"'],
  fText: [4, 4, 1, 0, 'horizontal="center" vertical="center"'],
  label: [4, 0, 0, 0, 'vertical="center"'],
  labelCell: [4, 6, 1, 0, 'vertical="center" wrapText="1"'],
  text: [0, 0, 0, 0, 'vertical="top" wrapText="1"'],
  totMoney: [4, 5, 2, 164, 'vertical="center"'],
  totPct: [4, 5, 2, 165, 'vertical="center"'],
  totLabel: [4, 5, 2, 0, 'vertical="center"'],
  note: [5, 0, 0, 0, 'vertical="top" wrapText="1"'],
  section: [6, 0, 0, 0, 'vertical="center"'],
  link: [7, 0, 0, 0, 'vertical="center"'],
  h2: [8, 0, 0, 0, 'vertical="center"'],
  hint: [9, 0, 0, 0, 'vertical="top" wrapText="1"'],
  legend: [9, 0, 0, 0, 'vertical="center"'],
  legendNote: [5, 0, 0, 0, 'vertical="center"'],
  redBand: [3, 7, 0, 0, 'vertical="center" wrapText="1"'],
};
const XF_KEYS = Object.keys(XF);
export const S = Object.fromEntries(XF_KEYS.map((k, i) => [k, i]));

function stylesXml() {
  const xfs = XF_KEYS.map((k) => {
    const [fo, fi, bo, nf, al] = XF[k];
    return `<xf numFmtId="${nf}" fontId="${fo}" fillId="${fi}" borderId="${bo}" xfId="0"${nf ? ' applyNumberFormat="1"' : ''} applyFont="1" applyFill="1" applyBorder="1"${al ? ` applyAlignment="1"><alignment ${al}/></xf>` : '/>'}`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${NUMFMTS}<fonts count="${FONTS.length}">${FONTS.join('')}</fonts><fills count="${FILLS.length}">${FILLS.join('')}</fills><borders count="${BORDERS.length}">${BORDERS.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${XF_KEYS.length}">${xfs}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="2"><dxf><font><b/><color rgb="${RED_D}"/></font></dxf><dxf><font><b/><color rgb="FF15803D"/></font></dxf></dxfs></styleSheet>`;
}

// ── sheet model ───────────────────────────────────────────────────────────
export class Sheet {
  constructor(name, { widths = [], logo = false, freeze = null, tab = null } = {}) {
    this.name = name;
    this.widths = widths;
    this.logo = logo;
    this.freeze = freeze; // e.g. 'A8'
    this.tab = tab;
    this.cells = new Map(); // ref → {v,f,s}
    this.merges = [];
    this.heights = new Map();
    this.cf = []; // {sqref, op, formula, dxf}
    this.validations = []; // {sqref, list}
  }
  set(ref, value, style = 'default') {
    const cell = { s: S[style] ?? 0 };
    if (value && typeof value === 'object' && 'f' in value) cell.f = value.f;
    else cell.v = value;
    this.cells.set(ref, cell);
    return this;
  }
  style(ref, style) {
    const c = this.cells.get(ref) ?? {};
    c.s = S[style];
    this.cells.set(ref, c);
    return this;
  }
  fillRange(from, to, style) {
    const a = parseRef(from), b = parseRef(to);
    for (let r = a.r; r <= b.r; r++) for (let c = a.c; c <= b.c; c++) {
      const ref = `${col(c)}${r}`;
      if (!this.cells.has(ref)) this.cells.set(ref, { s: S[style] });
      else this.cells.get(ref).s ??= S[style];
    }
    return this;
  }
  merge(range) { this.merges.push(range); return this; }
  height(row, h) { this.heights.set(row, h); return this; }
  over(sqref, formula, dxf = 0) { this.cf.push({ sqref, formula, dxf }); return this; }
  list(sqref, items) { this.validations.push({ sqref, items }); return this; }

  xml(drawRid) {
    const rows = new Map();
    for (const [ref, cell] of this.cells) {
      const { r } = parseRef(ref);
      if (!rows.has(r)) rows.set(r, []);
      rows.get(r).push([ref, cell]);
    }
    const rowXml = [...rows.keys()].sort((a, b) => a - b).map((r) => {
      const cells = rows.get(r).sort((a, b) => parseRef(a[0]).c - parseRef(b[0]).c).map(([ref, c]) => {
        const s = c.s ? ` s="${c.s}"` : '';
        if (c.f !== undefined) return `<c r="${ref}"${s}><f>${esc(c.f)}</f></c>`;
        if (c.v === undefined || c.v === null || c.v === '') return `<c r="${ref}"${s}/>`;
        if (typeof c.v === 'number') return `<c r="${ref}"${s}><v>${c.v}</v></c>`;
        return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
      }).join('');
      const h = this.heights.get(r);
      return `<row r="${r}"${h ? ` ht="${h}" customHeight="1"` : ''}>${cells}</row>`;
    }).join('');
    const cols = this.widths.length
      ? `<cols>${this.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
      : '';
    const pane = this.freeze
      ? (() => { const { c, r } = parseRef(this.freeze); return `<pane${c ? ` xSplit="${c}"` : ''} ySplit="${r - 1}" topLeftCell="${this.freeze}" activePane="bottomLeft" state="frozen"/>`; })()
      : '';
    const merges = this.merges.length ? `<mergeCells count="${this.merges.length}">${this.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
    const cf = this.cf.map((x, i) => `<conditionalFormatting sqref="${x.sqref}"><cfRule type="expression" dxfId="${x.dxf}" priority="${i + 1}"><formula>${esc(x.formula)}</formula></cfRule></conditionalFormatting>`).join('');
    const dv = this.validations.length
      ? `<dataValidations count="${this.validations.length}">${this.validations.map((d) => `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${d.sqref}"><formula1>"${esc(d.items.join(','))}"</formula1></dataValidation>`).join('')}</dataValidations>`
      : '';
    // fitToPage: print every column on one page width (pageSetup fitToWidth=1).
    const tab = `<sheetPr>${this.tab ? `<tabColor rgb="${this.tab}"/>` : ''}<pageSetUpPr fitToPage="1"/></sheetPr>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${tab}<sheetViews><sheetView workbookViewId="0" showGridLines="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>${cols}<sheetData>${rowXml}</sheetData>${merges}${cf}${dv}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>${drawRid ? `<drawing r:id="${drawRid}"/>` : ''}</worksheet>`;
  }
}

const LOGO_EMU = 48 * 9525;
const drawingXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>114300</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>95250</xdr:rowOff></xdr:from><xdr:ext cx="${LOGO_EMU}" cy="${LOGO_EMU}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="DK Agency logo" descr="DK Agency"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${LOGO_EMU}" cy="${LOGO_EMU}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>`;

/** Build the .xlsx bytes. `logoPng` = Uint8Array of the PNG. */
export function buildWorkbook({ sheets, title, subject, logoPng }) {
  const files = {};
  const withLogo = sheets.map((s, i) => (s.logo ? i : -1)).filter((i) => i >= 0);
  files['[Content_Types].xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}${withLogo.map((i) => `<Override PartName="/xl/drawings/drawing${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  files['_rels/.rels'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  files['docProps/core.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title)}</dc:title><dc:subject>${esc(subject)}</dc:subject><dc:creator>DK Agency</dc:creator><cp:keywords>DK Agency, HoReCa, dkagency.com.tr</cp:keywords><dcterms:created xsi:type="dcterms:W3CDTF">2026-10-10T00:00:00Z</dcterms:created></cp:coreProperties>`);
  files['docProps/app.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>DK Agency</Application><Company>DK Agency · dkagency.com.tr</Company></Properties>`);
  files['xl/workbook.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`);
  files['xl/_rels/workbook.xml.rels'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  files['xl/styles.xml'] = strToU8(stylesXml());
  sheets.forEach((s, i) => {
    const n = i + 1;
    files[`xl/worksheets/sheet${n}.xml`] = strToU8(s.xml(s.logo ? 'rIdDraw' : null));
    if (s.logo) {
      files[`xl/worksheets/_rels/sheet${n}.xml.rels`] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdDraw" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${n}.xml"/></Relationships>`);
      files[`xl/drawings/drawing${n}.xml`] = strToU8(drawingXml());
      files[`xl/drawings/_rels/drawing${n}.xml.rels`] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.png"/></Relationships>`);
    }
  });
  if (withLogo.length) files['xl/media/logo.png'] = logoPng;
  return zipSync(files, { level: 9, mtime: new Date('2026-10-10T00:00:00Z') });
}
