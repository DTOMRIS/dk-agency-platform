import Link from 'next/link';

export default function SignupCtaSection() {
  return (
    <section id="signup-cta" className="border-t border-[#e3d8c8] px-5 py-12 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Signup CTA</h2>
      <p className="mt-3 max-w-[65ch] text-[#526260]">Activate the growth loop without replacing any existing tools or routes.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/auth/register" className="rounded-xl bg-[#c14f35] px-4 py-2.5 text-white font-semibold">
          Create account
        </Link>
        <Link href="/haberler" className="rounded-xl border border-[#d8cab5] bg-[#fff8ec] px-4 py-2.5 text-[#503f34] font-semibold">
          Open journal
        </Link>
      </div>
    </section>
  );
}
