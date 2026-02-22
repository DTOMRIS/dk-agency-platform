'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import styles from './HeroSection.module.css';

interface MotionState {
  enabled: boolean;
  x: number;
  y: number;
}

export default function HeroSection() {
  const [motion, setMotion] = useState<MotionState>({ enabled: true, x: 0, y: 0 });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)');

    const apply = () => {
      setMotion((prev) => ({ ...prev, enabled: !(reduced.matches || mobile.matches) }));
    };

    apply();
    reduced.addEventListener('change', apply);
    mobile.addEventListener('change', apply);

    return () => {
      reduced.removeEventListener('change', apply);
      mobile.removeEventListener('change', apply);
    };
  }, []);

  useEffect(() => {
    if (!motion.enabled) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      setMotion((prev) => ({ ...prev, x, y }));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [motion.enabled]);

  const cardStyle = useMemo(
    () => ({
      transform: motion.enabled
        ? `translate3d(${motion.x * 0.6}px, ${motion.y * 0.6}px, 0)`
        : 'translate3d(0,0,0)',
    }),
    [motion.enabled, motion.x, motion.y],
  );

  return (
    <section id="hero" className="rounded-3xl border border-[#d7cab8] bg-gradient-to-br from-[#fff7ea] via-[#fffdf8] to-[#eef8f4] px-5 py-10 md:px-8">
      <div className="max-w-4xl">
        <span className="inline-flex rounded-full border border-[#b8d4cd] bg-[#e9f5f1] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#1f5b55] uppercase">
          DK Agency v4.1 Homepage
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-[-0.03em] text-[#1f2e4a]">
          World-class HoReCa operating narrative with kinetic clarity.
        </h1>
        <p className="mt-4 max-w-[65ch] text-[#4d5a59] leading-7">
          CloudKitchens-like movement, Restaurant365-like modular storyline. Built to stay light, stable, and measurable.
        </p>
      </div>

      <div className={`mt-8 grid gap-4 md:grid-cols-3 ${styles.floatWrap} ${motion.enabled ? styles.floatEnabled : ''}`}>
        {[1, 2, 3].map((item) => (
          <article
            key={item}
            className={`${styles.floatCard} rounded-2xl border border-[#d4d9d0] bg-white/90 p-4 shadow-[0_10px_24px_rgba(31,46,74,0.08)]`}
            style={cardStyle}
          >
            <Image
              src="/cookies.png"
              alt="Dashboard teaser visual"
              width={320}
              height={190}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 33vw"
              className="h-auto w-full rounded-xl border border-[#ebdfcf]"
            />
            <h2 className="mt-3 text-lg font-semibold text-[#1f2e4a]">Chapter {item}</h2>
            <p className="mt-1 text-sm text-[#596463]">Lightweight visual card with fixed dimensions to prevent CLS.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
