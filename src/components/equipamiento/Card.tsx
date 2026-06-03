import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'soft' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
}

/**
 * Componente Card del Design System
 * Tarjeta reutilizable para paneles y bloques de contenido
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  id,
}) => {
  const baseClasses = 'rounded-[22px] overflow-hidden';

  const variantClasses = {
    default: 'bg-white border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
    soft: 'bg-slate-50 border border-slate-200 shadow-sm',
    gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg border border-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const isClickable = Boolean(onClick);
  const hoverClass = hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer' : '';
  const clickableClass = isClickable ? 'cursor-pointer' : '';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={id}
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};
