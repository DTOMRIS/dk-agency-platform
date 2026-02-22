import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const AGENT_PROFILES = {
  AlmilaCloser:
    "Sen DK Agency'nin elit B2B satis yoneticisisin. Yatirimcilara DK Franchise ve DK Operations hizmetlerini satarsin. Pazarlama jargonu kullanmaz; Due Diligence, ROI, Menfeet-Zerer optimizasyonu ve Exit Stratejisi gibi analitik terimlerle konusursun. Durustluk, kaliteye yonumluluk ve qazan-qazan felsefesine baglisin.",

  PazarAnalisti:
    'Sen acimasiz bir pazar analisti ve due diligence uzmansin. Azerbaycan e-gov, SIMA, DOST Agentliyi, Vergiler Nazirliyi prosedurlerini ve HORECA yatirim maliyetlerini analiz edersin. Veriye dayali, objektif ve keskin analizler sunarsin.',

  ProjeYoneticisi:
    "Sen acimasiz ve sonuca odakli bir PM'sin. Restoran acilisi operasyonel danismanlik hizmetlerini yonetirsin. Personel temini, butce olusturma, isbasi egitimleri ve acilis oncesi operasyonel darboazlari raporlarsin. Her zaman deadline'lara ve KPI'lara odaklanirsin.",
} as const;

type AgentType = keyof typeof AGENT_PROFILES;

interface OrchestratorRequest {
  taskType: AgentType;
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const ai = getAiClient();
    if (!ai) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY tanimli degil. Orchestrator calistirilamadi.' },
        { status: 503 },
      );
    }

    const body: OrchestratorRequest = await request.json();
    const { taskType, userPrompt } = body;

    if (!taskType || !userPrompt) {
      return NextResponse.json({ error: 'taskType ve userPrompt parametreleri zorunludur.' }, { status: 400 });
    }

    let systemInstruction: string;

    switch (taskType) {
      case 'AlmilaCloser':
        systemInstruction = AGENT_PROFILES.AlmilaCloser;
        break;
      case 'PazarAnalisti':
        systemInstruction = AGENT_PROFILES.PazarAnalisti;
        break;
      case 'ProjeYoneticisi':
        systemInstruction = AGENT_PROFILES.ProjeYoneticisi;
        break;
      default:
        return NextResponse.json(
          { error: `Gecersiz taskType: ${taskType}. Gecerli degerler: AlmilaCloser, PazarAnalisti, ProjeYoneticisi` },
          { status: 400 },
        );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return NextResponse.json({
      success: true,
      agent: taskType,
      response: response.text,
    });
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
