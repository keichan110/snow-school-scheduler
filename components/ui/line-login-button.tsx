'use client';

import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { forwardRef } from 'react';

export interface LineLoginButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LineLoginButton = forwardRef<HTMLButtonElement, LineLoginButtonProps>(
  ({ className, size = 'md', text = 'LINEでログイン', disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-10 px-4 text-sm gap-2',
      md: 'h-12 px-6 text-base gap-3',
      lg: 'h-14 px-8 text-lg gap-4',
    };

    const iconSizes = {
      sm: { width: 28, height: 28 },
      md: { width: 32, height: 32 },
      lg: { width: 36, height: 36 },
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative font-medium transition-colors duration-200',
          'bg-[#06C755] text-white hover:bg-[#06C755]',
          'hover:bg-opacity-90 active:bg-opacity-70',
          'disabled:border disabled:border-gray-300 disabled:bg-white disabled:text-black/20',
          sizeClasses[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        <Image
          src="/line_icon.png"
          alt="LINE"
          width={iconSizes[size].width}
          height={iconSizes[size].height}
          className={cn('shrink-0', disabled && 'opacity-20')}
        />
        <span>{text}</span>
      </Button>
    );
  }
);

LineLoginButton.displayName = 'LineLoginButton';

export { LineLoginButton };
