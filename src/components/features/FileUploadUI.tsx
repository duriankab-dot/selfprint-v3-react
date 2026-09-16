/**
 * FileUploadUI.tsx
 *
 * Profile picture upload component with:
 * - File selection with drag & drop
 * - Image preview
 * - Validation (type + size)
 * - Upload progress
 * - Confirmation flow
 *
 * RESTORED 16 ก.ย. 2026: Restored from git history. The previous version was a
 * placeholder that never called the storage service; this one performs the
 * real upload via FileUploadService.uploadProfilePicture() and renders
 * Thai/English labels via LanguageContext.
 */

import React, { useCallback, useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { uploadProfilePicture, deleteProfilePicture } from '../../lib/storage/FileUploadService';

interface FileUploadUIProps {
  userId: string;
  twinId: string;
  currentUrl?: string | null;
  currentPath?: string | null;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  label?: string;
}

export const FileUploadUI: React.FC<FileUploadUIProps> = ({
  userId,
  twinId,
  currentUrl,
  currentPath,
  onUploadComplete,
  onUploadError,
  label,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultLabel = isTh ? 'อัปโหลดรูปโปรไฟล์' : 'Upload Profile Picture';

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError(isTh ? 'ไฟล์ประเภทไม่ถูกต้อง — ใช้ JPG, PNG, WebP หรือ GIF' : 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onUploadError(isTh ? 'ไฟล์ใหญ่เกินไป — ขนาดสูงสุด 5MB' : 'File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start upload
    setUploading(true);
    setProgress(10);

    try {
      const uploaded = await uploadProfilePicture(userId, twinId, file);
      setProgress(100);
      onUploadComplete(uploaded.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isTh ? 'อัปโหลดล้มเหลว' : 'Upload failed');
      onUploadError(msg);
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  }, [userId, twinId, currentUrl, onUploadComplete, onUploadError, isTh]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(async () => {
    if (currentPath) {
      try {
        await deleteProfilePicture(currentPath);
      } catch (err) {
        onUploadError(err instanceof Error ? err.message : (isTh ? 'ลบรูปไม่สำเร็จ' : 'Failed to remove image'));
      }
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [currentPath, onUploadError, isTh]);

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="file-upload-preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%', objectFit: 'cover' }} />
          <div className="file-upload-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={handleClick} disabled={uploading} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--primary-color)', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? (isTh ? 'กำลังอัปโหลด...' : 'Uploading...') : (isTh ? 'เปลี่ยนรูป' : 'Replace')}
            </button>
            <button onClick={handleRemove} disabled={uploading} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {isTh ? 'ลบรูป' : 'Remove'}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`file-upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--primary-light)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>{label || defaultLabel}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isTh ? 'JPG, PNG, WebP หรือ GIF (สูงสุด 5MB)' : 'JPG, PNG, WebP, or GIF (max 5MB)'}
          </p>
        </div>
      )}

      {uploading && (
        <div className="file-upload-progress" style={{ marginTop: '1rem' }}>
          <div style={{
            height: '4px',
            background: 'var(--border-color)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--primary-color)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isTh ? `กำลังอัปโหลด... ${progress}%` : `Uploading... ${progress}%`}
          </p>
        </div>
      )}
    </div>
  );
};