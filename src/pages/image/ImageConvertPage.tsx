import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { convertImageFormat } from '../../utils/imageServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, RefreshCw as ConvertIcon } from 'lucide-react';

export const ImageConvertPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [targetMime, setTargetMime] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '변환할 이미지 파일(PNG, JPG, WEBP)을 선택하세요', targetLabel: '목표 포맷 선택:', btn: '이미지 포맷 변환하기', done: '이미지 변환 완료!' },
    en: { selectTitle: 'Select image file (PNG, JPG, WEBP) to convert', targetLabel: 'Target Format:', btn: 'Convert Image Format', done: 'Image Conversion Completed!' },
    es: { selectTitle: 'Seleccione imagen para convertir', targetLabel: 'Formato de Destino:', btn: 'Convertir Formato de Imagen', done: '¡Conversión Completada!' },
    zh: { selectTitle: '选择要转换的图像文件', targetLabel: '目标格式：', btn: '开始转换图像格式', done: '图像格式转换完成！' },
    ja: { selectTitle: '変換する画像ファイルを選択してください', targetLabel: '変換先フォーマット選択:', btn: '画像フォーマット変換を実行', done: '画像フォーマット変換完了！' },
  }[language] || { selectTitle: 'Select image file (PNG, JPG, WEBP) to convert', targetLabel: 'Target Format:', btn: 'Convert Image Format', done: 'Image Conversion Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);

    try {
      setProgress(60);
      const blob = await convertImageFormat(file, targetMime);
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Convert failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
  };

  const extName = targetMime.split('/')[1] === 'jpeg' ? 'jpg' : targetMime.split('/')[1];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-convert"
        title="이미지 포맷 변환"
        description="PNG ⇄ JPG ⇄ WEBP 등 다양한 이미지 형식을 즉시 호환 변환합니다."
      />

      <AdBanner slotId="convert-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Converted.${extName}`} className="btn-primary">
              <Download size={18} /> {t.download} .{extName.toUpperCase()}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>{labels.targetLabel}</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {([
                { mime: 'image/png', label: 'PNG' },
                { mime: 'image/jpeg', label: 'JPG' },
                { mime: 'image/webp', label: 'WEBP' },
              ] as const).map((opt) => (
                <button
                  key={opt.mime}
                  onClick={() => setTargetMime(opt.mime)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    border: targetMime === opt.mime ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: targetMime === opt.mime ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                    color: targetMime === opt.mime ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontWeight: 700,
                  }}
                >
                  .{opt.label}
                </button>
              ))}
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleConvert}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <ConvertIcon size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="convert-bottom" />

      <ToolGuideSection
        toolId="image-convert"
        toolTitle="무료 이미지 포맷 변환기 (PNG, JPG, WEBP Image Converter)"
        categoryName="이미지 & AI 도구"
      />
    </div>
  );
};

