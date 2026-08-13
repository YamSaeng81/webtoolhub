import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors, Sparkles } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export const ImageBgRemoverPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('AI 누끼 모델 로딩 중...');

  const labels = {
    ko: {
      selectTitle: '배경을 제거(누끼)할 이미지를 선택하세요 (PNG, JPG, WEBP)',
      btnProcess: 'AI 딥러닝 누끼 따기 실행',
      doneTitle: 'AI 누끼 제거 완료!',
    },
    en: {
      selectTitle: 'Select image to remove background (PNG, JPG, WEBP)',
      btnProcess: 'Run AI Background Removal',
      doneTitle: 'AI Background Removed!',
    },
    es: {
      selectTitle: 'Seleccione imagen para quitar fondo',
      btnProcess: 'Ejecutar eliminación de fondo AI',
      doneTitle: '¡Fondo eliminado por AI!',
    },
    zh: {
      selectTitle: '选择要抠图/抠背景的图像 (PNG, JPG, WEBP)',
      btnProcess: '执行 AI 深度抠图',
      doneTitle: 'AI 抠图完成！',
    },
    ja: {
      selectTitle: '背景を削除(切り抜き)する画像を選択してください',
      btnProcess: 'AI背景切り抜きを実行',
      doneTitle: 'AI背景削除完了！',
    },
  }[language] || {
    selectTitle: 'Select image to remove background',
    btnProcess: 'Run AI Background Removal',
    doneTitle: 'AI Background Removed!',
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
   * ONNX WASM 딥러닝 AI 신경망 100% 브라우저 고정밀 누끼 따기 ⭐
   */
  const handleRemoveBackground = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setStatusText('AI 딥러닝 비전 신경망 모델 분석 중...');
    trackToolUsage('image-bg-remover', 'AI 이미지 배경 제거');

    try {
      // ONNX WebAssembly 딥러닝 AI 비전 신경망 인퍼런스 실행 ⭐
      const blob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.min(95, Math.round((current / total) * 100));
            setProgress(pct);
            setStatusText(`AI 딥러닝 신경망 처리 중... (${pct}%)`);
          }
        },
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatusText('누끼 제거 완료!');
      setIsProcessing(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`AI 누끼 따기 처리 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
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
        title="AI 이미지 배경 제거 / 누끼 따기 (AI Background Remover)"
        description="ONNX WASM 딥러닝 AI 비전 신경망 모델이 사람, 동물, 상품 피사체를 머리카락 한 올까지 정밀하게 100% 브라우저 메모리 상에서 잘라냅니다."
      />

      <AdBanner slotId="bgremover-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          {/* 체커보드 투명 배경 누끼 완료 결과 미리보기 ⭐ */}
          <div style={{ padding: '1rem', background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADF8_8oAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAC1JREFUeNpiPHPmDAM2wMSAGzCC8v///wcnYGJAAUYGVw0gCzA2kAUYNwIMAA0zBC5c31E3AAAAAElFTkSuQmCC") repeat', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
            <img src={resultUrl} alt="AI Background Removed" style={{ maxWidth: '100%', maxHeight: '380px', display: 'block' }} />
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

          {isProcessing && <ProgressBar progress={progress} statusText={statusText} />}

          <button
            className="btn-primary"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Scissors size={18} /> {isProcessing ? statusText : labels.btnProcess}
          </button>
        </div>
      )}

      <AdBanner slotId="bgremover-bottom" />
    </div>
  );
};
