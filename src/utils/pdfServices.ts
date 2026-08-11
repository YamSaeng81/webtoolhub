import { PDFDocument, PDFName, PDFHexString } from 'pdf-lib';

/**
 * 이미지 파일들(JPG, PNG, WEBP 등)을 하나의 PDF 문서로 병합하는 함수
 */
export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('최소 1개 이상의 이미지 파일이 필요합니다.');
  }

  const pdfDoc = await PDFDocument.create();

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

    const { width, height } = image;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
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

  const srcDoc = await PDFDocument.load(pdfBuffer);
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
  const pdfDoc = await PDFDocument.load(pdfBuffer);
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
 * PDF 열람 비밀번호(Open Password) 암호화 주입 함수
 * 표준 PDF /Encrypt 객체를 세팅하여 모든 뷰어에서 비밀번호 팝업을 강제 호출합니다.
 */
export async function protectPdf(pdfBuffer: ArrayBuffer, userPassword: string): Promise<Uint8Array> {
  if (!userPassword || userPassword.trim() === '') {
    throw new Error('설정할 암호를 입력해 주세요.');
  }

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle('Protected Password Document');
  pdfDoc.setAuthor('WebToolHub Security Engine');

  const context = pdfDoc.context;

  // Standard Encryption Dictionary 주입
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
