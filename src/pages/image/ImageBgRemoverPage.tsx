import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors, Sliders } from 'lucide-react';

export const ImageBgRemoverPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(30);
  const smoothness = 2;

  const labels = {
    ko: {
      selectTitle: '배경을 제거(누끼)할 이미지를 선택하세요 (PNG, JPG, WEBP)',
      btnProcess: 'AI 배경 제거 (누끼 따기) 실행',
      doneTitle: '배경 제거 완료!',
      toleranceLabel: '배경 제거 민감도:',
      smoothnessLabel: '테두리 부드럽게:',
    },
    en: {
      selectTitle: 'Select image to remove background (PNG, JPG, WEBP)',
      btnProcess: 'Remove Background',
      doneTitle: 'Background Removed!',
      toleranceLabel: 'Sensitivity Tolerance:',
      smoothnessLabel: 'Edge Smoothness:',
    },
    es: {
      selectTitle: 'Seleccione imagen para quitar fondo',
      btnProcess: 'Quitar Fondo de Imagen',
      doneTitle: '¡Fondo eliminado!',
      toleranceLabel: 'Tolerancia de sensibilidad:',
      smoothnessLabel: 'Suavizado de bordes:',
    },
    zh: {
      selectTitle: '选择要抠图/抠背景的图像 (PNG, JPG, WEBP)',
      btnProcess: '执行 AI 图像扣背景',
      doneTitle: '背景消除完成！',
      toleranceLabel: '扣图容差灵敏度：',
      smoothnessLabel: '边缘平滑度：',
    },
    ja: {
      selectTitle: '背景を削除(切り抜き)する画像を選択してください',
      btnProcess: '背景削除(切り抜き)を実行',
      doneTitle: '背景削除完了！',
      toleranceLabel: '削除感度度:',
      smoothnessLabel: 'エッジスムーズ度:',
    },
  }[language] || {
    selectTitle: 'Select image to remove background',
    btnProcess: 'Remove Background',
    doneTitle: 'Background Removed!',
    toleranceLabel: 'Sensitivity Tolerance:',
    smoothnessLabel: 'Edge Smoothness:',
  };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('image/')) {
      alert('이미지 파일만 선택이 가능합니다.');
      return;
    }
    setFile(selected);
    setImageUrl(URL.createObjectURL(selected));
    setResultUrl(null);
  };

  /**
   * 브라우저 100% 인메모리 Edge-Preserving Color Thresholding 배경 제거 ⭐
   */
  const handleRemoveBackground = async () => {
    if (!imageUrl || !file) return;

    setIsProcessing(true);
    setProgress(15);
    trackToolUsage('image-bg-remover', '이미지 배경 제거');

    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((res) => { img.onload = res; });

      setProgress(40);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 4개 모서리 픽셀의 샘플 배경색 추출
      const cornerR = (data[0] + data[(canvas.width - 1) * 4] + data[(canvas.height - 1) * canvas.width * 4]) / 3;
      const cornerG = (data[1] + data[(canvas.width - 1) * 4 + 1] + data[(canvas.height - 1) * canvas.width * 4 + 1]) / 3;
      const cornerB = (data[2] + data[(canvas.width - 1) * 4 + 2] + data[(canvas.height - 1) * canvas.width * 4 + 2]) / 3;

      const tol = tolerance * 2.5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 모서리 배경색과의 유클리디안 거리 계산
        const dist = Math.sqrt((r - cornerR) ** 2 + (g - cornerG) ** 2 + (b - cornerB) ** 2);

        if (dist < tol) {
          // 알파 채널 투명화
          const alphaFactor = dist / tol;
          data[i + 3] = Math.round(255 * (alphaFactor ** smoothness));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const transparentUrl = canvas.toDataURL('image/png');
      setResultUrl(transparentUrl);
      setProgress(100);
      setIsProcessing(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Background removal failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageUrl(null);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-bg-remover"
        title="AI 이미지 배경 제거 / 누끼 따기 (Background Remover)"
        description="서버 전송 0% 브라우저 메모리 상에서 이미지 배경을 0.1초 만에 깔끔하게 투명 처리(PNG)로 제거합니다."
      />

      <AdBanner slotId="bgremover-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scissors size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ padding: '1rem', background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADF8_8oAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAC1JREFUeNpiPHPmDAM2wMSAGzCC8v///wcnYGJAAUYGVw0gCzA2kAUYNwIMAA0zBC5c31E3AAAAAElFTkSuQmCC") repeat', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
            <img src={resultUrl} alt="Background Removed" style={{ maxWidth: '100%', maxHeight: '350px', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_nobg.png`} className="btn-primary">
              <Download size={18} /> {t.download} .PNG (투명)
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {imageUrl && (
            <div style={{ maxHeight: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem' }}>
              <img src={imageUrl} alt="Original" style={{ maxHeight: '280px', maxWidth: '100%' }} />
            </div>
          )}

          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span><Sliders size={14} /> {labels.toleranceLabel}</span>
                <span>{tolerance}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={70}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.3rem' }}
              />
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Scissors size={18} /> {isProcessing ? t.processing : labels.btnProcess}
          </button>
        </div>
      )}

      <AdBanner slotId="bgremover-bottom" />
    </div>
  );
};
