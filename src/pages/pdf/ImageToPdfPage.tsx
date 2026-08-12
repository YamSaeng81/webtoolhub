import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { imagesToPdf, type PageSizeMode } from '../../utils/pdfServices';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, Trash2, FileCheck, RefreshCw, Layout } from 'lucide-react';

export const ImageToPdfPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pageSizeMode, setPageSizeMode] = useState<PageSizeMode>('a4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfResultUrl, setPdfResultUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith('image/'));
    if (validImages.length === 0) {
      alert('이미지 파일(JPG, PNG 등)을 선택해 주세요.');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validImages]);
    const urls = validImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('image-to-pdf', '이미지를 PDF로 변환');

    try {
      setProgress(60);
      const pdfBytes = await imagesToPdf(selectedFiles, pageSizeMode);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setPdfResultUrl(url);

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setPdfResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-to-pdf"
        title="이미지를 PDF로 변환 및 합치기"
        description="JPG, PNG, WEBP 등 여러 장의 이미지 파일을 원하는 순서대로 배치하여 하나의 고화질 PDF 파일로 통합 생성합니다."
      />

      <AdBanner slotId="img2pdf-top" />

      {pdfResultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>PDF Conversion Completed!</h2>
          <p style={{ color: 'var(--text-muted)' }}>{selectedFiles.length} images combined into a single PDF.</p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={pdfResultUrl} download="WebToolHub_Images.pdf" className="btn-primary">
              <Download size={18} /> Download PDF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> Convert Another Image
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FileDropzone
            accept="image/*"
            multiple={true}
            onFilesSelected={handleFilesSelected}
          />

          {selectedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* PDF 페이지 규격 선택 옵션 UI ⭐ */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layout size={16} color="var(--accent-primary)" /> PDF 페이지 크기 규격 설정:
                </span>
                
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="pageSizeMode"
                      value="a4"
                      checked={pageSizeMode === 'a4'}
                      onChange={() => setPageSizeMode('a4')}
                    />
                    <span>📄 A4 표준 규격으로 통일 (추천: 인쇄 & 열람에 가장 깔끔함)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="pageSizeMode"
                      value="original"
                      checked={pageSizeMode === 'original'}
                      onChange={() => setPageSizeMode('original')}
                    />
                    <span>🖼️ 사진 원본 크기 1:1 유지 (이미지 크기대로 개별 생성)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Selected Images ({selectedFiles.length})
                </h3>
                <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Clear All
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '1' }}>
                    <img src={url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <span style={{ position: 'absolute', bottom: '4px', left: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {isProcessing && <ProgressBar progress={progress} statusText="Combining images into PDF..." />}

              <button
                className="btn-primary"
                onClick={handleConvert}
                disabled={isProcessing}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
                id="convert-img-to-pdf-btn"
              >
                {isProcessing ? 'Processing...' : `Convert ${selectedFiles.length} Images to PDF`}
              </button>
            </div>
          )}
        </div>
      )}

      <AdBanner slotId="img2pdf-bottom" />
    </div>
  );
};
