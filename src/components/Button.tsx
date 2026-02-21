import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-darkest-blue text-modules hover:bg-dark-blue focus:ring-dark-blue',
    secondary: 'bg-clickable text-primary-text hover:bg-clickable-hover focus:ring-clickable',
    outline: 'border-2 border-darkest-blue text-darkest-blue hover:bg-darkest-blue hover:text-modules focus:ring-darkest-blue',
  };

  // Mobile sizes (default) and Desktop sizes (md: prefix)
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs md:px-3 md:py-1.5 md:text-sm',
    md: 'px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base',
    lg: 'px-4 py-2 text-base md:px-6 md:py-3 md:text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
