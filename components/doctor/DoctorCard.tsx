import Link from 'next/link';

interface DoctorCardProps {
  slug: string;
  name: string;
  title?: string;
}

export default function DoctorCard({ slug, name, title }: DoctorCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      {title ? <p className="mt-1 text-sm text-slate-600">{title}</p> : null}
      <Link href={`/randevu?doctor=${slug}`} className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
        Randevu al
      </Link>
    </article>
  );
}
