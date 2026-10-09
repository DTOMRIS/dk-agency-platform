/**
 * @file InnerParts.tsx
 * @purpose Shared building blocks of the v2 inner pages (Toolkit, Sektor Nəbzi, Bloq): back button,
 *          live status, Telegram band, WhatsApp/Telegram share, generated news cover, founder card,
 *          KAZAN AI box. Label-only props so server and client pages can both use them.
 * @task TASK-0514
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { TELEGRAM_URL } from '@/lib/contact-channels';
import { APP_TIME_ZONE, formatAzDate } from '@/lib/i18n/format';
import home from '@/components/home/v2/homeV2.module.css';
import { Icon, type IconName } from '@/components/home/v2/shared';
import s from './inner.module.css';

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={s.back}>
      <Icon name="left" />
      {label}
    </Link>
  );
}

export function Crumbs({
  backHref,
  backLabel,
  trail,
}: {
  backHref: string;
  backLabel: string;
  trail?: string;
}) {
  return (
    <div className={s.crumbs}>
      <BackLink href={backHref} label={backLabel} />
      {trail ? <small>{trail}</small> : null}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={className ? `${home.eyebrow} ${className}` : home.eyebrow}>
      <span className={home.dot} />
      {children}
    </span>
  );
}

export function LiveStatus({ label }: { label: string }) {
  return <span className={s.status}>{label}</span>;
}

export function TelegramBand({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <div className={s.tgBand}>
      <span className={s.tgIc}>
        <Icon name="tg" />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <a
        className={`${home.btn} ${s.tgBtn}`}
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="tg" />
        {cta}
      </a>
    </div>
  );
}

/** WhatsApp + Telegram share links (plain links — no wa.me lead counting for shares). */
export function ShareLinks({
  url,
  title,
  waLabel,
  tgLabel,
}: {
  url: string;
  title: string;
  waLabel: string;
  tgLabel: string;
}) {
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  return (
    <div className={s.share}>
      <a className={`${s.sh} ${s.shWa}`} href={wa} target="_blank" rel="noopener noreferrer">
        <Icon name="chat" />
        {waLabel}
      </a>
      <a className={`${s.sh} ${s.shTg}`} href={tg} target="_blank" rel="noopener noreferrer">
        <Icon name="tg" />
        {tgLabel}
      </a>
    </div>
  );
}

export type NewsCategory = 'finance' | 'operations' | 'growth' | 'market' | 'technology';

export const NEWS_CATEGORY_ICON: Record<NewsCategory, IconName> = {
  finance: 'bars',
  operations: 'brief',
  growth: 'trend',
  market: 'store',
  technology: 'cpu',
};

const NEWS_GRADIENT: Record<NewsCategory, string> = {
  finance: s.g_finance,
  operations: s.g_operations,
  growth: s.g_growth,
  market: s.g_market,
  technology: s.g_technology,
};

export function isNewsCategory(value: string): value is NewsCategory {
  return value in NEWS_GRADIENT;
}

/**
 * News visual: the article image when there is one, otherwise a generated cover
 * (category colour + icon + source name). `compact` = icon only (related list thumbnails).
 */
export function NewsCover({
  category,
  categoryLabel,
  source,
  brand,
  imageUrl,
  alt,
  compact = false,
  priority = false,
}: {
  category: string;
  categoryLabel: string;
  source: string;
  brand: string;
  imageUrl?: string | null;
  alt: string;
  compact?: boolean;
  /** Lead/above-the-fold image: eager + high fetch priority instead of lazy. */
  priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={s.coverImg}>
        {/* External news images (RSS, any host) — next/image needs every host in next.config
            remotePatterns (protected file), so this stays <img> with intrinsic size hints,
            lazy loading and async decoding (TASK-0515). The box is sized by CSS (object-fit). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          width={640}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }
  const cat: NewsCategory = isNewsCategory(category) ? category : 'market';
  const icon = NEWS_CATEGORY_ICON[cat];
  if (compact) {
    return (
      <div className={`${s.cover} ${NEWS_GRADIENT[cat]}`} aria-hidden="true">
        <Icon name={icon} />
      </div>
    );
  }
  return (
    <div className={`${s.cover} ${NEWS_GRADIENT[cat]}`} aria-hidden="true">
      <Icon name={icon} className={s.coverBig} />
      <div className={s.cTop}>
        <span className={s.cCat}>{categoryLabel}</span>
        <span className={s.cIc}>
          <Icon name={icon} />
        </span>
      </div>
      <div>
        <div className={s.cSrc}>{source}</div>
        <div className={s.cBrand}>{brand}</div>
      </div>
    </div>
  );
}

export function FounderCard({
  eyebrow,
  name,
  role,
  body,
  cta,
  ctaHref,
}: {
  eyebrow: string;
  name: string;
  role: string;
  body: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <div className={s.founder}>
      <span className={s.av} aria-hidden="true">
        DT
      </span>
      <div>
        <span className={home.eyebrow}>{eyebrow}</span>
        <h3>{name}</h3>
        <div className={s.role}>{role}</div>
        <p>{body}</p>
        <a
          className={`${home.btn} ${home.btnDark} ${home.btnSm}`}
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="chat" />
          {cta}
        </a>
      </div>
    </div>
  );
}

export function KazanBox({
  eyebrow,
  title,
  body,
  cta,
  href,
  foot,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  foot: string;
}) {
  return (
    <div className={s.kazan}>
      <span className={`${home.eyebrow} ${s.kazanEyebrow}`}>
        <Icon name="spark" />
        {eyebrow}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <Link className={`${home.btn} ${home.btnRed} ${home.btnSm}`} href={href}>
        {cta}
        <Icon name="arrow" />
      </Link>
      <div className={s.kazanFoot}>{foot}</div>
    </div>
  );
}

/** Small tool link card (news sidebar, blog aside). */
export function ToolMini({
  href,
  icon,
  iconClass,
  title,
  sub,
}: {
  href: string;
  icon: IconName;
  iconClass: string;
  title: string;
  sub: string;
}) {
  return (
    <Link href={href} className={s.tkMini}>
      <span className={`${s.tkMiniIc} ${iconClass}`}>
        <Icon name={icon} />
      </span>
      <span>
        <b>{title}</b>
        <span>{sub}</span>
      </span>
    </Link>
  );
}

/** Group colour class for tool icons (Xərc / Gəlir / Açılış / Kadr). */
export const TOOL_GROUP_CLASS: Record<'xerc' | 'gelir' | 'acilis' | 'kadr', string> = {
  xerc: s.g_xerc,
  gelir: s.g_gelir,
  acilis: s.g_acilis,
  kadr: s.g_kadr,
};

/** Reading time from word count (≈200 words per minute, minimum 1). */
export function readMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const DATE_TAG = { ru: 'ru-RU', en: 'en-GB', tr: 'tr-TR' } as const;

/** «8 oktyabr 2026» in the page locale (Baku time). Format on the server and pass strings down. */
export function formatInnerDate(
  value: string | Date,
  locale: 'az' | 'ru' | 'en' | 'tr',
  withYear = true
): string {
  if (locale === 'az') {
    return formatAzDate(value, withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' });
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(DATE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: APP_TIME_ZONE,
  });
}

/** Plain text from a markdown summary (headings, bold, italics, code, links). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}
