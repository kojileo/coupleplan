import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(
          'rounded-lg font-medium transition-colors',
          {
            'bg-rose-600 text-white hover:bg-rose-700': variant === 'primary' && !disabled,
            'bg-pink-100 text-rose-800 hover:bg-pink-200': variant === 'secondary' && !disabled,
            'border-2 border-rose-200 text-rose-700 bg-transparent hover:bg-rose-50':
              variant === 'outline' && !disabled,
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          {
            'opacity-50 cursor-not-allowed': disabled,
          },
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
