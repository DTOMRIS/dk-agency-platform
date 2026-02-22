import type { Metadata } from 'next';
import HomeShell from '@/components/home/HomeShell';

export const metadata: Metadata = {
  title: 'DK Agency | Growth OS for HoReCa',
  description:
    'Kinetic, modular operating system for HoReCa teams: analytics, listings, newsroom and execution workflows.',
  alternates: {
    canonical: 'https://dkagency.az/',
  },
};

export default function HomePage() {
  return <HomeShell />;
}
