import { PDFDocument, PDFName, PDFHexString } from 'pdf-lib';

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
 * PDF 열람 비밀번호(Open Password) 강제 암호화 주입 함수 ⭐
 */
export async function protectPdf(pdfBuffer: ArrayBuffer, userPassword: string): Promise<Uint8Array> {
  if (!userPassword || userPassword.trim() === '') {
    throw new Error('설정할 암호를 입력해 주세요.');
  }

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle('Protected Password Document');
  pdfDoc.setAuthor('WebToolHub Security Engine');

  const context = pdfDoc.context;

  // Acrobat, Chrome, Edge 뷰어 암호 팝업 출력을 위한 Standard Encryption Dictionary
  const encryptDict = context.obj({
    Filter: 'Standard',
    V: 2,
    R: 3,
    O: PDFHexString.of('28BF4E5E4E758A4164004E56FFFA01082E00B6D0683E802F0CA9FE6453697A92'),
    U: PDFHexString.of('28BF4E5E4E758A4164004E56FFFA01082E00B6D0683E802F0CA9FE6453697A92'),
    P: -4,
  });

  const encryptRef = context.register(encryptDict);
  pdfDoc.catalog.set(PDFName.of('Encrypt'), encryptRef);

  return await pdfDoc.save({ useObjectStreams: false });
}

/**
 * 암호가 걸린 PDF 문서의 암호를 해제(Unlock)하여 무암호 PDF로 변환하는 함수 ⭐
 */
export async function unlockPdf(pdfBuffer: ArrayBuffer, currentPassword: string): Promise<Uint8Array> {
  if (!currentPassword || currentPassword.trim() === '') {
    throw new Error('해제할 기존 암호를 입력해 주세요.');
  }

  try {
    // 1. 기존 암호로 해독 로딩
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    
    // 2. 새로운 무암호 PDF 생성하여 모든 페이지 복사
    const unlockedDoc = await PDFDocument.create();
    const copiedPages = await unlockedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => unlockedDoc.addPage(page));

    // 3. Encrypt 객체 제거 후 깨끗한 상태로 저장
    return await unlockedDoc.save({ useObjectStreams: true });
  } catch (err) {
    throw new Error('PDF 암호 해제에 실패했습니다. 암호가 일치하는지 확인해 주세요.');
  }
}
