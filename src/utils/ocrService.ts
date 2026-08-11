import { createWorker } from 'tesseract.js';

export interface OcrProgressInfo {
  status: string;
  progress: number;
}

/**
 * Tesseract.js 엔진을 사용하여 이미지 또는 Canvas 객체에서 한국어 + 영어 텍스트를 추출하는 함수
 */
export async function recognizeTextFromImage(
  imageSource: File | HTMLCanvasElement,
  lang: string = 'kor+eng',
  onProgress?: (info: OcrProgressInfo) => void
): Promise<string> {
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

  const ret = await worker.recognize(imageSource);
  await worker.terminate();

  return ret.data.text;
}
