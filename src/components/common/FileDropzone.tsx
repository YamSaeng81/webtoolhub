import React, { useRef, useState } from 'react';
import { UploadCloud, File } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = '*',
  multiple = false,
  onFilesSelected,
  title,
  subtitle,
}) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayTitle = title || t.dropFileTitle;
  const displaySubtitle = subtitle || t.dropFileSub;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  return (
    <div
      className={`dropzone ${isDragOver ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
        id="file-input"
      />
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <UploadCloud size={32} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{displayTitle}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{displaySubtitle}</p>
      </div>
      <button className="btn-secondary" type="button">
        <File size={16} /> {t.selectFile}
      </button>
    </div>
  );
};
