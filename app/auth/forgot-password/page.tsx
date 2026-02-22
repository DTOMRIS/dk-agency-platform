import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[70vh] px-4 py-16 bg-slate-50">
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">Sifre yenileme</h1>
        <p className="mt-3 text-slate-600">Bu demo ortaminda sifre yenileme akisi placeholder olaraq saxlanilib.</p>
        <Link href="/auth/login" className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white font-semibold">
          Girise don
        </Link>
      </div>
    </div>
  );
}
