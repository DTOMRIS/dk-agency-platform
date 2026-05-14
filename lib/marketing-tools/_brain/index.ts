import { DOGAN_DERSLERI } from './dogan-dersleri';
import { KAHI_EXAMPLES } from './kahi-examples';
import { TRENDS_2026 } from './trends-2026';
import { METHODOLOGY } from './methodology';
import { AZ_CALENDAR_2026, REGION_PROFILES_BAKU } from './az-calendar-2026';

export type ToolSlug =
  | 'sezon-planlama'
  | 'marka-kompasi'
  | 'kst-yoxlayici'
  | 'menyu-analitigi'
  | 'sikayet-analitigi'
  | 'promosyon-roi'
  | 'musteri-persona';

export function buildBrainContext(toolSlug: ToolSlug): string {
  const sections: string[] = [
    `=== DOGAN DERSLERI (DK Agency MOAT) ===\n${DOGAN_DERSLERI.coreRules}`,
  ];

  switch (toolSlug) {
    case 'sezon-planlama':
      sections.push(`=== AZ 2026 TEQVIM ===\n${JSON.stringify(AZ_CALENDAR_2026, null, 2)}`);
      sections.push(`=== BAKI REGION PROFILLERI ===\n${JSON.stringify(REGION_PROFILES_BAKU, null, 2)}`);
      sections.push(`=== KAHI NUMUNE: 12 HEFTELIK ROADMAP ===\n${KAHI_EXAMPLES.weeklyRoadmap}`);
      sections.push(`=== KAHI NUMUNE: 7 PILLELI TETBIQ ===\n${KAHI_EXAMPLES.sevenPillarsApplication}`);
      sections.push(`=== METODOLOGIYA ===\n${JSON.stringify(METHODOLOGY.sevenPillars, null, 2)}`);
      sections.push(`=== 2026 TRENDLERI ===\nGEO/AEO: ${TRENDS_2026.geoAeo.description}\n\nAI Decisioning: ${TRENDS_2026.aiDecisioning.description}\n\nRCS: ${TRENDS_2026.rcs.description}`);
      sections.push(`=== ROI QAYDA ===\nMinimum ROI: ${METHODOLOGY.roiRules.minimumROI}%\nMax endirim: ${METHODOLOGY.roiRules.maxDiscount}%`);
      break;
    case 'menyu-analitigi':
      sections.push(`=== KAHI NUMUNE: MENU ENGINEERING ===\n${KAHI_EXAMPLES.menuEngineering}`);
      sections.push(`=== BCG MATRISI ===\n${JSON.stringify(METHODOLOGY.bcgMatrix, null, 2)}`);
      sections.push(`=== TIER PRICING ===\n${JSON.stringify(METHODOLOGY.tierPricing, null, 2)}`);
      break;
    case 'promosyon-roi':
      sections.push(`=== ROI QAYDA ===\n${JSON.stringify(METHODOLOGY.roiRules, null, 2)}`);
      sections.push(`=== AI DECISIONING ===\n${TRENDS_2026.aiDecisioning.description}`);
      break;
    case 'musteri-persona':
      sections.push(`=== HEDEF SEQMENT ===\n${DOGAN_DERSLERI.audienceSegmentation}`);
      sections.push(`=== AI DECISIONING ===\n${TRENDS_2026.aiDecisioning.description}`);
      break;
    case 'marka-kompasi':
    case 'kst-yoxlayici':
    case 'sikayet-analitigi':
      break;
  }

  return sections.join('\n\n---\n\n');
}
