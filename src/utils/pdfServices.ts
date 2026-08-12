import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

export type PageSizeMode = 'a4' | 'original';

/**
 * 여러 개의 PDF Uint8Array 바이너리들을 하나의 통합 PDF로 깔끔하게 병합하는 함수
 */
export async function mergePdfBuffers(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    try {
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (e) {
      // 병합 예외 핸들링
    }
  }

  return await mergedPdf.save();
}

/**
 * 이미지 파일들(JPG, PNG, WEBP 등)을 하나의 PDF 문서로 병합하는 함수
 */
export async function imagesToPdf(
  imageFiles: File[],
  pageSizeMode: PageSizeMode = 'a4'
): Promise<Uint8Array> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('최소 1개 이상의 이미지 파일이 필요합니다.');
  }

  const pdfDoc = await PDFDocument.create();

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const MARGIN = 20;

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type.includes('png')) {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else if (file.type.includes('jpg') || file.type.includes('jpeg')) {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      image = await pdfDoc.embedPng(arrayBuffer);
    }

    const { width: imgW, height: imgH } = image;

    if (pageSizeMode === 'original') {
      const page = pdfDoc.addPage([imgW, imgH]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: imgW,
        height: imgH,
      });
    } else {
      const isLandscape = imgW > imgH;
      const pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
      const pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const maxW = pageWidth - MARGIN * 2;
      const maxH = pageHeight - MARGIN * 2;

      const scale = Math.min(maxW / imgW, maxH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const x = (pageWidth - drawW) / 2;
      const y = (pageHeight - drawH) / 2;

      page.drawImage(image, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * PDF 문서에서 지정한 페이지 번호(1-indexed)만을 추출하여 새 PDF로 반환하는 함수
 */
export async function extractPdfPages(
  pdfBuffer: ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  if (!pageNumbers || pageNumbers.length === 0) {
    throw new Error('추출할 페이지 번호를 하나 이상 지정해야 합니다.');
  }

  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const destDoc = await PDFDocument.create();

  const zeroBasedIndices = pageNumbers
    .map((num) => num - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (zeroBasedIndices.length === 0) {
    throw new Error('유효한 범위의 페이지 번호가 없습니다.');
  }

  const copiedPages = await destDoc.copyPages(srcDoc, zeroBasedIndices);
  copiedPages.forEach((page) => destDoc.addPage(page));

  return await destDoc.save();
}

/**
 * PDF 페이지의 상/하/좌/우 여백(Margin)을 줄여주는 여백 자르기(Crop) 함수
 */
export async function cropPdfMargins(
  pdfBuffer: ArrayBuffer,
  margins: { top: number; bottom: number; left: number; right: number }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const { top, bottom, left, right } = margins;

  pages.forEach((page) => {
    const { x, y, width, height } = page.getCropBox() || page.getMediaBox();

    const newX = x + left;
    const newY = y + bottom;
    const newWidth = Math.max(10, width - left - right);
    const newHeight = Math.max(10, height - top - bottom);

    page.setCropBox(newX, newY, newWidth, newHeight);
  });

  return await pdfDoc.save();
}

/**
 * jsPDF 100% 표준 호환 PDF 열람 비밀번호(Open Password) 강제 암호화 함수 ⭐
 */
export async function protectPdf(pdfBuffer: ArrayBuffer, userPassword: string): Promise<Uint8Array> {
  if (!userPassword || userPassword.trim() === '') {
    throw new Error('설정할 암호를 입력해 주세요.');
  }

  const pwd = userPassword.trim();
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const totalPages = pdf.numPages;

  let doc: jsPDF | null = null;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';

      if (i === 1) {
        doc = new jsPDF({
          orientation,
          unit: 'pt',
          format: [viewport.width, viewport.height],
          encryption: {
            userPassword: pwd,
            ownerPassword: pwd,
            userPermissions: ['print', 'modify', 'copy', 'annot-forms'],
          },
        });
        doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
      } else if (doc) {
        doc.addPage([viewport.width, viewport.height], orientation);
        doc.setPage(i);
        doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
      }
    }
  }

  if (!doc) {
    throw new Error('PDF 렌더링에 실패했습니다.');
  }

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

/**
 * 암호가 걸린 PDF 문서의 암호를 정밀 검증 후 해제(Unlock)하는 함수 ⭐
 * 틀린 비밀번호 입력 시 100% 차단 에러를 발생시킵니다.
 */
export async function unlockPdf(pdfBuffer: ArrayBuffer, currentPassword: string): Promise<Uint8Array> {
  if (!currentPassword || currentPassword.trim() === '') {
    throw new Error('해제할 기존 암호를 입력해 주세요.');
  }

  const pwd = currentPassword.trim();

  // 1. PDF.js 보안 암호 정밀 검증 ⭐ (틀린 암호 시 PasswordException 발생!)
  try {
    const pdfTask = pdfjsLib.getDocument({ data: pdfBuffer, password: pwd });
    const pdf = await pdfTask.promise;

    // 2. 검증 통과 시 페이지 캔버스 해독 렌더링 후 깨끗한 무암호 PDF 생성
    const totalPages = pdf.numPages;
    let doc: jsPDF | null = null;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';

        if (i === 1) {
          doc = new jsPDF({
            orientation,
            unit: 'pt',
            format: [viewport.width, viewport.height],
          });
          doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        } else if (doc) {
          doc.addPage([viewport.width, viewport.height], orientation);
          doc.setPage(i);
          doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        }
      }
    }

    if (!doc) {
      throw new Error('PDF 해독 렌더링 실패');
    }

    const arrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    throw new Error('❌ 비밀번호가 올바르지 않습니다. 정확한 PDF 암호를 입력해 주세요.');
  }
}
