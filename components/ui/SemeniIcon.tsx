'use client';

// Semeni — Novruz simvolu (buğda cücərtiləri + qırmızı lent)
// Minimalist, vektor üslub, navbar üçün

interface SemeniIconProps {
  className?: string;
  size?: number;
  title?: string;
}

export default function SemeniIcon({ className = '', size = 24, title = 'Bahar Bayramınız Mübarək!' }: SemeniIconProps) {
  return (
    <span
      className={`semeni-pulse inline-flex items-center justify-center ${className}`}
      title={title}
      role="img"
      aria-label="Semeni - Novruz simvolu"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Buğda saplağı */}
        <path
          d="M12 3v14"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Cücərti yarpaqları (sol) */}
        <path d="M12 5 Q8 7 10 10" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M12 8 Q7 9 9 13" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M12 11 Q6 12 8 16" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" fill="none" />
        {/* Cücərti yarpaqları (sağ) */}
        <path d="M12 5 Q16 7 14 10" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M12 8 Q17 9 15 13" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M12 11 Q18 12 16 16" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" fill="none" />
        {/* Qırmızı lent */}
        <rect x="10" y="8" width="4" height="2" rx="0.5" fill="#dc2626" />
        {/* Başaq */}
        <circle cx="12" cy="3" r="1.2" fill="#22c55e" />
      </svg>
    </span>
  );
}
