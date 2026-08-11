import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { recognizeTextFromImage } from '../../utils/ocrService';
import { useLanguage } from '../../context/LanguageContext';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Copy, Download, RefreshCw, FileText, Check } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const OcrPdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('OCR Engine...');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const labels = {
    ko: { selectTitle: '텍스트를 추출할 이미지 또는 PDF를 선택하세요', startBtn: '한국어+영어 OCR 텍스트 추출 시작', resultTitle: '추출된 텍스트 결과' },
    en: { selectTitle: 'Select image or PDF to extract text', startBtn: 'Start OCR Text Extraction', resultTitle: 'Extracted Text Result' },
    es: { selectTitle: 'Seleccione imagen o PDF para extraer texto', startBtn: 'Iniciar Extracción de Texto OCR', resultTitle: 'Resultado de Texto Extraído' },
    zh: { selectTitle: '选择要提取文本的图像或 PDF', startBtn: '开始 OCR 文本提取', resultTitle: '提取的文本结果' },
    ja: { selectTitle: 'テキストを抽出する画像またはPDFを選択してください', startBtn: 'OCRテキスト抽出を開始', resultTitle: '抽出されたテキスト結果' },
  }[language] || { selectTitle: 'Select image or PDF to extract text', startBtn: 'Start OCR Text Extraction', resultTitle: 'Extracted Text Result' };

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setFile(selected);

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else if (selected.type.includes('pdf')) {
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
          setPreviewUrl(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        setPreviewUrl(null);
      }
    }
  };

  const handleStartOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      let imageTarget: File | HTMLCanvasElement = file;

      // PDF 파일인 경우 PDF.js를 사용해 Canvas로 변환하여 Tesseract에 렌더링 전달
      if (file.type.includes('pdf')) {
        setStatusText('Rendering PDF page to image...');
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0 고해상도 스케일로 OCR 정확도 극대화
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          imageTarget = canvas;
        }
      }

      setStatusText('Recognizing text with OCR engine...');
      const text = await recognizeTextFromImage(imageTarget, 'kor+eng', (p) => {
        setProgress(Math.round(p.progress * 100));
        setStatusText(`OCR Processing... (${p.status})`);
      });

      setExtractedText(text);
      setProgress(100);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`OCR Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WebToolHub_OCR_${Date.now()}.txt`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="ocr-pdf"
        title="PDF & 이미지 OCR 텍스트 추출"
        description="이미지나 PDF 문서 안의 글자를 AI Tesseract OCR 엔진이 자동으로 인식하여 편집 가능한 텍스트로 추출합니다."
      />

      <AdBanner slotId="ocr-top" />

      {extractedText ? (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={20} color="var(--accent-primary)" /> {labels.resultTitle}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopyText} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownloadTxt} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <Download size={16} /> .txt {t.download}
              </button>
            </div>
          </div>

          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              resize: 'vertical',
            }}
          />

          <button onClick={handleReset} className="btn-secondary" style={{ alignSelf: 'center' }}>
            <RefreshCw size={16} /> {t.reset}
          </button>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="image/*,application/pdf"
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

          {previewUrl && (
            <div style={{ maxHeight: '220px', overflow: 'hidden', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-secondary)', padding: '0.5rem' }}>
              <img src={previewUrl} alt="ocr-preview" style={{ maxHeight: '200px', objectFit: 'contain' }} />
            </div>
          )}

          {isProcessing && <ProgressBar progress={progress} statusText={statusText} />}

          <button
            className="btn-primary"
            onClick={handleStartOcr}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            id="start-ocr-btn"
          >
            {isProcessing ? t.processing : labels.startBtn}
          </button>
        </div>
      )}

      <AdBanner slotId="ocr-bottom" />
    </div>
  );
};
