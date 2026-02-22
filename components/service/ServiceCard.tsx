import Link from 'next/link';

interface ServiceCardProps {
  slug: string;
  name: string;
  description?: string;
}

export default function ServiceCard({ slug, name, description }: ServiceCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      <Link href={`/randevu?service=${slug}`} className="mt-4 inline-flex rounded-lg bg-[#c14f35] px-4 py-2 text-sm font-semibold text-white">
        Randevu al
      </Link>
    </article>
  );
}
