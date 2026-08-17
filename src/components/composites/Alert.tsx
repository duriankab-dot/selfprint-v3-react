

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert = ({ variant = 'info', title, message, onClose }: AlertProps) => {
  const variants = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--color-success)', text: 'var(--color-success)' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--color-error)', text: 'var(--color-error)' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'var(--color-warning)', text: 'var(--color-warning)' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'var(--color-info)', text: 'var(--color-info)' },
  };

  const style = variants[variant];

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--space-md)',
      }}
    >
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: style.text, marginBottom: '4px' }}>
            {title}
          </h4>
        )}
        <p style={{ fontSize: 'var(--font-size-body-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: style.text,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
