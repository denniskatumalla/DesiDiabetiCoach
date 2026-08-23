import * as React from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'saffron' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-teal text-fg shadow-card hover:opacity-90',
  saffron: 'bg-accent text-ink shadow-card hover:opacity-90',
  ghost: 'bg-transparent text-accent hover:bg-accent/10',
  outline: 'bg-transparent text-current border border-current/30 hover:border-current/70',
  danger: 'bg-brand-rose text-fg hover:opacity-90',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium transition-[background-color,border-color,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
