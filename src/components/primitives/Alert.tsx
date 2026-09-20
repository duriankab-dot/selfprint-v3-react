import React from 'react';

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  message: string;
}

const VARIANT_STYLES = {
  error: 'bg-red-500/10 border-red-500/30 text-red-200',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
  success: 'bg-green-500/10 border-green-500/30 text-green-200',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
};

export function Alert({ variant = 'info', message }: AlertProps) {
  return (
    <div
      className={`border rounded-lg px-4 py-3 ${VARIANT_STYLES[variant]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
