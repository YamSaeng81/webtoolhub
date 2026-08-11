import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const PdfToImagePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) {
      alert('PDF 파일만 선택해 주세요.');
      return;
    }
    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setImageUrls([]);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const renderedUrls: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          renderedUrls.push(dataUrl);
        }

        setProgress(Math.round((i / totalPages) * 100));
      }

      setImageUrls(renderedUrls);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`PDF 이미지 변환 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageUrls([]);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-to-image"
        title="PDF를 이미지(PNG/JPG)로 변환"
        description="PDF 문서의 각 페이지를 고화질 이미지(PNG) 파일로 개별 추출하여 다운로드합니다."
      />

      <AdBanner slotId="pdf2img-top" />

      {imageUrls.length > 0 ? (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Pages Rendered ({imageUrls.length})
            </h3>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={16} /> Process Another PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {imageUrls.map((url, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <img src={url} alt={`page-${idx + 1}`} style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Page {idx + 1}</span>
                <a href={url} download={`Page_${idx + 1}.png`} className="btn-secondary" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>
                  <Download size={12} /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              Select Another File
            </button>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText="Rendering PDF pages..." />}

          <button className="btn-primary" onClick={handleConvert} disabled={isProcessing} style={{ width: '100%', padding: '0.9rem' }}>
            <FileSpreadsheet size={18} /> {isProcessing ? 'Processing...' : 'Start PDF to Image Conversion'}
          </button>
        </div>
      )}

      <AdBanner slotId="pdf2img-bottom" />
    </div>
  );
};
