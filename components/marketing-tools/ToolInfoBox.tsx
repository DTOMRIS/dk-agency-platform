import { ReactNode } from 'react';

interface ToolInfoBoxProps {
  title: string;
  children: ReactNode;
  variant?: 'info' | 'warning' | 'critical';
  emoji?: string;
}

export function ToolInfoBox({
  title,
  children,
  variant = 'info',
  emoji,
}: ToolInfoBoxProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-900',
      defaultEmoji: '💡',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      titleColor: 'text-amber-900',
      defaultEmoji: '⚠️',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      titleColor: 'text-red-900',
      defaultEmoji: '🔴',
    },
  };

  const v = variants[variant];
  const displayEmoji = emoji ?? v.defaultEmoji;

  return (
    <div className={`${v.bg} ${v.border} border rounded-lg p-5 my-4`}>
      <h3 className={`${v.titleColor} font-bold text-base mb-3 flex items-center gap-2`}>
        <span aria-hidden="true">{displayEmoji}</span>
        <span>{title}</span>
      </h3>
      <div className="text-gray-800 leading-relaxed text-sm space-y-2">
        {children}
      </div>
    </div>
  );
}