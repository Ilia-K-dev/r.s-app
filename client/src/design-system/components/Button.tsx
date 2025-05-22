import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';
import { buttonVariants } from '../index';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'destructive' | 'glass';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  rounded?: 'default' | 'full' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  'aria-label'?: string; // Add aria-label for accessibility
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, isLoading, leftIcon, rightIcon, children, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded }), className)}
        ref={ref}
        disabled={isLoading}
        aria-label={ariaLabel} // Include aria-label
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
