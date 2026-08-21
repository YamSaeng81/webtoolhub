import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { resizeImage } from '../../utils/imageServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Maximize2 } from 'lucide-react';

export const ImageResizePage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number>(1.33);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '크기를 조절할 이미지를 선택하세요', widthLabel: '가로 크기 (Width px):', heightLabel: '세로 크기 (Height px):', aspectLabel: '가로/세로 비율 유지', btn: '이미지 크기 조절 실행', done: '이미지 리사이즈 완료!' },
    en: { selectTitle: 'Select image to resize', widthLabel: 'Width (px):', heightLabel: 'Height (px):', aspectLabel: 'Keep Aspect Ratio', btn: 'Resize Image Dimensions', done: 'Image Resize Completed!' },
    es: { selectTitle: 'Seleccione imagen para redimensionar', widthLabel: 'Ancho (px):', heightLabel: 'Alto (px):', aspectLabel: 'Mantener Relación de Aspecto', btn: 'Redimensionar Imagen', done: '¡Redimensionado Completado!' },
    zh: { selectTitle: '选择要调整尺寸的图像', widthLabel: '宽度 (Width px)：', heightLabel: '高度 (Height px)：', aspectLabel: '保持宽高比例', btn: '执行图像尺寸调整', done: '图像尺寸调整完成！' },
    ja: { selectTitle: 'サイズを変更する画像を選択してください', widthLabel: '幅 (Width px):', heightLabel: '高さ (Height px):', aspectLabel: 'アスペクト比を維持', btn: '画像サイズ変更を実行', done: '画像リサイズ完了！' },
  }[language] || { selectTitle: 'Select image to resize', widthLabel: 'Width (px):', heightLabel: 'Height (px):', aspectLabel: 'Keep Aspect Ratio', btn: 'Resize Image Dimensions', done: 'Image Resize Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);

    const img = new Image();
    img.src = URL.createObjectURL(selected);
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOriginalAspect(img.width / img.height);
    };
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (maintainAspect && originalAspect) {
      setHeight(Math.round(w / originalAspect));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (maintainAspect && originalAspect) {
      setWidth(Math.round(h * originalAspect));
    }
  };

  const handleResize = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);

    try {
      setProgress(60);
      const blob = await resizeImage(file, width, height);
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Resize failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-resize"
        title="이미지 크기 / 해상도 조절"
        description="이미지의 가로/세로 픽셀(px) 및 비율을 자율적으로 조절하여 리사이즈합니다."
      />

      <AdBanner slotId="resize-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>
          <p style={{ color: '#10b981', fontWeight: 600 }}>New Resolution: {width} x {height} px</p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Resized_${width}x${height}_${file.name}`} className="btn-primary">
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
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.widthLabel}</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.heightLabel}</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            {labels.aspectLabel}
          </label>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleResize}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Maximize2 size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="resize-bottom" />

      <ToolGuideSection
        toolId="image-resize"
        toolTitle="무료 이미지 크기 & 해상도 조절 (Image Resizer)"
        categoryName="이미지 & AI 도구"
      />
    </div>
  );
};

