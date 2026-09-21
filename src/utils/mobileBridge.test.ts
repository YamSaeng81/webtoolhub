import { describe, it, expect } from 'vitest';
import { isNativeApp, shareContent } from './mobileBridge';

describe('mobileBridge utility', () => {
  it('isNativeApp should return false in standard node/browser test environment', () => {
    expect(isNativeApp()).toBe(false);
  });

  it('shareContent should return false or handle fallback gracefully without crash', async () => {
    const result = await shareContent({
      title: '테스트 제목',
      text: '테스트 내용',
      url: 'https://yhdeabba.com',
    });
    // Node 테스트 환경에서는 navigator.share나 clipboard가 mock되지 않은 경우 false 반환
    expect(typeof result).toBe('boolean');
  });
});
