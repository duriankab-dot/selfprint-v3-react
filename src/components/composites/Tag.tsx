

interface TagProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'hub' | 'mood';
}

export const Tag = ({ label, onRemove, variant = 'default' }: TagProps) => {
  const variants = {
    default: {
      bg: 'var(--color-accent-primary)',
      color: 'var(--color-accent-secondary)',
    },
    hub: {
      bg: 'var(--color-accent-primary)',
      color: 'var(--color-accent-secondary)',
    },
    mood: {
      bg: 'var(--color-accent-mood, var(--color-accent-primary))',
      color: 'var(--color-accent-secondary)',
    },
  };

  const style = variants[variant];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-body-small)',
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            fontSize: '16px',
            padding: 0,
            marginLeft: '4px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
