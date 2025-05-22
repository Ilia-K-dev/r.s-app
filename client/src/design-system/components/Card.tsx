import React from 'react';
import { cardVariants } from '../index';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'default' | 'lg';
  hover?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  padding = 'default',
  hover = false,
  className,
  children,
  ...props 
}) => {
  return (
    <div 
      className={`${cardVariants({ variant, padding })} ${
        hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
      } ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`p-6 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
);

export default Card;
