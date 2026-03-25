import React from 'react';

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const btnStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'var(--color-primary)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' },
  ghost: { background: 'transparent', color: 'var(--color-primary)', border: 'none' },
  danger: { background: 'var(--color-danger)', color: '#fff', border: 'none' },
};

const btnSizes = { sm: '7px 14px', md: '10px 20px', lg: '13px 28px' };
const btnFontSizes = { sm: '13px', md: '14px', lg: '15px' };

export function Button({ variant = 'primary', loading, size = 'md', icon, children, style, ...rest }: ButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: btnSizes[size], fontSize: btnFontSizes[size],
        fontWeight: 600, borderRadius: 'var(--radius-sm)',
        transition: 'opacity 0.15s, transform 0.15s',
        opacity: rest.disabled ? 0.5 : 1, fontFamily: 'var(--font)',
        ...btnStyles[variant], ...style,
      }}
      onMouseEnter={e => { if (!rest.disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = rest.disabled ? '0.5' : '1'; }}
      {...rest}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--color-primary)'} /> : icon}
      {children}
    </button>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--color-primary)' }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid transparent`,
      borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; variant?: 'warning' | 'primary' | 'neutral'; }
export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const colors = {
    warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', dot: 'var(--color-warning)' },
    primary: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)', dot: 'var(--color-primary)' },
    neutral: { bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', dot: 'var(--color-text-muted)' },
  }[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      background: colors.bg, color: colors.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot }} />
      {children}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; hoverable?: boolean; }
export function Card({ children, style, onClick, hoverable }: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
        boxShadow: hovered && hoverable ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hovered && hoverable ? 'translateY(-2px)' : 'none',
        cursor: hoverable ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string; error?: string; prefix?: React.ReactNode;
}
export function Input({ label, error, prefix, style, ...rest }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{ position: 'absolute', left: 12, color: 'var(--color-text-muted)', display: 'flex' }}>{prefix}</span>
        )}
        <input
          style={{
            width: '100%', padding: prefix ? '10px 12px 10px 36px' : '10px 12px',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)',
            color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font)',
            outline: 'none', transition: 'border-color 0.15s',
            ...style,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'; }}
          {...rest}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: { value: string; label: string }[];
}
export function Select({ label, error, options, style, ...rest }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</label>}
      <select
        style={{
          width: '100%', padding: '10px 36px 10px 12px',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)',
          color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font)',
          outline: 'none', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          ...style,
        }}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; charCount?: boolean;
}
export function Textarea({ label, error, charCount, value, style, ...rest }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</label>
          {charCount && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {String(value || '').length} символов
            </span>
          )}
        </div>
      )}
      <textarea
        value={value}
        style={{
          width: '100%', padding: '10px 12px', minHeight: 120,
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)',
          color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font)',
          outline: 'none', resize: 'vertical', transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'; }}
        {...rest}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────
interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label?: string; }
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
      <div
        style={{
          width: 44, height: 24, borderRadius: 12, position: 'relative',
          background: checked ? 'var(--color-primary)' : 'var(--color-border)',
          transition: 'background 0.2s', flexShrink: 0,
        }}
        onClick={() => onChange(!checked)}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>}
    </label>
  );
}

// ── Alert ──────────────────────────────────────────────────────────────────
interface AlertProps { title?: string; children: React.ReactNode; variant?: 'warning' | 'error' | 'success'; }
export function Alert({ title, children, variant = 'warning' }: AlertProps) {
  const colors = {
    warning: { bg: 'var(--color-warning-light)', border: 'var(--color-warning)', icon: '⚠️' },
    error: { bg: '#fef2f2', border: 'var(--color-danger)', icon: '❌' },
    success: { bg: 'var(--color-primary-light)', border: 'var(--color-primary)', icon: '✅' },
  }[variant];
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 'var(--radius-sm)',
      background: colors.bg, borderLeft: `4px solid ${colors.border}`,
    }}>
      {title && (
        <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{colors.icon}</span> {title}
        </div>
      )}
      <div style={{ color: 'var(--color-text-secondary)' }}>{children}</div>
    </div>
  );
}

// ── ImagePlaceholder ───────────────────────────────────────────────────────
export function ImagePlaceholder({ width, height, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: width || '100%', height: height || 200,
      background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', ...style,
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────
interface PaginationProps { page: number; total: number; pageSize: number; onChange: (p: number) => void; }
export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)', border: active ? 'none' : '1.5px solid var(--color-border)',
    background: active ? 'var(--color-primary)' : 'var(--color-surface)',
    color: active ? '#fff' : disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
    cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: active ? 700 : 400,
    fontFamily: 'var(--font)',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: 32 }}>
      <button style={btnStyle(false, page === 1)} disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`el${i}`} style={{ width: 36, textAlign: 'center', color: 'var(--color-text-muted)' }}>…</span>
          : <button key={p} style={btnStyle(p === page)} onClick={() => onChange(p as number)}>{p}</button>
      )}
      <button style={btnStyle(false, page === totalPages)} disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: '14px' }}>
        <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '30%' }} />
      </div>
    </div>
  );
}
