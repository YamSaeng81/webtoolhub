/**
 * 텍스트 분석 및 변환 유틸리티
 */

export interface TextAnalysisResult {
  charsWithSpace: number;
  charsNoSpace: number;
  byteCount: number;
  wordCount: number;
  readingTimeMin: number;
}

/**
 * 텍스트의 공백 포함/제외 글자 수, UTF-8 바이트 수, 단어 수, 예상 읽기 시간을 분석하는 함수
 * @param text 분석할 문자열
 */
export function analyzeText(text: string): TextAnalysisResult {
  if (!text) {
    return {
      charsWithSpace: 0,
      charsNoSpace: 0,
      byteCount: 0,
      wordCount: 0,
      readingTimeMin: 0,
    };
  }

  const charsWithSpace = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  
  // UTF-8 Byte 계산
  const byteCount = new TextEncoder().encode(text).length;

  // 단어 수
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 평균 1분당 500자 읽기 기준
  const readingTimeMin = Math.max(1, Math.ceil(charsNoSpace / 500));

  return {
    charsWithSpace,
    charsNoSpace,
    byteCount,
    wordCount,
    readingTimeMin,
  };
}

export interface JsonFormatResult {
  isValid: boolean;
  formatted: string;
  errorMsg?: string;
}

/**
 * JSON 문자열의 정렬 및 유효성 검사 함수
 */
export function formatJson(jsonStr: string, indent: number = 2): JsonFormatResult {
  if (!jsonStr || !jsonStr.trim()) {
    return { isValid: false, formatted: '', errorMsg: 'JSON 텍스트를 입력해 주세요.' };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const formatted = JSON.stringify(parsed, null, indent);
    return { isValid: true, formatted };
  } catch (err) {
    return {
      isValid: false,
      formatted: jsonStr,
      errorMsg: err instanceof Error ? err.message : '유효하지 않은 JSON 형식을 포함하고 있습니다.',
    };
  }
}
