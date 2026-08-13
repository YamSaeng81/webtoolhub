import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Film, Play } from 'lucide-react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export const GifMakerPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fps, setFps] = useState<number>(5);
  const [gifWidth, setGifWidth] = useState<number>(400);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: {
      selectTitle: 'GIF 애니메이션으로 만들 여러 장의 이미지를 선택하세요 (PNG, JPG, WEBP)',
      btnMake: '고화질 GIF 애니메이션 짤 제작 실행',
      doneTitle: 'GIF 애니메이션 제작 완료!',
      fpsLabel: '프레임 속도 (FPS):',
      widthLabel: 'GIF 해상도 너비 (px):',
      imagesCount: '선택된 프레임 이미지:',
    },
    en: {
      selectTitle: 'Select multiple images to create GIF animation (PNG, JPG, WEBP)',
      btnMake: 'Generate Animated GIF',
      doneTitle: 'GIF Animation Created!',
      fpsLabel: 'Frame Rate (FPS):',
      widthLabel: 'GIF Resolution Width (px):',
      imagesCount: 'Selected Frame Images:',
    },
    es: {
      selectTitle: 'Seleccione varias imágenes para crear animación GIF',
      btnMake: 'Generar GIF Animado',
      doneTitle: '¡Animación GIF Creada!',
      fpsLabel: 'Velocidad de cuadro (FPS):',
      widthLabel: 'Ancho de resolución GIF (px):',
      imagesCount: 'Imágenes de cuadro seleccionadas:',
    },
    zh: {
      selectTitle: '选择多张图像制作 GIF 动画 (PNG, JPG, WEBP)',
      btnMake: '生成高清 GIF 动图',
      doneTitle: 'GIF 动图制作完成！',
      fpsLabel: '帧率 (FPS)：',
      widthLabel: 'GIF 分辨率宽度 (px)：',
      imagesCount: '已选帧图像：',
    },
    ja: {
      selectTitle: 'GIFアニメーションを作成する複数の画像を選択してください',
      btnMake: '高品質GIFアニメーションを作成',
      doneTitle: 'GIFアニメーション作成完了！',
      fpsLabel: 'フレームレート (FPS):',
      widthLabel: 'GIF解像度幅 (px):',
      imagesCount: '選択されたフレーム画像:',
    },
  }[language] || {
    selectTitle: 'Select multiple images to create GIF animation',
    btnMake: 'Generate Animated GIF',
    doneTitle: 'GIF Animation Created!',
    fpsLabel: 'Frame Rate (FPS):',
    widthLabel: 'GIF Resolution Width (px):',
    imagesCount: 'Selected Frame Images:',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const validImages = selectedFiles.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      alert('이미지 파일만 선택이 가능합니다.');
      return;
    }
    setFiles(validImages);
    setPreviews(validImages.map((f) => URL.createObjectURL(f)));
    setResultUrl(null);
  };

  /**
   * pure JS gifenc 100% 브라우저 메모리 고화질 GIF 렌더링 ⭐
   */
  const handleMakeGif = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(10);
    trackToolUsage('media-gif-maker', 'GIF 애니메이션 제작');

    try {
      const delayMs = Math.round(1000 / fps);
      const encoder = GIFEncoder();

      // 프레임 이미지들 로드
      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < previews.length; i++) {
        const img = new Image();
        img.src = previews[i];
        await new Promise((res) => { img.onload = res; });
        loadedImages.push(img);
        setProgress(10 + Math.round((i / previews.length) * 30));
      }

      // 첫 번째 이미지 비율로 높이 자동 계산
      const firstImg = loadedImages[0];
      const targetWidth = gifWidth;
      const targetHeight = Math.round((firstImg.height / firstImg.width) * targetWidth);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context failed');

      for (let i = 0; i < loadedImages.length; i++) {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(loadedImages[i], 0, 0, targetWidth, targetHeight);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const palette = quantize(imgData.data, 256);
        const index = applyPalette(imgData.data, palette);

        encoder.writeFrame(index, targetWidth, targetHeight, {
          palette,
          delay: delayMs,
        });

        const pct = 40 + Math.round((i / loadedImages.length) * 55);
        setProgress(pct);
      }

      encoder.finish();
      const buffer = encoder.bytes();
      const blob = new Blob([buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setProgress(100);
      setIsProcessing(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`GIF creation failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="media-gif-maker"
        title="GIF 애니메이션 짤 제작기 (GIF Maker)"
        description="여러 장의 이미지(PNG, JPG, WEBP)를 프레임 속도와 해상도를 조절하여 고화질 GIF 애니메이션으로 제작합니다."
      />

      <AdBanner slotId="gifmaker-top" />

      {resultUrl && files.length > 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ padding: '0.75rem', background: '#000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <img src={resultUrl} alt="GIF Result" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`animation_${Date.now()}.gif`} className="btn-primary">
              <Download size={18} /> {t.download} .GIF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : files.length === 0 ? (
        <FileDropzone
          accept="image/*"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title={labels.selectTitle}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {labels.imagesCount} {files.length}장
              </h3>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {/* 프레임 미리보기 갤러리 */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {previews.map((src, idx) => (
              <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={src} alt={`Frame ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* FPS 및 GIF 해상도 설정 */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>{labels.fpsLabel}</span>
                <span>{fps} FPS</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.3rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>{labels.widthLabel}</span>
                <span>{gifWidth}px</span>
              </label>
              <input
                type="range"
                min={200}
                max={800}
                step={50}
                value={gifWidth}
                onChange={(e) => setGifWidth(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.3rem' }}
              />
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleMakeGif}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Play size={18} /> {isProcessing ? t.processing : labels.btnMake}
          </button>
        </div>
      )}

      <AdBanner slotId="gifmaker-bottom" />
    </div>
  );
};
