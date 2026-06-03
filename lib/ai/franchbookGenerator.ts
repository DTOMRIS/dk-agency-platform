import { z } from 'zod';
import { callAIJson } from '@/lib/ai-router';
import {
  FRANCHBOOK_OUTLINE,
  FRANCHBOOK_TOOL_SLUG,
  type FranchbookContent,
  type FranchbookInputs,
  type FranchbookSectionContent,
  type FranchbookSectionOutline,
} from '@/lib/data/franchbookOutline';

const SectionSchema = z.object({
  purpose: z.string().min(20).max(1200),
  procedure: z.array(z.string().min(8).max(500)).min(3).max(8),
  controls: z.array(z.string().min(8).max(500)).min(3).max(8),
  template: z.string().min(20).max(2000),
});

const localeInstruction: Record<string, string> = {
  az: 'Write in Azerbaijani.',
  ru: 'Write in Russian.',
  en: 'Write in English.',
  tr: 'Write in Turkish.',
};

const sectionDescriptions: Record<string, string> = {
  communication: 'communication standards',
  sales_service_culture: 'sales and service culture',
  equipment: 'equipment usage and maintenance',
  logistics_warehouse: 'logistics and warehouse flow',
  cashier_pos: 'cashier and POS procedures',
  cleaning_safety: 'cleaning and safety rules',
  team: 'team structure',
  leadership: 'leadership routines',
  education_training: 'education and training system',
  order_work_satisfaction: 'ordering flow and work satisfaction',
  accounting_finance: 'accounting and finance discipline',
  sales_marketing: 'sales and marketing execution',
  targets: 'target setting',
  rules_inventory: 'rules and inventory control',
  facility_location: 'facility and location setup',
  opening: 'opening process',
  chain_management: 'chain management',
  brand_identity: 'brand identity',
  quality_control: 'quality control',
  audit_procedures: 'audit procedures',
};

function cleanText(value: string, max = 1600) {
  return value
    .replace(/[<>{}[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function sanitizeFranchbookInputs(input: FranchbookInputs): FranchbookInputs {
  return {
    brand: cleanText(input.brand, 120),
    sector: cleanText(input.sector, 120),
    operationDescription: cleanText(input.operationDescription),
    standards: cleanText(input.standards),
    staff: cleanText(input.staff),
    supply: cleanText(input.supply),
    openingProcess: cleanText(input.openingProcess),
  };
}

function buildSystemPrompt(section: FranchbookSectionOutline, inputs: FranchbookInputs, locale: string) {
  return `You are DK Agency's franchise operations advisor.

Task type: FranchbookSection.
Tone: Ahilik/DK tone - precise, practical, responsible, no hype.
Forbidden UI/business terms: CRM, Pipeline, Agentlik, Holdinq, "Tezlikle".

Hard constraints:
- Generate content ONLY for this fixed section: ${section.key} (${sectionDescriptions[section.key]}).
- Do not add new sections, prices, legal promises, campaign claims, or invented facts.
- Use only the business context below.
- This is a skeleton for human review, not final legal or financial advice.
- Return exactly this JSON shape: {"purpose":"...","procedure":["..."],"controls":["..."],"template":"..."}.

Business context:
Brand: ${inputs.brand}
Sector: ${inputs.sector}
Operation description: ${inputs.operationDescription}
Existing standards: ${inputs.standards}
Staff model: ${inputs.staff}
Supply model: ${inputs.supply}
Opening process: ${inputs.openingProcess}

Language: ${localeInstruction[locale] || localeInstruction.az}`;
}

function fallbackSection(section: FranchbookSectionOutline, inputs: FranchbookInputs): FranchbookSectionContent {
  const label = sectionDescriptions[section.key];
  return {
    purpose: `${inputs.brand} ucun ${label} sahesinde minimum islek standart skeleti yaratmaq ve filiallar arasinda eyni icra dilini qorumaq.`,
    procedure: [
      `${label} uzre cavabdeh rolu teyin edin ve gunluk icra ardicilligini yazili saxlayin.`,
      `Yeni emekdas ve franchise alan ucun bu bolmenin addimlarini numune ile izah edin.`,
      `Her filialdan hefte sonu qisa icra qeydi alin ve uyugunsuzluqlari novbeti planlasdirmaya daxil edin.`,
    ],
    controls: [
      `Standart yazili formada movcuddur ve komanda ona erisir.`,
      `Mesul sexs, yoxlama tezliyi ve duzeltme muddedi qeyd olunub.`,
      `Uyugunsuzluq tapildiqda tekrar telim ve duzeltme addimi acilir.`,
    ],
    template: `Bolme: ${label}\nMesul rol:\nYoxlama tezliyi:\nGundelik addimlar:\nUyugunsuzluq qeydi:\nDuzeltme tarixi:`,
  };
}

async function generateSection(
  section: FranchbookSectionOutline,
  inputs: FranchbookInputs,
  locale: string,
  userId: number,
): Promise<{ key: FranchbookSectionOutline['key']; content: FranchbookSectionContent; provider: string }> {
  try {
    const result = await callAIJson<unknown>(
      {
        system: buildSystemPrompt(section, inputs, locale),
        prompt: `Generate the franchbook skeleton content for section key "${section.key}".`,
        maxTokens: 1200,
        temperature: 0.35,
        timeout: 55_000,
        responseFormat: 'json_object',
      },
      {
        preferProvider: 'deepseek',
        toolSlug: FRANCHBOOK_TOOL_SLUG,
        userId,
        locale,
      },
    );

    const parsed = SectionSchema.safeParse(result.data);
    if (!parsed.success) {
      return { key: section.key, content: fallbackSection(section, inputs), provider: 'fallback-schema' };
    }

    return { key: section.key, content: parsed.data, provider: result.meta.provider };
  } catch {
    return { key: section.key, content: fallbackSection(section, inputs), provider: 'fallback-error' };
  }
}

export async function generateFranchbookContent(
  rawInputs: FranchbookInputs,
  locale: string,
  userId: number,
): Promise<{ content: FranchbookContent; providers: string[] }> {
  const inputs = sanitizeFranchbookInputs(rawInputs);
  const entries = await Promise.all(
    FRANCHBOOK_OUTLINE.map((section) => generateSection(section, inputs, locale, userId)),
  );

  const content = Object.fromEntries(
    entries.map((entry) => [entry.key, entry.content]),
  ) as FranchbookContent;

  return {
    content,
    providers: Array.from(new Set(entries.map((entry) => entry.provider))),
  };
}
