import type { Metadata } from 'next';
import KazanAiChatClient from '@/components/kazan-ai/KazanAiChatClient';

export const metadata: Metadata = {
  title: 'KAZAN AI — Restoranının AI danışmanı',
  description:
    'KAZAN AI restoranlar üçün food cost, P&L, AQTA, delivery və açılış qərarlarını satış yönlü şəkildə şərh edən AI danışmandır.',
};

export default function KazanAiPage() {
  return <KazanAiChatClient />;
}
