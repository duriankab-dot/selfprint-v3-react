import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumb = ({ items, onNavigate }: BreadcrumbProps) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        fontSize: 'var(--font-size-body-small)',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>}
          {item.href ? (
            <button
              onClick={() => onNavigate?.(item.href!)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
