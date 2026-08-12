import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { compressPdf } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, Minimize2, ArrowRight } from 'lucide-react';

export const CompressPdfPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [qualityScale, setQualityScale] = useState<number>(0.7); // 0.4(고압축) ~ 1.0(고화질)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) return;
    setFile(selected);
    setOrigSize(selected.size);
    setResultUrl(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('pdf-compress', 'PDF 용량 줄이기');

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const compressedBytes = await compressPdf(buffer, qualityScale);
      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedSize(blob.size);
      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
    setOrigSize(0);
    setCompressedSize(0);
  };

  const reductionPercent = origSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round(((origSize - compressedSize) / origSize) * 100))
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-compress"
        title="PDF 용량 줄이기 / 압축 (PDF Compress)"
        description="고화질 PDF 문서의 품질 손상을 최소화하면서 파일 용량을 대폭 최적화 압축합니다."
      />

      <AdBanner slotId="compress-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>PDF 용량 압축 완료!</h2>

          {/* 용량 비교 위젯 ⭐ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1.25rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>압축 전</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(origSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <ArrowRight size={24} color="var(--accent-primary)" />
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>압축 후 ({reductionPercent}% 감소)</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{(compressedSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Compressed.pdf" className="btn-primary">
              <Download size={18} /> {t.download} Compressed PDF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          title="용량을 줄일 PDF 파일을 선택하세요"
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>현재 용량: {(origSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {/* 압축 강도 프리셋 선택 레벨 ⭐ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>압축 품질 레벨:</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                {qualityScale <= 0.5 ? '⚡ 강력 압축 (최대 용량 절감)' : qualityScale <= 0.8 ? '⚖️ 권장 표준 압축 (화질+용량 균형)' : '✨ 고화질 압축'}
              </span>
            </div>
            
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.1"
              value={qualityScale}
              onChange={(e) => setQualityScale(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleCompress}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Minimize2 size={18} /> {isProcessing ? t.processing : 'PDF 용량 줄이기 실행'}
          </button>
        </div>
      )}

      <AdBanner slotId="compress-bottom" />
    </div>
  );
};
