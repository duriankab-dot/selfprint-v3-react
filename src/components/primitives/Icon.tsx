import React from 'react';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'inherit';
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 'md', color = 'inherit', ...props }, ref) => {
    const sizes = {
      sm: 16,
      md: 24,
      lg: 32,
    };

    const colors = {
      primary: 'var(--color-accent-primary)',
      secondary: 'var(--color-accent-secondary)',
      inherit: 'currentColor',
    };

    return (
      <svg
        ref={ref}
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
