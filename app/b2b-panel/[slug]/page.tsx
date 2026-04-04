interface B2BPanelPlaceholderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function B2BPanelPlaceholderPage({
  params,
}: B2BPanelPlaceholderPageProps) {
  const { slug } = await params;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        B2B Panel
      </p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">
        {slug.replace(/-/g, ' ')}
      </h1>
      <p className="mt-4 text-base text-slate-600">
        Bu bölmə tezliklə aktivləşdiriləcək.
      </p>
    </section>
  );
}
