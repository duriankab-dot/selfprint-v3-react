

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showLabel?: boolean;
}

export const Progress = ({ value, label = 'Progress', showLabel = true }: ProgressProps) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-sm)',
            fontSize: 'var(--font-size-body-small)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>{label}</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedValue}%`,
            backgroundColor: 'var(--color-accent-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
