import React, { useState, useEffect, useRef } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Film, Play, Pause, Trash2, Sparkles } from 'lucide-react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export const GifMakerPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fps, setFps] = useState<number>(6);
  const [gifWidth, setGifWidth] = useState<number>(400);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

  const labels = {
    ko: {
      selectTitle: 'GIF 애니메이션으로 만들 여러 장의 이미지를 선택하세요 (PNG, JPG, WEBP)',
      btnMake: '고화질 GIF 파일 생성 및 다운로드',
      doneTitle: 'GIF 애니메이션 제작 완료!',
      fpsLabel: '실시간 프레임 속도 (FPS):',
      widthLabel: 'GIF 출력 해상도 너비 (px):',
      imagesCount: '프레임 순서 관리:',
      livePreviewTitle: '🎬 실시간 GIF 애니메이션 미리보기',
      playBtn: '재생',
      pauseBtn: '일시정지',
    },
    en: {
      selectTitle: 'Select multiple images to create GIF animation (PNG, JPG, WEBP)',
      btnMake: 'Generate & Download GIF File',
      doneTitle: 'GIF Animation Created!',
      fpsLabel: 'Live Frame Rate (FPS):',
      widthLabel: 'Output Resolution Width (px):',
      imagesCount: 'Frame Sequence Management:',
      livePreviewTitle: '🎬 Live GIF Animation Preview',
      playBtn: 'Play',
      pauseBtn: 'Pause',
    },
    es: {
      selectTitle: 'Seleccione varias imágenes para crear animación GIF',
      btnMake: 'Generar y Descargar Archivo GIF',
      doneTitle: '¡Animación GIF Creada!',
      fpsLabel: 'Velocidad de cuadro en vivo (FPS):',
      widthLabel: 'Ancho de salida (px):',
      imagesCount: 'Gestión de secuencia:',
      livePreviewTitle: '🎬 Vista previa de animación GIF en vivo',
      playBtn: 'Reproducir',
      pauseBtn: 'Pausar',
    },
    zh: {
      selectTitle: '选择多张图像制作 GIF 动画 (PNG, JPG, WEBP)',
      btnMake: '生成并下载 GIF 文件',
      doneTitle: 'GIF 动图制作完成！',
      fpsLabel: '实时帧率 (FPS)：',
      widthLabel: '输出分辨率宽度 (px)：',
      imagesCount: '帧顺序管理：',
      livePreviewTitle: '🎬 实时 GIF 动画预览',
      playBtn: '播放',
      pauseBtn: '暂停',
    },
    ja: {
      selectTitle: 'GIFアニメーションを作成する複数の画像を選択してください',
      btnMake: '高品質GIFファイルを生成＆ダウンロード',
      doneTitle: 'GIFアニメーション作成完了！',
      fpsLabel: 'リアルタイムフレームレート (FPS):',
      widthLabel: '出力解像度幅 (px):',
      imagesCount: 'フレーム順序管理:',
      livePreviewTitle: '🎬 リアルタイムGIFアニメーションプレビュー',
      playBtn: '再生',
      pauseBtn: '一時停止',
    },
  }[language] || {
    selectTitle: 'Select multiple images to create GIF animation',
    btnMake: 'Generate & Download GIF File',
    doneTitle: 'GIF Animation Created!',
    fpsLabel: 'Live Frame Rate (FPS):',
    widthLabel: 'Output Resolution Width (px):',
    imagesCount: 'Frame Sequence Management:',
    livePreviewTitle: '🎬 Live GIF Animation Preview',
    playBtn: 'Play',
    pauseBtn: 'Pause',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const validImages = selectedFiles.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      alert('이미지 파일만 선택이 가능합니다.');
      return;
    }
    const newPreviews = validImages.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...validImages]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setResultUrl(null);
  };

  useEffect(() => {
    let isCancelled = false;
    const loadImages = async () => {
      const imgs: HTMLImageElement[] = [];
      for (const src of previews) {
        const img = new Image();
        img.src = src;
        await new Promise((res) => { img.onload = res; });
        if (!isCancelled) imgs.push(img);
      }
      if (!isCancelled) {
        loadedImagesRef.current = imgs;
      }
    };

    if (previews.length > 0) {
      loadImages();
    } else {
      loadedImagesRef.current = [];
    }

    return () => {
      isCancelled = true;
    };
  }, [previews]);

  useEffect(() => {
    if (previews.length === 0 || !isPlaying) return;

    const intervalMs = Math.round(1000 / fps);
    const timer = setInterval(() => {
      setCurrentFrameIdx((prevIdx) => (prevIdx + 1) % previews.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [previews.length, fps, isPlaying]);

  /**
   * 고정 크기 Canvas 상에서 이미지 비율 맞춤 (Fit Contain) 렌더링 ⭐
   */
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const imgs = loadedImagesRef.current;
    if (!canvas || imgs.length === 0 || !imgs[currentFrameIdx]) return;

    const currentImg = imgs[currentFrameIdx];
    
    // 미리보기 창 고정 해상도 (600x400)
    const viewWidth = 600;
    const viewHeight = 380;

    canvas.width = viewWidth;
    canvas.height = viewHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 배경 초기화
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // 이미지를 미리보기 박스 중앙에 비율 맞춤(Contain) 렌더링
      const scale = Math.min(viewWidth / currentImg.width, viewHeight / currentImg.height);
      const drawWidth = currentImg.width * scale;
      const drawHeight = currentImg.height * scale;
      const dx = (viewWidth - drawWidth) / 2;
      const dy = (viewHeight - drawHeight) / 2;

      ctx.drawImage(currentImg, dx, dy, drawWidth, drawHeight);
    }
  }, [currentFrameIdx, previews.length]);

  const handleRemoveFrame = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (currentFrameIdx >= previews.length - 1) {
      setCurrentFrameIdx(0);
    }
    setResultUrl(null);
  };

  const handleMakeGif = async () => {
    if (previews.length === 0) return;

    setIsProcessing(true);
    setProgress(10);
    trackToolUsage('media-gif-maker', 'GIF 애니메이션 제작');

    try {
      const delayMs = Math.round(1000 / fps);
      const encoder = GIFEncoder();

      const imgs = loadedImagesRef.current;
      const firstImg = imgs[0];
      const targetWidth = gifWidth;
      const targetHeight = Math.round((firstImg.height / firstImg.width) * targetWidth);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context failed');

      for (let i = 0; i < imgs.length; i++) {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(imgs[i], 0, 0, targetWidth, targetHeight);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const palette = quantize(imgData.data, 256);
        const index = applyPalette(imgData.data, palette);

        encoder.writeFrame(index, targetWidth, targetHeight, {
          palette,
          delay: delayMs,
        });

        const pct = 10 + Math.round(((i + 1) / imgs.length) * 85);
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
    setCurrentFrameIdx(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="media-gif-maker"
        title="GIF 애니메이션 짤 제작기 (GIF Maker)"
        description="여러 장의 이미지를 추가하고 프레임 속도(FPS)와 GIF 해상도 크기 변화에 따른 실시간 애니메이션 미리보기를 보면서 GIF 짤을 즉시 제작하세요."
      />

      <AdBanner slotId="gifmaker-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ padding: '0.75rem', background: '#000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <img src={resultUrl} alt="GIF Result" style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`webtoolhub_gif_${Date.now()}.gif`} className="btn-primary">
              <Download size={18} /> {t.download} .GIF 파일
            </a>
            <button onClick={() => setResultUrl(null)} className="btn-secondary">
              <Film size={18} /> 옵션 수정하기
            </button>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {labels.livePreviewTitle} ({previews.length} 프레임)
            </h3>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {/* ⭐ 고정 높이/너비 Viewport 미리보기 창 (흔들림 100% 방지) ⭐ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '100%', maxWidth: '600px', height: '380px', background: '#0f172a', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
              <canvas ref={previewCanvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? labels.pauseBtn : labels.playBtn}
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                프레임: #{currentFrameIdx + 1} / {previews.length}
              </span>
            </div>
          </div>

          {/* ⭐ 조절 옵션 슬라이더 ⭐ */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>{labels.fpsLabel}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{fps} FPS</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.4rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>슬라이더 조절 시 미리보기 재생 속도가 실시간 반영됩니다.</span>
            </div>

            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>{labels.widthLabel}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{gifWidth}px</span>
              </label>
              <input
                type="range"
                min={200}
                max={800}
                step={20}
                value={gifWidth}
                onChange={(e) => setGifWidth(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.4rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>최종 GIF 다운로드 시 생성될 이미지 너비 크기입니다.</span>
            </div>
          </div>

          {/* 이미지 프레임 순서 갤러리 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>{labels.imagesCount}</label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
              {previews.map((src, idx) => (
                <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: idx === currentFrameIdx ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)' }}>
                  <img src={src} alt={`Frame ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                    #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveFrame(idx)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="프레임 삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleMakeGif}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.1rem' }}
          >
            <Film size={20} /> {isProcessing ? t.processing : labels.btnMake}
          </button>
        </div>
      )}

      <AdBanner slotId="gifmaker-bottom" />
    </div>
  );
};
