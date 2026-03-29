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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,color-mix(in srgb, var(--dk-gold) 18%, white)_0%,color-mix(in srgb, var(--dk-paper) 70%, white)_48%,color-mix(in srgb, var(--dk-mint) 20%, white)_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-16 pt-8 lg:grid-cols-[220px_1fr]">
        <StickyChapterNavWp1 />

        <main className="overflow-hidden rounded-3xl border border-[var(--dk-warm-border)] bg-[color:color-mix(in_srgb,var(--dk-paper)_90%,transparent)] shadow-[0_26px_58px_rgba(26,30,33,0.08)]">
          <div className="px-5 pt-5 text-xs uppercase tracking-[0.08em] text-[var(--dk-ink-soft)]">Locale: {locale}</div>
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
