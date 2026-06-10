import {
  getBlogTranslationMatrix,
  type FieldStatus,
  type PostLangStatus,
} from '@/lib/db/blog-repository';
import TranslateAllButton from '@/components/dashboard/TranslateAllButton';
import MigrateStructureButtons from '@/components/dashboard/MigrateStructureButtons';

export const dynamic = 'force-dynamic';

const LANGS = ['ru', 'en', 'tr'] as const;
const FIELDS = ['title', 'summary', 'content', 'doganNote', 'guru'] as const;
const FIELD_LABEL: Record<(typeof FIELDS)[number], string> = {
  title: 'Başlıq',
  summary: 'Xülasə',
  content: 'Mətn',
  doganNote: 'Doğan',
  guru: 'Guru',
};

const DOT: Record<FieldStatus, { cls: string; title: string }> = {
  ok: { cls: 'bg-emerald-500', title: 'tərcümə var' },
  untranslated: { cls: 'bg-amber-500', title: 'hələ AZ' },
  missing: { cls: 'bg-red-500', title: 'boş' },
};

function Dot({ status }: { status: FieldStatus }) {
  const d = DOT[status];
  return (
    <span
      title={d.title}
      className={`inline-block h-3 w-3 rounded-full ${d.cls}`}
      aria-label={d.title}
    />
  );
}

export default async function TranslationStatusPage() {
  const matrix = await getBlogTranslationMatrix();

  let ok = 0;
  let untranslated = 0;
  let missing = 0;
  for (const post of matrix) {
    for (const lang of LANGS) {
      for (const field of FIELDS) {
        const s = post.langs[lang][field as keyof PostLangStatus];
        if (s === 'ok') ok += 1;
        else if (s === 'untranslated') untranslated += 1;
        else missing += 1;
      }
    }
  }

  return (
    <div className="p-6 text-slate-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tərcümə statusu</h1>
          <p className="text-sm text-slate-600">
            {matrix.length} blog × 3 dil × 5 sahə — canlı DB-dən hesablanır (saxlanan flaq yox).
          </p>
        </div>
        <TranslateAllButton />
      </div>

      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <h2 className="text-sm font-bold text-slate-800">
          Struktur migration (köhnə → strukturlu)
        </h2>
        <p className="mb-3 text-xs text-slate-600">
          Köhnə blogların markdown içindəki guru/Doğan bloklarını strukturlu sahələrə köçürür. Əvvəl{' '}
          <strong>Öncəbaxış</strong> bas, çıxışı yoxla, sonra <strong>Tətbiq et</strong>. ⚠️
          Tətbiqdən əvvəl Neon backup al.
        </p>
        <MigrateStructureButtons />
      </div>

      <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" /> Tərcümə var: {ok}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> Hələ AZ: {untranslated}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" /> Boş: {missing}
        </span>
      </div>

      {matrix.length === 0 ? (
        <p className="text-sm text-slate-600">Blog tapılmadı (və ya DB əlçatan deyil).</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-bold text-slate-700">Blog</th>
                {LANGS.map((lang) => (
                  <th
                    key={lang}
                    colSpan={FIELDS.length}
                    className="border-l border-slate-200 px-2 py-3 text-center font-bold uppercase tracking-wider text-slate-700"
                  >
                    {lang}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50 text-[11px] text-slate-500">
                <th className="px-4 py-1" />
                {LANGS.map((lang) =>
                  FIELDS.map((field) => (
                    <th
                      key={`${lang}-${field}`}
                      className="border-l border-slate-100 px-2 py-1 font-semibold"
                    >
                      {FIELD_LABEL[field]}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {matrix.map((post) => (
                <tr key={post.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td
                    className="max-w-[18rem] truncate px-4 py-2 font-medium text-slate-800"
                    title={post.titleAz}
                  >
                    {post.titleAz || post.slug}
                  </td>
                  {LANGS.map((lang) =>
                    FIELDS.map((field) => (
                      <td
                        key={`${lang}-${field}`}
                        className="border-l border-slate-100 px-2 py-2 text-center"
                      >
                        <Dot status={post.langs[lang][field as keyof PostLangStatus]} />
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
