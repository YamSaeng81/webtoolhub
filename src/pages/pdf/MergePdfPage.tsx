import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { mergeMultiplePdfs } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, Layers, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

export const MergePdfPage: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfOnly = newFiles.filter((f) => f.type.includes('pdf'));
    if (pdfOnly.length === 0) {
      alert('PDF 파일만 선택이 가능합니다.');
      return;
    }
    setFiles((prev) => [...prev, ...pdfOnly]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;

    const nextFiles = [...files];
    const temp = nextFiles[index];
    nextFiles[index] = nextFiles[targetIdx];
    nextFiles[targetIdx] = temp;
    setFiles(nextFiles);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('PDF 합치기를 진행하려면 최소 2개 이상의 PDF 파일이 필요합니다.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('pdf-merge', 'PDF 합치기');

    try {
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
      setProgress(65);
      const mergedBytes = await mergeMultiplePdfs(buffers);
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-merge"
        title="PDF 합치기 (PDF Merge)"
        description="여러 개의 PDF 문서를 드래그 및 버튼으로 원하는 순서대로 배치하여 하나의 깔끔한 PDF 파일로 병합합니다."
      />

      <AdBanner slotId="merge-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>PDF 병합 완료! ({files.length}개 파일)</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Merged.pdf" className="btn-primary">
              <Download size={18} /> {t.download} Merged PDF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : files.length === 0 ? (
        <FileDropzone
          accept="application/pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="하나로 합칠 PDF 파일들을 여러 개 선택하세요"
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>병합할 PDF 목록 ({files.length}개)</h3>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              전체 초기화
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handleMove(idx, 'down')} disabled={idx === files.length - 1} className="btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={() => handleRemove(idx)} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label style={{ cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Plus size={18} /> + PDF 파일 더 추가하기
            <input type="file" accept="application/pdf" multiple onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))} style={{ display: 'none' }} />
          </label>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleMerge}
            disabled={isProcessing || files.length < 2}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Layers size={18} /> {isProcessing ? t.processing : `${files.length}개 PDF 파일 하나로 합치기`}
          </button>
        </div>
      )}

      <AdBanner slotId="merge-bottom" />
    </div>
  );
};
