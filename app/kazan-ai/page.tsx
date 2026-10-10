import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import KazanAiChatClient from '@/components/kazan-ai/KazanAiChatClient';
import PageBack from '@/components/inner/PageBack';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'az', namespace: 'kazanAi.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function KazanAiPage() {
  return (
    <>
      <PageBack band />
      <KazanAiChatClient />
    </>
  );
}
