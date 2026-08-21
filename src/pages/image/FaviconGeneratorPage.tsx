import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { resizeImage } from '../../utils/imageServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Sparkles } from 'lucide-react';

export const FaviconGeneratorPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [icons, setIcons] = useState<{ size: number; url: string; filename: string }[]>([]);

  const labels = {
    ko: { selectTitle: '파비콘으로 생성할 로고 이미지를 선택하세요', btn: '파비콘(Favicon) 패키지 원클릭 생성', done: '파비콘 패키지 생성 완료!' },
    en: { selectTitle: 'Select logo image to generate favicon package', btn: 'Generate Favicon Package', done: 'Favicon Package Generated!' },
    es: { selectTitle: 'Seleccione imagen para generar favicon', btn: 'Generar Paquete Favicon', done: '¡Paquete Favicon Generado!' },
    zh: { selectTitle: '选择要生成 Favicon 的 Logo 图像', btn: '一键生成全套 Favicon 图标包', done: 'Favicon 图标包生成完成！' },
    ja: { selectTitle: 'ファビコンにするロゴ画像を選択してください', btn: 'ファビコン(Favicon)パックを一括生成', done: 'ファビコンパック生成完了！' },
  }[language] || { selectTitle: 'Select logo image to generate favicon package', btn: 'Generate Favicon Package', done: 'Favicon Package Generated!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(20);

    const sizes = [
      { size: 16, filename: 'favicon-16x16.png' },
      { size: 32, filename: 'favicon-32x32.png' },
      { size: 180, filename: 'apple-touch-icon.png' },
      { size: 512, filename: 'android-chrome-512x512.png' },
    ];

    try {
      const generated: { size: number; url: string; filename: string }[] = [];

      for (let i = 0; i < sizes.length; i++) {
        const item = sizes[i];
        const blob = await resizeImage(file, item.size, item.size);
        const url = URL.createObjectURL(blob);
        generated.push({ size: item.size, url, filename: item.filename });
        setProgress(Math.round(((i + 1) / sizes.length) * 100));
      }

      setIcons(generated);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Favicon Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIcons([]);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="favicon-generator"
        title="파비콘(Favicon) 생성기"
        description="로고 이미지 하나로 웹사이트 필수 파비콘 패키지(ico, 16x16, 32x32, apple-icon)를 원클릭 생성합니다."
      />

      <AdBanner slotId="favicon-top" />

      {icons.length > 0 ? (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{labels.done}</h3>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={16} /> {t.reset}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {icons.map((item) => (
              <div key={item.size} className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                <img src={item.url} alt={`favicon-${item.size}`} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.size}x{item.size} px</span>
                <a href={item.url} download={item.filename} className="btn-secondary" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>
                  <Download size={12} /> Download
                </a>
              </div>
            ))}
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

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Sparkles size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="favicon-bottom" />

      <ToolGuideSection
        toolId="favicon-generator"
        toolTitle="무료 파비콘(Favicon) 패키지 생성기 (Favicon Generator)"
        categoryName="이미지 & AI 도구"
      />
    </div>
  );
};

