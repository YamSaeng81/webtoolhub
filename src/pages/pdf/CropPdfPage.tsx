import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { cropPdfMargins } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, Crop, Eye } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const CropPdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: 30, bottom: 30, left: 20, right: 20 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // 실시간 1페이지 크롭 미리보기 캔버스 관련 State ⭐
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) {
      alert('PDF file only');
      return;
    }

    setFile(selected);

    // PDF 1페이지 고화질 미리보기 렌더링
    try {
      const buffer = await selected.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        setPreviewImage(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      setPreviewImage(null);
    }
  };

  const handleMarginChange = (key: keyof typeof margins, value: number) => {
    setMargins((prev) => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('crop-pdf', 'PDF 여백 자르기');

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
    setPreviewImage(null);
    setProgress(0);
    setMargins({ top: 30, bottom: 30, left: 20, right: 20 });
  };

  const labels = {
    ko: { selectTitle: '여백을 잘라낼 PDF 파일을 선택하세요', top: '상단 여백 (Top)', bottom: '하단 여백 (Bottom)', left: '좌측 여백 (Left)', right: '우측 여백 (Right)', apply: '지정한 여백 자르기 적용', doneTitle: '여백 자르기 완료!' },
    en: { selectTitle: 'Select PDF file to crop margins', top: 'Top Margin', bottom: 'Bottom Margin', left: 'Left Margin', right: 'Right Margin', apply: 'Apply Crop Margins', doneTitle: 'Margin Crop Completed!' },
    es: { selectTitle: 'Seleccione archivo PDF para recortar márgenes', top: 'Margen Superior', bottom: 'Margen Inferior', left: 'Margen Izquierdo', right: 'Margen Derecho', apply: 'Aplicar Recorte de Márgenes', doneTitle: '¡Recorte Completado!' },
    zh: { selectTitle: '选择要裁剪边距的 PDF 文件', top: '上边距 (Top)', bottom: '下边距 (Bottom)', left: '左边距 (Left)', right: '右边距 (Right)', apply: '应用边距裁剪', doneTitle: '边距裁剪完成！' },
    ja: { selectTitle: '余白를 トリミングするPDFファイルを選択してください', top: '上余白 (Top)', bottom: '下余白 (Bottom)', left: '左余白 (Left)', right: '右余白 (Right)', apply: '余白トリミングを適用', doneTitle: '余白トリミング完了！' },
  }[language] || { selectTitle: 'Select PDF file to crop margins', top: 'Top Margin', bottom: 'Bottom Margin', left: 'Left Margin', right: 'Right Margin', apply: 'Apply Crop Margins', doneTitle: 'Margin Crop Completed!' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="crop-pdf"
        title="PDF 여백 자르기 (Margin Crop)"
        description="1페이지 실시간 미리보기 캔버스를 통해 상/하/좌/우 자를 여백을 눈으로 직관적으로 확인하며 깔끔하게 잘라냅니다."
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

          {/* 1페이지 실시간 크롭 미리보기 캔버스 오버레이 (Live Preview Overlay) ⭐ */}
          {previewImage && (
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', alignSelf: 'flex-start' }}>
                <Eye size={16} /> 1페이지 실시간 크롭 미리보기 (보라색 박스 = 남을 영역):
              </span>

              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '340px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', background: '#fff' }}>
                <img src={previewImage} alt="crop-preview" style={{ maxHeight: '330px', display: 'block', objectFit: 'contain' }} />

                {/* 실시간 여백 마스크 오버레이 */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${(margins.top / 150) * 20}%`,
                    bottom: `${(margins.bottom / 150) * 20}%`,
                    left: `${(margins.left / 150) * 20}%`,
                    right: `${(margins.right / 150) * 20}%`,
                    border: '2px dashed var(--accent-primary)',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)', // 잘려나갈 영역 어둡게 마스킹
                    pointerEvents: 'none',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <span style={{ position: 'absolute', top: '4px', left: '6px', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 700 }}>
                    Cropped View
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 상/하/좌/우 슬라이더 컨트롤 */}
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
