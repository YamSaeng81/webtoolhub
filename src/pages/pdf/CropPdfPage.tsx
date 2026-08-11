import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { cropPdfMargins } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, Crop } from 'lucide-react';

export const CropPdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: 30, bottom: 30, left: 20, right: 20 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) {
      alert('PDF file only');
      return;
    }
    setFile(selected);
  };

  const handleMarginChange = (key: keyof typeof margins, value: number) => {
    setMargins((prev) => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const croppedBytes = await cropPdfMargins(buffer, margins);
      const blob = new Blob([croppedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

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
    setMargins({ top: 30, bottom: 30, left: 20, right: 20 });
  };

  const labels = {
    ko: { selectTitle: '여백을 잘라낼 PDF 파일을 선택하세요', top: '상단 여백 (Top)', bottom: '하단 여백 (Bottom)', left: '좌측 여백 (Left)', right: '우측 여백 (Right)', apply: '지정한 여백 자르기 적용', doneTitle: '여백 자르기 완료!' },
    en: { selectTitle: 'Select PDF file to crop margins', top: 'Top Margin', bottom: 'Bottom Margin', left: 'Left Margin', right: 'Right Margin', apply: 'Apply Crop Margins', doneTitle: 'Margin Crop Completed!' },
    es: { selectTitle: 'Seleccione archivo PDF para recortar márgenes', top: 'Margen Superior', bottom: 'Margen Inferior', left: 'Margen Izquierdo', right: 'Margen Derecho', apply: 'Aplicar Recorte de Márgenes', doneTitle: '¡Recorte Completado!' },
    zh: { selectTitle: '选择要裁剪边距的 PDF 文件', top: '上边距 (Top)', bottom: '下边距 (Bottom)', left: '左边距 (Left)', right: '右边距 (Right)', apply: '应用边距裁剪', doneTitle: '边距裁剪完成！' },
    ja: { selectTitle: '余白をトリミングするPDFファイルを選択してください', top: '上余白 (Top)', bottom: '下余白 (Bottom)', left: '左余白 (Left)', right: '右余白 (Right)', apply: '余白トリミングを適用', doneTitle: '余白トリミング完了！' },
  }[language] || { selectTitle: 'Select PDF file to crop margins', top: 'Top Margin', bottom: 'Bottom Margin', left: 'Left Margin', right: 'Right Margin', apply: 'Apply Crop Margins', doneTitle: 'Margin Crop Completed!' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="crop-pdf"
        title="PDF 여백 자르기 (Margin Crop)"
        description="PDF 스캔본이나 문서의 불필요한 상/하/좌/우 여백(Margin)을 슬라이더로 손쉽게 조절하여 깔끔하게 자릅니다."
      />

      <AdBanner slotId="crop-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Cropped.pdf" className="btn-primary">
              <Download size={18} /> {t.download} PDF
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
          title={labels.selectTitle}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {(['top', 'bottom', 'left', 'right'] as const).map((key) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{labels[key]}</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{margins[key]} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={margins[key]}
                  onChange={(e) => handleMarginChange(key, Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleCrop}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            id="crop-pdf-btn"
          >
            <Crop size={18} /> {isProcessing ? t.processing : labels.apply}
          </button>
        </div>
      )}

      <AdBanner slotId="crop-bottom" />
    </div>
  );
};
