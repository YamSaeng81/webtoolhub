import { describe, it, expect } from 'vitest';
import {
  splitTextIntoChapters,
  convertTxtToEpub,
  convertEpubToTxt,
} from '../epubServices';

describe('epubServices Unit Tests', () => {
  const sampleNovel = `제 1 장: 모험의 시작
옛날 옛적 어느 마을에 용감한 소년이 살았습니다.
소년은 매일 아침 숲으로 모험을 떠났습니다.

제 2 장: 신비한 동굴
소년은 깊은 숲속에서 반짝이는 동굴을 발견했습니다.
동굴 안에는 오래된 보물 상자가 있었습니다.

제 3 장: 귀환과 평화
보물을 찾은 소년은 마을로 돌아와 모두와 행복하게 살았습니다.`;

  describe('splitTextIntoChapters', () => {
    it('패턴 기반으로 챕터를 올바르게 3개로 분할해야 한다', () => {
      const chapters = splitTextIntoChapters(sampleNovel, {
        title: '소년의 모험',
        author: '홍길동',
        splitBy: 'pattern',
      });

      expect(chapters.length).toBe(3);
      expect(chapters[0].title).toBe('제 1 장: 모험의 시작');
      expect(chapters[1].title).toBe('제 2 장: 신비한 동굴');
      expect(chapters[2].title).toBe('제 3 장: 귀환과 평화');
    });

    it('splitBy가 none일 경우 단일 챕터로 반환해야 한다', () => {
      const chapters = splitTextIntoChapters(sampleNovel, {
        title: '단일 도서',
        author: '저자',
        splitBy: 'none',
      });

      expect(chapters.length).toBe(1);
      expect(chapters[0].title).toBe('단일 도서');
      expect(chapters[0].content).toBe(sampleNovel);
    });

    it('글자 수(length) 기준으로 챕터를 분할할 수 있어야 한다', () => {
      const chapters = splitTextIntoChapters(sampleNovel, {
        title: '길이 분할',
        author: '저자',
        splitBy: 'length',
        chunkLength: 50,
      });

      expect(chapters.length).toBeGreaterThan(1);
      expect(chapters[0].title).toBe('제 1 장');
    });
  });

  describe('convertTxtToEpub & convertEpubToTxt', () => {
    it('TXT 텍스트를 EPUB Blob으로 정상 생성해야 한다', async () => {
      const epubBlob = await convertTxtToEpub(sampleNovel, {
        title: '소년의 모험',
        author: '홍길동',
        splitBy: 'pattern',
      });

      expect(epubBlob).toBeInstanceOf(Blob);
      expect(epubBlob.type).toBe('application/epub+zip');
      expect(epubBlob.size).toBeGreaterThan(500);
    });

    it('생성된 EPUB에서 텍스트를 다시 정상적으로 추출할 수 있어야 한다', async () => {
      const epubBlob = await convertTxtToEpub(sampleNovel, {
        title: '소년의 모험',
        author: '홍길동',
        splitBy: 'pattern',
      });

      const buffer = await epubBlob.arrayBuffer();
      const extracted = await convertEpubToTxt(buffer);

      expect(extracted.title).toBe('소년의 모험');
      expect(extracted.chapterCount).toBe(3);
      expect(extracted.text).toContain('모험의 시작');
      expect(extracted.text).toContain('신비한 동굴');
      expect(extracted.text).toContain('보물 상자');
    });
  });
});
