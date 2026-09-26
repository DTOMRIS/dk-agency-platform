import { NextRequest, NextResponse, after } from 'next/server';
import { getBlogPostRaw } from '@/lib/db/blog-repository';
import { getTranslationJob, startTranslationJob } from '@/lib/blog/translationJobs';
import { getServerMemberSession } from '@/lib/members/server-session';

// Admin-triggered translation of an existing blog post (AZ → ru/en/tr).
// TASK-0455: runs in the background — POST starts the job and returns at once
// (a 1–3 min request was cut by the proxy), GET reports per-language status
// (no silent failure) and, when finished, the fresh RU/EN/TR fields so the
// editor can update its state (otherwise the next «Yadda saxla» would write
// the old translations back).

async function requireAdmin() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { slug?: string; force?: boolean };
  if (!body.slug) {
    return NextResponse.json({ ok: false, error: 'slug tələb olunur' }, { status: 400 });
  }

  const { job, started, done } = startTranslationJob(body.slug, { force: body.force === true });
  if (started) after(() => done);

  return NextResponse.json(
    { ok: true, status: job.status, started, startedAt: job.startedAt },
    { status: 202 }
  );
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'slug tələb olunur' }, { status: 400 });
  }

  const job = getTranslationJob(slug);
  if (!job) return NextResponse.json({ ok: true, status: 'idle' });
  if (job.status === 'running') {
    return NextResponse.json({ ok: true, status: 'running', startedAt: job.startedAt });
  }

  const post = await getBlogPostRaw(slug);
  const fields = post
    ? {
        titleRu: post.title_ru || '',
        titleEn: post.title_en || '',
        titleTr: post.title_tr || '',
        contentRu: post.content_ru || '',
        contentEn: post.content_en || '',
        contentTr: post.content_tr || '',
      }
    : null;

  return NextResponse.json({
    ok: true,
    status: job.status,
    langs: job.result?.langs,
    error: job.result?.error,
    fields,
  });
}
