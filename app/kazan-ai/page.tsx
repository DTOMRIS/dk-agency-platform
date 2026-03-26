import type { Metadata } from 'next';
import KazanAiChatClient from '@/components/kazan-ai/KazanAiChatClient';

export const metadata: Metadata = {
  title: 'KAZAN AI — Restoranının AI danışmanı',
  description:
    'KAZAN AI food cost, P&L, AQTA, delivery və restoran açılışı mövzularında Azərbaycan HoReCa sektoru üçün çalışan AI danışmanıdır.',
};

export default function KazanAiPage() {
  return <KazanAiChatClient />;
}
