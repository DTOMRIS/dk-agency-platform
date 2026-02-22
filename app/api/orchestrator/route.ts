import { NextRequest, NextResponse } from 'next/server';

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
    model: 'gemini-2.0-flash',
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
    const body: OrchestratorRequest = await request.json();
    const { taskType, userPrompt } = body;
    const provider: Provider = body.provider ?? 'openai';

    if (!taskType || !userPrompt) {
      return NextResponse.json({ error: 'taskType ve userPrompt parametreleri zorunludur.' }, { status: 400 });
    }

    const systemInstruction = AGENT_PROFILES[taskType];
    if (!systemInstruction) {
      return NextResponse.json(
        { error: `Gecersiz taskType: ${taskType}. Gecerli degerler: AlmilaCloser, PazarAnalisti, ProjeYoneticisi` },
        { status: 400 },
      );
    }

    const result = provider === 'gemini'
      ? await runGemini(userPrompt, systemInstruction)
      : await runOpenAi(userPrompt, systemInstruction);

    return NextResponse.json(
      {
        agent: taskType,
        ...result.payload,
      },
      { status: result.status },
    );
  } catch (error) {
    console.error('Orchestrator API Hatasi:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Gecersiz JSON formati.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Orkestrator islemi sirasinda bir hata olustu.', details: String(error) },
      { status: 500 },
    );
  }
}
