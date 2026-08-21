import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { rotatePdfPages } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';
import { Download, FileCheck, RefreshCw, RotateCw, RotateCcw } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageThumb {
  pageNum: number;
  dataUrl: string;
}

export const RotatePdfPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pageThumbs, setPageThumbs] = useState<PageThumb[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // 5개 국어 (KO, EN, ES, ZH, JA) i18n 레이블 딕셔너리 ⭐
  const labels = {
    ko: { selectTitle: '회전시킬 PDF 파일을 선택하세요', totalPages: '총', pagesUnit: '페이지', btnCw: '전체 시계방향 (+90°)', btnCcw: '전체 반시계방향 (-90°)', btnApply: '회전 적용 후 PDF 저장', doneTitle: 'PDF 회전 저장 완료!', thumbGenErr: 'PDF 썸네일 생성에 실패했습니다.' },
    en: { selectTitle: 'Select PDF file to rotate pages', totalPages: 'Total', pagesUnit: 'Pages', btnCw: 'All Clockwise (+90°)', btnCcw: 'All Counter-Clockwise (-90°)', btnApply: 'Apply Rotation & Save PDF', doneTitle: 'PDF Rotation Completed!', thumbGenErr: 'Failed to generate PDF thumbnails.' },
    es: { selectTitle: 'Seleccione archivo PDF para rotar páginas', totalPages: 'Total', pagesUnit: 'páginas', btnCw: 'Todo hacia la derecha (+90°)', btnCcw: 'Todo hacia la izquierda (-90°)', btnApply: 'Aplicar rotación y guardar PDF', doneTitle: '¡Rotación de PDF completada!', thumbGenErr: 'Error al generar miniaturas de PDF.' },
    zh: { selectTitle: '选择要旋转页面的 PDF 文件', totalPages: '共', pagesUnit: '页', btnCw: '全部顺时针 (+90°)', btnCcw: '全部逆时针 (-90°)', btnApply: '应用旋转并保存 PDF', doneTitle: 'PDF 页面旋转完成！', thumbGenErr: '生成 PDF 缩略图失败。' },
    ja: { selectTitle: '回転させるPDFファイルを選択してください', totalPages: '全', pagesUnit: 'ページ', btnCw: '全体時計回り (+90°)', btnCcw: '全体反時計回り (-90°)', btnApply: '回転を適用してPDF保存', doneTitle: 'PDF回転保存完了！', thumbGenErr: 'PDFサムネイルの生成に失敗しました。' },
  }[language] || { selectTitle: 'Select PDF file to rotate pages', totalPages: 'Total', pagesUnit: 'Pages', btnCw: 'All Clockwise (+90°)', btnCcw: 'All Counter-Clockwise (-90°)', btnApply: 'Apply Rotation & Save PDF', doneTitle: 'PDF Rotation Completed!', thumbGenErr: 'Failed to generate PDF thumbnails.' };

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) return;

    setFile(selected);
    setResultUrl(null);
    setRotations({});
    setIsProcessing(true);
    setProgress(20);

    try {
      const buffer = await selected.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const totalPages = pdf.numPages;
      const thumbs: PageThumb[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL('image/png') });
        }
        setProgress(20 + Math.round((i / totalPages) * 70));
      }

      setPageThumbs(thumbs);
      setProgress(100);
    } catch (e) {
      alert(labels.thumbGenErr);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotatePage = (pageNum: number, angleChange: number) => {
    setRotations((prev) => {
      const cur = prev[pageNum] || 0;
      const next = (cur + angleChange + 360) % 360;
      return { ...prev, [pageNum]: next };
    });
  };

  const handleRotateAll = (angleChange: number) => {
    setRotations((prev) => {
      const next: Record<number, number> = {};
      pageThumbs.forEach((thumb) => {
        const cur = prev[thumb.pageNum] || 0;
        next[thumb.pageNum] = (cur + angleChange + 360) % 360;
      });
      return next;
    });
  };

  const handleApplyRotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('pdf-rotate', 'PDF 페이지 회전');

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const rotatedBytes = await rotatePdfPages(buffer, rotations);
      const blob = new Blob([rotatedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

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
    setPageThumbs([]);
    setRotations({});
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-rotate"
        title={t.toolPdfRotateTitle}
        description={t.toolPdfRotateDesc}
      />

      <AdBanner slotId="rotate-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Rotated.pdf" className="btn-primary">
              <Download size={18} /> {t.download} Rotated PDF
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{labels.totalPages} {pageThumbs.length} {labels.pagesUnit}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleRotateAll(90)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                <RotateCw size={15} /> {labels.btnCw}
              </button>
              <button onClick={() => handleRotateAll(-90)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                <RotateCcw size={15} /> {labels.btnCcw}
              </button>
              <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                {t.reset}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '1rem',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {pageThumbs.map((thumb) => {
              const curAngle = rotations[thumb.pageNum] || 0;
              return (
                <div
                  key={thumb.pageNum}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-main)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: curAngle > 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={thumb.dataUrl}
                      alt={`page-${thumb.pageNum}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transform: `rotate(${curAngle}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Page {thumb.pageNum} {curAngle > 0 && <span style={{ color: 'var(--accent-primary)' }}>({curAngle}°)</span>}
                  </span>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => handleRotatePage(thumb.pageNum, -90)} className="btn-secondary" style={{ padding: '0.2rem 0.4rem' }}>
                      <RotateCcw size={14} />
                    </button>
                    <button onClick={() => handleRotatePage(thumb.pageNum, 90)} className="btn-secondary" style={{ padding: '0.2rem 0.4rem' }}>
                      <RotateCw size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleApplyRotate}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <RotateCw size={18} /> {isProcessing ? t.processing : labels.btnApply}
          </button>
        </div>
      )}

      <AdBanner slotId="rotate-bottom" />

      <ToolGuideSection
        toolId="pdf-rotate"
        toolTitle="무료 PDF 페이지 방향 회전 & 영구 저장 (PDF Rotator)"
        categoryName="PDF 도구"
      />
    </div>
  );
};

