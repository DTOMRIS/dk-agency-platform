import type { Metadata } from 'next';
import KazanAiChatClient from '@/components/kazan-ai/KazanAiChatClient';

export const metadata: Metadata = {
  title: 'KAZAN AI — HoReCa Məsləhətçin',
  description:
    'Restoran əməliyyatları, food cost, P&L, AQTA və menyu haqqında AI dəstəyi.',
};

export default function KazanAiPage() {
  return <KazanAiChatClient />;
}
