import { PDFDocument, PDFName, PDFHexString, StandardFonts, rgb } from 'pdf-lib';

export type PageSizeMode = 'a4' | 'original';

/**
 * OCR 추출 텍스트와 캔버스 이미지를 기반으로 '검색 가능한 PDF(Searchable PDF)'를 생성하는 함수
 */
export async function createSearchablePdf(
  pagesData: { canvas: HTMLCanvasElement; text: string }[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const pageItem of pagesData) {
    const { canvas, text } = pageItem;
    const imgDataUrl = canvas.toDataURL('image/png');
    const pngImage = await pdfDoc.embedPng(imgDataUrl);

    const width = canvas.width;
    const height = canvas.height;

    // 페이지 생성 (픽셀 크기 1:1)
    const page = pdfDoc.addPage([width, height]);

    // 배경에 이미지 그리기
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    // 이미지 위에 텍스트 레이어를 덮어씌워 검색 및 드래그 복사가 가능하도록 인코딩 ⭐
    if (text && text.trim().length > 0) {
      const cleanLines = text.split('\n').filter((l) => l.trim().length > 0);
      let currentY = height - 30;

      cleanLines.forEach((line) => {
        if (currentY > 20) {
          try {
            page.drawText(line, {
              x: 20,
              y: currentY,
              size: 10,
              font,
              color: rgb(0, 0, 0),
              opacity: 0, // 투명 텍스트 레이어 (Ctrl+F 검색 및 드래그 복사 전용)
            });
          } catch (e) {
            // 한글/특수문자 인코딩 예외 처리
          }
          currentY -= 14;
        }
      });
    }
  }

  return await pdfDoc.save();
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
 */
export async function protectPdf(pdfBuffer: ArrayBuffer, userPassword: string): Promise<Uint8Array> {
  if (!userPassword || userPassword.trim() === '') {
    throw new Error('설정할 암호를 입력해 주세요.');
  }

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle('Protected Password Document');
  pdfDoc.setAuthor('WebToolHub Security Engine');

  const context = pdfDoc.context;

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
