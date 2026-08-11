import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { extractPdfPages } from '../../utils/pdfServices';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, CheckCircle } from 'lucide-react';

export const ExtractPdfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageInput, setPageInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) {
      alert('PDF 파일만 선택이 가능합니다.');
      return;
    }

    setFile(selected);
    try {
      const buffer = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const count = pdfDoc.getPageCount();
      setTotalPages(count);
      setSelectedPages([]);
      setPageInput('');
    } catch (err) {
      alert('PDF 파일을 분석할 수 없습니다.');
    }
  };

  const togglePageSelection = (pageNo: number) => {
    if (selectedPages.includes(pageNo)) {
      const next = selectedPages.filter((p) => p !== pageNo);
      setSelectedPages(next);
      setPageInput(next.sort((a, b) => a - b).join(', '));
    } else {
      const next = [...selectedPages, pageNo].sort((a, b) => a - b);
      setSelectedPages(next);
      setPageInput(next.join(', '));
    }
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

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) {
      alert('추출할 페이지를 하나 이상 선택해 주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);

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
        description="전체 PDF 문서에서 원하는 페이지(예: 2, 5, 7페이지 또는 1-3페이지 범위)만 정확하게 잘라내어 새로운 PDF 파일로 저장합니다."
      />

      <AdBanner slotId="extract-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Extraction Completed!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Pages [{selectedPages.join(', ')}] extracted.
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Specify pages to extract (e.g. 2, 5, 7 or 1-4):
            </label>
            <input
              type="text"
              placeholder="e.g. 2, 5, 7 or 1-4"
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.6rem', maxHeight: '240px', overflowY: 'auto', padding: '0.5rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedPages.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => togglePageSelection(num)}
                  style={{
                    padding: '0.6rem 0.3rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <span>p.{num}</span>
                  {isSelected && <CheckCircle size={12} color="var(--accent-primary)" />}
                </button>
              );
            })}
          </div>

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
