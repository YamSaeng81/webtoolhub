import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { trackToolUsage } from '../../utils/analytics';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Download, FileSpreadsheet, RefreshCw, Archive } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const PdfToImagePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);

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
    trackToolUsage('pdf-to-image', 'PDF를 이미지로 변환');

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const renderedUrls: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0x 고화질 PNG 렌더링
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

  /**
   * 모든 페이지 이미지를 단 1개의 ZIP 파일로 압축하여 일괄 다운로드하는 기능 ⭐
   */
  const handleDownloadAllZip = async () => {
    if (imageUrls.length === 0 || !file) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = file.name.replace(/\.[^/.]+$/, '');
      const imgFolder = zip.folder(folderName) || zip;

      imageUrls.forEach((url, idx) => {
        const base64Data = url.split(',')[1];
        imgFolder.file(`Page_${idx + 1}.png`, base64Data, { base64: true });
      });

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipContent);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${folderName}_images.zip`;
      a.click();
    } catch (e) {
      alert('ZIP 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
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
        title="PDF를 이미지(PNG)로 변환"
        description="PDF 문서의 각 페이지를 2.0x 고화질 PNG 이미지로 변환하고 개별 다운로드 및 전체 ZIP 압축 다운로드를 지원합니다."
      />

      <AdBanner slotId="pdf2img-top" />

      {imageUrls.length > 0 ? (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Pages Rendered ({imageUrls.length} Pages)
            </h3>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* 📦 전체 ZIP 파일 압축 다운로드 버튼 ⭐ */}
              <button
                onClick={handleDownloadAllZip}
                className="btn-primary"
                disabled={isZipping}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
              >
                <Archive size={16} /> {isZipping ? 'Creating ZIP...' : '📦 Download All as ZIP'}
              </button>

              <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                <RefreshCw size={16} /> Process Another PDF
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {imageUrls.map((url, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <img src={url} alt={`page-${idx + 1}`} style={{ width: '100%', height: '140px', objectFit: 'contain', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} />
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

          {isProcessing && <ProgressBar progress={progress} statusText="Rendering PDF pages to PNG..." />}

          <button className="btn-primary" onClick={handleConvert} disabled={isProcessing} style={{ width: '100%', padding: '0.9rem' }}>
            <FileSpreadsheet size={18} /> {isProcessing ? 'Processing...' : 'Start PDF to Image Conversion'}
          </button>
        </div>
      )}

      <AdBanner slotId="pdf2img-bottom" />
    </div>
  );
};
