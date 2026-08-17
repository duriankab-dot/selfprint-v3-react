import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'div';
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body-large' | 'body' | 'body-small' | 'caption';
  children: React.ReactNode;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as = 'p', variant = 'body', ...props }, ref) => {
    const variants = {
      h1: { fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-tight)' },
      h2: { fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-tight)' },
      h3: { fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)', lineHeight: 'var(--line-height-normal)' },
      h4: { fontSize: 'var(--font-size-h4)', fontWeight: 'var(--font-weight-semibold)', lineHeight: 'var(--line-height-normal)' },
      h5: { fontSize: 'var(--font-size-h5)', fontWeight: 'var(--font-weight-medium)', lineHeight: 'var(--line-height-normal)' },
      'body-large': { fontSize: 'var(--font-size-body-large)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-normal)' },
      body: { fontSize: 'var(--font-size-body-base)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-normal)' },
      'body-small': { fontSize: 'var(--font-size-body-small)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-normal)' },
      caption: { fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-tight)' },
    };

    const Element = as as any;

    return (
      <Element
        ref={ref}
        style={{
          color: 'var(--color-text-primary)',
          margin: 0,
          ...variants[variant],
        }}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
