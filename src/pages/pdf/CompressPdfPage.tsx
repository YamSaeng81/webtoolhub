import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { compressPdf } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, Minimize2, ArrowRight } from 'lucide-react';

export const CompressPdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [qualityScale, setQualityScale] = useState<number>(0.7);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // 5개 국어 (KO, EN, ES, ZH, JA) i18n 레이블 딕셔너리 ⭐
  const labels = {
    ko: { selectTitle: '용량을 줄일 PDF 파일을 선택하세요', curSize: '현재 용량:', qualityLabel: '압축 품질 레벨:', presetMax: '⚡ 강력 압축 (최대 용량 절감)', presetStd: '⚖️ 권장 표준 압축 (화질+용량 균형)', presetHigh: '✨ 고화질 압축', btnCompress: 'PDF 용량 줄이기 실행', doneTitle: 'PDF 용량 압축 완료!', before: '압축 전', after: '압축 후' },
    en: { selectTitle: 'Select PDF file to compress size', curSize: 'Current Size:', qualityLabel: 'Compression Quality Level:', presetMax: '⚡ Max Compression (Smallest Size)', presetStd: '⚖️ Recommended Standard (Balanced)', presetHigh: '✨ High Quality', btnCompress: 'Compress PDF Size', doneTitle: 'PDF Compression Completed!', before: 'Before', after: 'After' },
    es: { selectTitle: 'Seleccione archivo PDF para comprimir', curSize: 'Tamaño actual:', qualityLabel: 'Nivel de calidad de compresión:', presetMax: '⚡ Compresión máxima', presetStd: '⚖️ Estándar recomendado', presetHigh: '✨ Alta calidad', btnCompress: 'Comprimir tamaño de PDF', doneTitle: '¡Compresión de PDF completada!', before: 'Antes', after: 'Después' },
    zh: { selectTitle: '选择要压缩大小的 PDF 文件', curSize: '当前大小：', qualityLabel: '压缩质量级别：', presetMax: '⚡ 强力压缩（最小体积）', presetStd: '⚖️ 推荐标准（平衡）', presetHigh: '✨ 高质量', btnCompress: '执行 PDF 压缩', doneTitle: 'PDF 压缩完成！', before: '压缩前', after: '压缩后' },
    ja: { selectTitle: '容量を削減するPDFファイルを選択してください', curSize: '現在の容量:', qualityLabel: '圧縮品質レベル:', presetMax: '⚡ 強力圧縮 (最小容量)', presetStd: '⚖️ 推奨標準 (バランス)', presetHigh: '✨ 高画質圧縮', btnCompress: 'PDF容量削減を実行', doneTitle: 'PDF容量圧縮完了！', before: '圧縮前', after: '圧縮後' },
  }[language] || { selectTitle: 'Select PDF file to compress size', curSize: 'Current Size:', qualityLabel: 'Compression Quality Level:', presetMax: '⚡ Max Compression (Smallest Size)', presetStd: '⚖️ Recommended Standard (Balanced)', presetHigh: '✨ High Quality', btnCompress: 'Compress PDF Size', doneTitle: 'PDF Compression Completed!', before: 'Before', after: 'After' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) return;
    setFile(selected);
    setOrigSize(selected.size);
    setResultUrl(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('pdf-compress', 'PDF 용량 줄이기');

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const compressedBytes = await compressPdf(buffer, qualityScale);
      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedSize(blob.size);
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
    setOrigSize(0);
    setCompressedSize(0);
  };

  const reductionPercent = origSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round(((origSize - compressedSize) / origSize) * 100))
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-compress"
        title={t.toolPdfCompressTitle}
        description={t.toolPdfCompressDesc}
      />

      <AdBanner slotId="compress-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1.25rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{labels.before}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(origSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <ArrowRight size={24} color="var(--accent-primary)" />
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{labels.after} ({reductionPercent}% ↓)</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{(compressedSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Compressed.pdf" className="btn-primary">
              <Download size={18} /> {t.download} Compressed PDF
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{labels.curSize} {(origSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>{labels.qualityLabel}</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                {qualityScale <= 0.5 ? labels.presetMax : qualityScale <= 0.8 ? labels.presetStd : labels.presetHigh}
              </span>
            </div>
            
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.1"
              value={qualityScale}
              onChange={(e) => setQualityScale(Number(e.target.value))}
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
            <Minimize2 size={18} /> {isProcessing ? t.processing : labels.btnCompress}
          </button>
        </div>
      )}

      <AdBanner slotId="compress-bottom" />
    </div>
  );
};
