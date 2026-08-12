import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { recognizeTextFromImage } from '../../utils/ocrService';
import { mergePdfBuffers } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Copy, Download, RefreshCw, FileText, Check, Search } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const OcrPdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [searchablePdfUrl, setSearchablePdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('OCR Engine...');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const labels = {
    ko: { selectTitle: '텍스트를 추출할 이미지 또는 PDF를 선택하세요', startBtn: '전체 페이지 OCR 텍스트 추출 시작', resultTitle: '추출된 텍스트 결과' },
    en: { selectTitle: 'Select image or PDF to extract text', startBtn: 'Start Full Page OCR Extraction', resultTitle: 'Extracted Text Result' },
    es: { selectTitle: 'Seleccione imagen o PDF para extraer texto', startBtn: 'Iniciar Extracción OCR Completa', resultTitle: 'Resultado de Texto Extraído' },
    zh: { selectTitle: '选择要提取文本的图像或 PDF', startBtn: '开始全页 OCR 文本提取', resultTitle: '提取的文本结果' },
    ja: { selectTitle: 'テキストを抽出する画像またはPDFを選択してください', startBtn: '全ページOCRテキスト抽出を開始', resultTitle: '抽出されたテキスト結果' },
  }[language] || { selectTitle: 'Select image or PDF to extract text', startBtn: 'Start Full Page OCR Extraction', resultTitle: 'Extracted Text Result' };

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setFile(selected);
    setSearchablePdfUrl(null);
    setExtractedText('');

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

  /**
   * PDF 전체 페이지 Tesseract HOCR 인코딩 & 100% 검색 가능한 Searchable PDF 생성 ⭐
   */
  const handleStartOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    trackToolUsage('ocr-pdf', 'PDF & 이미지 OCR');
    setExtractedText('');
    setSearchablePdfUrl(null);

    try {
      const generatedPdfBuffers: Uint8Array[] = [];
      let fullTextCombined = '';
      let totalNum = 1;

      if (file.type.includes('pdf')) {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        totalNum = pdf.numPages;
        setPageCount(totalNum);

        for (let i = 1; i <= totalNum; i++) {
          setStatusText(`Rendering & OCR Processing Page ${i} / ${totalNum}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 2.0x 고화질
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport, canvas }).promise;

            // Tesseract 내장 HOCR PDF 생성 엔진 구동 ⭐
            const res = await recognizeTextFromImage(canvas, 'kor+eng', (p) => {
              const baseProg = Math.round(((i - 1) / totalNum) * 100);
              const curProg = Math.round((p.progress / totalNum) * 100);
              setProgress(Math.min(95, baseProg + curProg));
            });

            fullTextCombined += `--- [ Page ${i} / ${totalNum} ] ---\n${res.text}\n\n`;
            if (res.pdfBytes) {
              generatedPdfBuffers.push(res.pdfBytes);
            }
          }
        }
      } else {
        // 이미지 파일 처리
        setPageCount(1);
        setStatusText('Recognizing image OCR text...');
        const res = await recognizeTextFromImage(file, 'kor+eng', (p) => {
          setProgress(Math.round(p.progress * 100));
        });

        fullTextCombined = res.text;
        if (res.pdfBytes) {
          generatedPdfBuffers.push(res.pdfBytes);
        }
      }

      setExtractedText(fullTextCombined);

      // 🔍 Tesseract HOCR PDF 페이지들을 단 1개의 완벽한 검색형 PDF로 통합 병합 ⭐
      if (generatedPdfBuffers.length > 0) {
        setStatusText('Merging Searchable OCR PDF...');
        const mergedBytes = await mergePdfBuffers(generatedPdfBuffers);
        const pdfBlob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
        setSearchablePdfUrl(URL.createObjectURL(pdfBlob));
      }

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
    setSearchablePdfUrl(null);
    setProgress(0);
    setPageCount(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="ocr-pdf"
        title="PDF & 이미지 OCR 텍스트 추출 (전체 페이지 & 검색형 PDF)"
        description="PDF의 전체 페이지를 순차 인식하여 텍스트를 추출하며, Ctrl+F 텍스트 검색 및 드래그 복사가 가능한 '검색형 OCR PDF' 다운로드를 지원합니다."
      />

      <AdBanner slotId="ocr-top" />

      {extractedText ? (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={20} color="var(--accent-primary)" /> {labels.resultTitle} ({pageCount} Pages)
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* 🔍 100% 검색 가능한 OCR PDF 다운로드 버튼 ⭐ */}
              {searchablePdfUrl && (
                <a
                  href={searchablePdfUrl}
                  download={`WebToolHub_Searchable_OCR_${Date.now()}.pdf`}
                  className="btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  <Search size={16} /> 🔍 검색 가능한 PDF 다운로드 (.pdf)
                </a>
              )}

              <button onClick={handleCopyText} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>

              <button onClick={handleDownloadTxt} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <Download size={16} /> .txt {t.download}
              </button>
            </div>
          </div>

          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={14}
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
