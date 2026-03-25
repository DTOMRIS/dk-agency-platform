import HeroSection from '@/components/home/HeroSection';
import StageCardsSection from '@/components/home/StageCardsSection';
import BaslaShowcaseSection from '@/components/home/BaslaShowcaseSection';
import ComparisonSection from '@/components/home/ComparisonSection';
import HizlandirAlternatingSection from '@/components/home/HizlandirAlternatingSection';
import BoyutShowcaseSection from '@/components/home/BoyutShowcaseSection';
import ListingsPreviewSection from '@/components/home/ListingsPreviewSection';
import NewsEditorialSection from '@/components/home/NewsEditorialSection';
import StatsBarSection from '@/components/home/StatsBarSection';
import SignupCtaSection from '@/components/home/SignupCtaSection';
import StickyChapterNavWp1 from '@/components/home/StickyChapterNavWp1';

export default function LocalizedHomeContent({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#efe1ce_0%,#f6f2e9_48%,#eef4ef_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-16 pt-8 lg:grid-cols-[220px_1fr]">
        <StickyChapterNavWp1 />

        <main className="overflow-hidden rounded-3xl border border-[#d8cab8] bg-[#fffdf8]/90 shadow-[0_26px_58px_rgba(26,30,33,0.08)]">
          <div className="px-5 pt-5 text-xs uppercase tracking-[0.08em] text-[#5d6968]">Locale: {locale}</div>
          <HeroSection />
          <StageCardsSection />
          <BaslaShowcaseSection />
          <ComparisonSection />
          <HizlandirAlternatingSection />
          <BoyutShowcaseSection />
          <ListingsPreviewSection />
          <NewsEditorialSection />
          <StatsBarSection />
          <SignupCtaSection />
        </main>
      </div>
    </div>
  );
}
