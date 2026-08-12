import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { extractPdfPages } from '../../utils/pdfServices';
import { trackToolUsage } from '../../utils/analytics';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, CheckCircle, Eye } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageThumbnail {
  pageNo: number;
  dataUrl: string;
}

export const ExtractPdfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageThumbnails, setPageThumbnails] = useState<PageThumbnail[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageInput, setPageInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) {
      alert('PDF 파일만 선택이 가능합니다.');
      return;
    }

    setFile(selected);
    setIsLoadingThumbnails(true);
    setPageThumbnails([]);
    setSelectedPages([]);
    setPageInput('');

    try {
      const buffer = await selected.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const count = pdf.numPages;
      setTotalPages(count);

      // 각 페이지 고화질 썸네일 미리보기 동적 렌더링 ⭐
      const thumbs: PageThumbnail[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 }); // 썸네일용 적정 스케일
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          thumbs.push({
            pageNo: i,
            dataUrl: canvas.toDataURL('image/png'),
          });
        }
      }
      setPageThumbnails(thumbs);
    } catch (err) {
      alert('PDF 파일을 분석할 수 없습니다.');
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const togglePageSelection = (pageNo: number) => {
    let next: number[];
    if (selectedPages.includes(pageNo)) {
      next = selectedPages.filter((p) => p !== pageNo);
    } else {
      next = [...selectedPages, pageNo].sort((a, b) => a - b);
    }
    setSelectedPages(next);
    setPageInput(next.join(', '));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPageInput(val);

    const nums: number[] = [];
    const parts = val.split(',');
    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) nums.push(i);
          }
        }
      } else {
        const n = Number(trimmed);
        if (n >= 1 && n <= totalPages) nums.push(n);
      }
    });

    setSelectedPages(Array.from(new Set(nums)));
  };

  const handleSelectAll = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(all);
    setPageInput(all.join(', '));
  };

  const handleClearAll = () => {
    setSelectedPages([]);
    setPageInput('');
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) {
      alert('추출할 페이지를 하나 이상 선택해 주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('extract-pdf', 'PDF 페이지 추출');

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const extractedBytes = await extractPdfPages(buffer, selectedPages);
      const blob = new Blob([extractedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`추출 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setPageThumbnails([]);
    setSelectedPages([]);
    setPageInput('');
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="extract-pdf"
        title="PDF 특정 페이지 추출하기"
        description="PDF 문서의 각 페이지를 시각적 미리보기 썸네일로 확인하고 원하는 페이지를 클릭하여 신속하게 잘라내어 추출합니다."
      />

      <AdBanner slotId="extract-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Extraction Completed!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Selected Pages [{selectedPages.join(', ')}] successfully extracted.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Extracted_Pages_${selectedPages.join('_')}.pdf`} className="btn-primary">
              <Download size={18} /> Download Extracted PDF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> Extract Another PDF
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total {totalPages} Pages</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              Select Another File
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={16} color="var(--accent-primary)" /> 클릭하여 추출할 페이지 선택 (선택됨: {selectedPages.length}개):
              </label>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSelectAll} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                  전체 선택
                </button>
                <button onClick={handleClearAll} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#ef4444' }}>
                  선택 해제
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="직접 입력 예: 2, 5, 7 또는 1-4"
              value={pageInput}
              onChange={handlePageInputChange}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {/* 시각적 페이지 미리보기 갤러리 (Visual Thumbnail Gallery) ⭐ */}
          {isLoadingThumbnails ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              PDF 페이지 썸네일 미리보기 생성 중...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', maxHeight: '420px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              {pageThumbnails.map((thumb) => {
                const isSelected = selectedPages.includes(thumb.pageNo);
                return (
                  <div
                    key={thumb.pageNo}
                    onClick={() => togglePageSelection(thumb.pageNo)}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isSelected ? '3px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ width: '100%', height: '150px', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                      <img src={thumb.dataUrl} alt={`page-${thumb.pageNo}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>

                    <div style={{ width: '100%', padding: '0.4rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: isSelected ? '#fff' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      {isSelected && <CheckCircle size={14} />}
                      Page {thumb.pageNo}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isProcessing && <ProgressBar progress={progress} statusText="Extracting pages..." />}

          <button
            className="btn-primary"
            onClick={handleExtract}
            disabled={isProcessing || selectedPages.length === 0}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            id="extract-pdf-btn"
          >
            {isProcessing ? 'Processing...' : `Extract Selected ${selectedPages.length} Pages`}
          </button>
        </div>
      )}

      <AdBanner slotId="extract-bottom" />
    </div>
  );
};
