import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS } from '@/lib/ai-models';
import { requireApiMember } from '@/lib/api/guards';
import { checkRateLimit, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

const AGENT_PROFILES = {
  AlmilaCloser:
    "Sen DK Agency'nin elit B2B satis yoneticisisin. Yatirimcilara DK Franchise ve DK Operations hizmetlerini satarsin. Pazarlama jargonu kullanmaz; Due Diligence, ROI, Menfeet-Zerer optimizasyonu ve Exit Stratejisi gibi analitik terimlerle konusursun. Durustluk, kaliteye yonumluluk ve qazan-qazan felsefesine baglisin.",

  PazarAnalisti:
    'Sen acimasiz bir pazar analisti ve due diligence uzmansin. Azerbaycan e-gov, SIMA, DOST Agentliyi, Vergiler Nazirliyi prosedurlerini ve HORECA yatirim maliyetlerini analiz edersin. Veriye dayali, objektif ve keskin analizler sunarsin.',

  ProjeYoneticisi:
    "Sen acimasiz ve sonuca odakli bir PM'sin. Restoran acilisi operasyonel danismanlik hizmetlerini yonetirsin. Personel temini, butce olusturma, isbasi egitimleri ve acilis oncesi operasyonel darboazlari raporlarsin. Her zaman deadline'lara ve KPI'lara odaklanirsin.",
} as const;

type AgentType = keyof typeof AGENT_PROFILES;
type Provider = 'openai' | 'gemini';

interface OrchestratorRequest {
  taskType: AgentType;
  userPrompt: string;
  provider?: Provider;
}

async function runGemini(userPrompt: string, systemInstruction: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      status: 501,
      payload: { error: 'Gemini not configured' },
    };
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: AI_MODELS.gemini.text,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.2,
    },
  });

  return {
    ok: true as const,
    status: 200,
    payload: {
      success: true,
      provider: 'gemini',
      response: response.text,
    },
  };
}

async function runOpenAi(userPrompt: string, systemInstruction: string) {
  return {
    ok: true as const,
    status: 200,
    payload: {
      success: true,
      provider: 'openai',
      response:
        'OpenAI provider integration bu projede henuz ekli deyil. Prompt emniyetli sekilde kabul edildi.',
      taskPreview: userPrompt.slice(0, 140),
      systemInstructionPreview: systemInstruction.slice(0, 140),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // TASK-0439: bu endpoint sərbəst mətni AI provayderinə göndərir, yəni hər
    // çağırış pul xərcləyir. Əvvəllər heç bir yoxlama yox idi — internetdən
    // istənilən adam GEMINI_API_KEY ilə istədiyini işlədə bilirdi.
    // Yeganə qanuni çağıran `ListingForm`-dur və o, yalnız girişli
    // səhifələrdə (`/ilan-ver`, `/b2b-panel`, `/dashboard`) render olunur,
    // ona görə giriş tələbi mövcud axını sındırmır — ListingForm onsuz da
    // 401/403 cavabını emal edir.
    const guard = await requireApiMember();
    if (!guard.ok) return guard.response;

    // Giriş tək başına kifayət deyil: bir hesab da açarı yandıra bilər.
    const limit = checkRateLimit(`orchestrator:${guard.session.email}`, RATE_LIMITS.orchestratorAi);
    if (!limit.success) return rateLimitExceeded(limit);

    const body: OrchestratorRequest = await request.json();
    const { taskType, userPrompt } = body;
    const provider: Provider = body.provider ?? 'openai';

    if (!taskType || !userPrompt) {
      return NextResponse.json(
        { error: 'taskType ve userPrompt parametreleri zorunludur.' },
        { status: 400 }
      );
    }

    const systemInstruction = AGENT_PROFILES[taskType];
    if (!systemInstruction) {
      return NextResponse.json(
        {
          error: `Gecersiz taskType: ${taskType}. Gecerli degerler: AlmilaCloser, PazarAnalisti, ProjeYoneticisi`,
        },
        { status: 400 }
      );
    }

    const result =
      provider === 'gemini'
        ? await runGemini(userPrompt, systemInstruction)
        : await runOpenAi(userPrompt, systemInstruction);

    return NextResponse.json(
      {
        agent: taskType,
        ...result.payload,
      },
      { status: result.status }
    );
  } catch (error) {
    console.error('Orchestrator API Hatasi:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Gecersiz JSON formati.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Orkestrator islemi sirasinda bir hata olustu.', details: String(error) },
      { status: 500 }
    );
  }
}
