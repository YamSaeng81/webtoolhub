import React from 'react';

interface ProgressBarProps {
  progress: number;
  statusText?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusText = '파일 처리 중...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
        <span>{statusText}</span>
        <span className="gradient-text">{progress}%</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.2s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};
