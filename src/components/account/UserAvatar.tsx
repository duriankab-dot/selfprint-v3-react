import React, { useState, useEffect } from 'react';
import { getLatestProfilePicture } from '../../lib/storage/FileUploadService';

export interface UserAvatarProps {
  imageUrl?: string | null;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  userId?: string;
  twinId?: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const SIZE_MAP = {
  sm: { width: 36, height: 36, fontSize: 14 },
  md: { width: 48, height: 48, fontSize: 18 },
  lg: { width: 60, height: 60, fontSize: 22 },
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  displayName,
  size = 'md',
  className = '',
  onClick,
  userId,
  twinId,
  onImageLoad,
  onImageError,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(imageUrl || null);
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  useEffect(() => {
    if (userId && !imageUrl) {
      getLatestProfilePicture(userId, twinId).then((url) => {
        if (url) {
          setResolvedUrl(url);
          onImageLoad?.();
        }
      });
    }
  }, [userId, twinId, imageUrl]);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || displayName.charAt(0).toUpperCase();

  const baseStyle: React.CSSProperties = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'color-mix(in srgb, var(--color-accent-primary) 18%, transparent)',
    position: 'relative',
    ...(onClick ? { cursor: 'pointer' } : {}),
  };

  if (resolvedUrl && !hasError) {
    return (
      <div className={`user-avatar ${className}`} style={baseStyle} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}>
        <img
          src={resolvedUrl}
          alt={displayName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={() => {
            setHasError(true);
            onImageError?.();
          }}
          onLoad={onImageLoad}
        />
      </div>
    );
  }

  return (
    <div className={`user-avatar user-avatar--fallback ${className}`} style={{ ...baseStyle, fontSize: sizeConfig.fontSize }}>
      {initials}
    </div>
  );
};

export default UserAvatar;
