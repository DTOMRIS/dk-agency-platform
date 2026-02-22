import Link from 'next/link';

interface PackageCardProps {
  slug: string;
  name: string;
  description?: string;
}

export default function PackageCard({ slug, name, description }: PackageCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      <Link href={`/elaqe?package=${slug}`} className="mt-4 inline-flex rounded-lg bg-[#1f5b55] px-4 py-2 text-sm font-semibold text-white">
        Muraciet et
      </Link>
    </article>
  );
}
