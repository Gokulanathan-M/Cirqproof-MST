import * as React from 'react';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[0.12em] uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050708] disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_20px_50px_rgba(16,185,129,0.25)] hover:brightness-110 active:translate-y-px disabled:opacity-60',
    secondary:
      'border border-white/10 bg-white/5 text-white hover:border-emerald-400/40 hover:bg-white/10 disabled:opacity-60',
    ghost:
      'text-slate-200 hover:bg-white/5 disabled:opacity-60',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-10 px-4 text-[11px]',
    md: 'h-12 px-5 text-[12px]',
    lg: 'h-14 px-6 text-[13px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error = false,
  leftIcon,
  className,
  ...props
}: InputProps) {
  const base =
    'w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/50';

  const state = error
    ? 'border-red-400/60 bg-red-950/10 text-red-100 focus:ring-red-400/60'
    : 'border-white/10 hover:border-white/20 focus:border-emerald-400/50';

  return (
    <label className="block space-y-2">
      {label ? (
        <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </span>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        ) : null}
        <input
          className={cn(base, state, leftIcon ? 'pl-11' : '', className)}
          {...props}
        />
      </div>
    </label>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
}

export function Card({ as: Component = 'div', className, children, ...props }: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/70 shadow-[0_0_0_1px_rgba(15,23,42,0.7),0_25px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    neutral: 'border-white/10 bg-white/5 text-slate-300',
    info: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
    danger: 'border-red-400/30 bg-red-500/10 text-red-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();
  const variant =
    normalized.includes('VERIFIED') || normalized.includes('CONSISTENT') || normalized.includes('SETTLED')
      ? 'success'
      : normalized.includes('CHALLENGED') || normalized.includes('TAMPER') || normalized.includes('ERROR')
        ? 'danger'
        : normalized.includes('FLAGGED') || normalized.includes('AWAIT') || normalized.includes('PENDING')
          ? 'warning'
          : 'info';

  return <Badge variant={variant} className={className} {...props}>{normalized}</Badge>;
}
