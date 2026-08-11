import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { extractPdfPages, cropPdfMargins } from '../utils/pdfServices';

describe('PDF 엔진 유틸리티 테스트 (pdfServices)', () => {
  // 테스트용 3페이지짜리 PDF 문서 생성 도우미
  async function createTestPdf(): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([500, 700]);
    pdfDoc.addPage([500, 700]);
    pdfDoc.addPage([500, 700]);
    return await pdfDoc.save();
  }

  it('PDF 특정 페이지 추출 기능이 올바르게 동작해야 한다 (3페이지 중 1, 3페이지만 추출)', async () => {
    const originalPdfBuffer = await createTestPdf();
    
    // 1번, 3번 페이지만 추출
    const extractedBytes = await extractPdfPages(originalPdfBuffer.buffer as ArrayBuffer, [1, 3]);
    const extractedDoc = await PDFDocument.load(extractedBytes);

    expect(extractedDoc.getPageCount()).toBe(2);
  });

  it('유효하지 않은 페이지 번호를 전달할 경우 예외를 발생시키거나 빈 범위를 처리해야 한다', async () => {
    const originalPdfBuffer = await createTestPdf();

    await expect(
      extractPdfPages(originalPdfBuffer.buffer as ArrayBuffer, [99])
    ).rejects.toThrow('유효한 범위의 페이지 번호가 없습니다.');
  });

  it('PDF 여백 자르기(Crop) 적용 시 CropBox 치수가 올바르게 조정되어야 한다', async () => {
    const originalPdfBuffer = await createTestPdf();
    const margins = { top: 50, bottom: 50, left: 20, right: 20 };

    const croppedBytes = await cropPdfMargins(originalPdfBuffer.buffer as ArrayBuffer, margins);
    const croppedDoc = await PDFDocument.load(croppedBytes);

    const firstPage = croppedDoc.getPage(0);
    const cropBox = firstPage.getCropBox();

    // 원래 폭 500 - (좌 20 + 우 20) = 460
    expect(cropBox.width).toBe(460);
    // 원래 높이 700 - (상 50 + 하 50) = 600
    expect(cropBox.height).toBe(600);
  });
});
