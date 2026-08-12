import { createWorker } from 'tesseract.js';

export interface OcrProgressInfo {
  status: string;
  progress: number;
}

export interface OcrResultWithPdf {
  text: string;
  pdfBytes?: Uint8Array;
}

/**
 * Tesseract.js 엔진을 사용하여 한국어 + 영어 텍스트 추출 및 검색 가능한 PDF 바이너리(HOCR PDF)를 생성하는 함수
 */
export async function recognizeTextFromImage(
  imageSource: File | HTMLCanvasElement,
  lang: string = 'kor+eng',
  onProgress?: (info: OcrProgressInfo) => void
): Promise<OcrResultWithPdf> {
  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status && onProgress) {
        onProgress({
          status: m.status,
          progress: typeof m.progress === 'number' ? m.progress : 0,
        });
      }
    },
  });

  // Tesseract 내장 HOCR PDF 렌더러 발동 (pdf: true) ⭐
  const ret = await worker.recognize(
    imageSource,
    { pdfTitle: 'WebToolHub Searchable OCR PDF' },
    { pdf: true }
  );

  await worker.terminate();

  return {
    text: ret.data.text,
    pdfBytes: ret.data.pdf ? new Uint8Array(ret.data.pdf) : undefined,
  };
}
