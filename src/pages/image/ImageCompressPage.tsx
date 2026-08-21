import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { compressImage } from '../../utils/imageServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Minimize2 } from 'lucide-react';

export const ImageCompressPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.75);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '용량을 줄일 이미지를 선택하세요', qualityLabel: '압축 품질 (Quality):', btn: '이미지 용량 줄이기 압축 시작', done: '이미지 용량 압축 완료!' },
    en: { selectTitle: 'Select image to compress', qualityLabel: 'Compression Quality:', btn: 'Start Image Compression', done: 'Image Compression Completed!' },
    es: { selectTitle: 'Seleccione imagen para comprimir', qualityLabel: 'Calidad de Compresión:', btn: 'Iniciar Compresión de Imagen', done: '¡Compresión Completada!' },
    zh: { selectTitle: '选择要压缩的图像', qualityLabel: '压缩质量 (Quality)：', btn: '开始压缩图像体积', done: '图像压缩完成！' },
    ja: { selectTitle: '容量を減らす画像を選択してください', qualityLabel: '圧縮品質 (Quality):', btn: '画像容量軽量化・圧縮を開始', done: '画像圧縮完了！' },
  }[language] || { selectTitle: 'Select image to compress', qualityLabel: 'Compression Quality:', btn: 'Start Image Compression', done: 'Image Compression Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);

    try {
      setProgress(60);
      const res = await compressImage(file, quality);
      const url = URL.createObjectURL(res.blob);

      setProgress(100);
      setResultBlob(res.blob);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Compress failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-compress"
        title="이미지 용량 줄이기 / 압축"
        description="화질 손실을 최소화하면서 JPG, PNG, WEBP 이미지 용량을 최대 80% 축소합니다."
      />

      <AdBanner slotId="compress-top" />

      {resultUrl && resultBlob && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem' }}>
            <span>Original: {(file.size / 1024).toFixed(1)} KB</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              Compressed: {(resultBlob.size / 1024).toFixed(1)} KB ({Math.round(((file.size - resultBlob.size) / file.size) * 100)}% Saved)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Compressed_${file.name}`} className="btn-primary">
              <Download size={18} /> {t.download}
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="image/*"
          onFilesSelected={handleFileSelected}
          title={labels.selectTitle}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>{labels.qualityLabel}</span>
              <span style={{ color: 'var(--accent-primary)' }}>{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
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
            <Minimize2 size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="compress-bottom" />

      <ToolGuideSection
        toolId="image-compress"
        toolTitle="무료 이미지 용량 줄이기 & 고효율 압축 (Image Compressor)"
        categoryName="이미지 & AI 도구"
      />
    </div>
  );
};

