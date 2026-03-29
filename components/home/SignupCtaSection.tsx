import Link from 'next/link';

export default function SignupCtaSection() {
  return (
    <section id="signup-cta" className="border-t border-[var(--dk-warm-border)] px-5 py-12 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Signup CTA</h2>
      <p className="mt-3 max-w-[65ch] text-[var(--dk-ink-soft)]">Activate the growth loop without replacing any existing tools or routes.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/auth/register" className="rounded-xl bg-[var(--dk-red-strong)] px-4 py-2.5 text-white font-semibold">
          Create account
        </Link>
        <Link href="/haberler" className="rounded-xl border border-[var(--dk-warm-border)] bg-dk-paper px-4 py-2.5 text-[color-mix(in srgb, var(--dk-ink) 72%, white)] font-semibold">
          Open journal
        </Link>
      </div>
    </section>
  );
}
