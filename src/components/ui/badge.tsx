'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'yellow' | 'success' | 'warning' | 'error';
  className?: string;
}

const variants = {
  default: 'bg-[var(--color-gray-800)] text-[var(--color-gray-300)]',
  yellow: 'bg-[var(--color-yellow)] text-black',
  success: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]/20 text-[var(--color-error)]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
