import React from 'react';

import { cn } from '../../utils/helpers';

const Button = React.forwardRef(
  ({ className, children, variant = 'primary', size = 'default', ...props }, ref) => (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary/50',
          className,
          variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/80',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variant === 'destructive' &&
            'bg-destructive text-destructive-foreground hover:bg-destructive/80',
          variant === 'outline' &&
            'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground',
          size === 'default' && 'px-4 py-2',
          size === 'sm' && 'px-3 py-1.5 rounded-md',
          size === 'lg' && 'px-8 py-3 rounded-md',
          size === 'icon' && 'h-9 w-9'
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
);
Button.displayName = 'Button';

export { Button };
