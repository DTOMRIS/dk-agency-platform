import { hasFullArticleAccess, type MemberSession } from '@/lib/member-access';

function sliceMarkdownPreview(content: string, ratio = 0.4) {
  if (!content) {
    return '';
  }

  const target = Math.max(300, Math.floor(content.length * ratio));
  const paragraphBreak = content.indexOf('\n\n', target);
  const cutoff = paragraphBreak > -1 ? paragraphBreak : target;

  return `${content.slice(0, cutoff).trim()}\n\n---\n\n> Məqalənin davamı üzvlər üçündür. Tam oxu üçün daxil ol və ya üzv ol.`;
}

export function getProtectedArticleContent(content: string, session: MemberSession, isPremium: boolean, ratio = 0.4) {
  if (!isPremium || hasFullArticleAccess(session)) {
    return content;
  }

  return sliceMarkdownPreview(content, ratio);
}

export function getProtectedTableOfContentsContent(content: string, session: MemberSession, isPremium: boolean) {
  if (!isPremium || hasFullArticleAccess(session)) {
    return content;
  }

  return sliceMarkdownPreview(content, 0.22);
}
