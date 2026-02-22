'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function KineticLayers() {
  const reduced = useReducedMotion();

  if (reduced) {
    return null;
  }

  const cards = [
    { label: 'COGS Alert', value: 'Tomato +6%', x: -12, y: -8, d: 0 },
    { label: 'Shift Plan', value: '2 role gaps', x: 10, y: -12, d: 0.35 },
    { label: 'Campaign', value: 'Wolt lunch push', x: 16, y: 10, d: 0.7 },
  ];

  return (
    <div className="dk-kinetic-layers" aria-hidden="true">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          className="dk-kinetic-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: [card.y, card.y - 8, card.y], x: [card.x, card.x + 6, card.x] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: card.d }}
          style={{ transform: `translate(${card.x}px, ${card.y}px)` }}
        >
          <small>{card.label}</small>
          <b>{card.value}</b>
        </motion.div>
      ))}
    </div>
  );
}
