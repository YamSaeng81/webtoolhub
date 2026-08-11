import { describe, it, expect } from 'vitest';
import { analyzeText, formatJson } from '../utils/textServices';

describe('텍스트 서비스 유틸리티 단위 테스트 (textServices)', () => {
  it('글자수 및 UTF-8 바이트 수가 정확히 계산되어야 한다', () => {
    const text = '안녕하세요 WebToolHub';
    const result = analyzeText(text);

    // '안녕하세요 WebToolHub' -> 16자 (공백 포함: 한글 5자 + 공백 1자 + 영문 10자)
    expect(result.charsWithSpace).toBe(16);
    // 공백 1개 제외 -> 15자
    expect(result.charsNoSpace).toBe(15);
    // 한글 5자 * 3bytes + 공백 1 + 영문 10자 = 26 bytes
    expect(result.byteCount).toBe(26);
  });

  it('올바른 JSON 구문일 경우 예쁘게 정렬(Formatting)되어야 한다', () => {
    const jsonInput = '{"name":"WebToolHub","tools":13}';
    const result = formatJson(jsonInput);

    expect(result.isValid).toBe(true);
    expect(result.formatted).toContain('{\n  "name": "WebToolHub"');
  });

  it('잘못된 JSON 구문일 경우 isValid가 false이고 에러 메시지를 반환해야 한다', () => {
    const invalidJson = '{"name": "WebToolHub",}'; // 트레일링 콤마 오류
    const result = formatJson(invalidJson);

    expect(result.isValid).toBe(false);
    expect(result.errorMsg).toBeDefined();
  });
});
