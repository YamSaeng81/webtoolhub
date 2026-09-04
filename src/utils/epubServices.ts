import JSZip from 'jszip';

export interface TxtToEpubOptions {
  title: string;
  author: string;
  splitBy: 'pattern' | 'length' | 'none';
  customPattern?: string;
  chunkLength?: number;
}

export interface EpubChapter {
  title: string;
  content: string;
}

/**
 * 텍스트 내용을 챕터별로 똑똑하게 분할하는 함수
 */
export function splitTextIntoChapters(text: string, options: TxtToEpubOptions): EpubChapter[] {
  const { splitBy, customPattern, chunkLength = 5000 } = options;
  const lines = text.split(/\r?\n/);

  if (splitBy === 'none') {
    return [{ title: options.title || '본문', content: text }];
  }

  if (splitBy === 'length') {
    const chapters: EpubChapter[] = [];
    let currentChunk = '';
    let chapterIndex = 1;

    for (const line of lines) {
      currentChunk += line + '\n';
      if (currentChunk.length >= chunkLength) {
        chapters.push({
          title: `제 ${chapterIndex} 장`,
          content: currentChunk.trim(),
        });
        currentChunk = '';
        chapterIndex++;
      }
    }

    if (currentChunk.trim()) {
      chapters.push({
        title: `제 ${chapterIndex} 장`,
        content: currentChunk.trim(),
      });
    }

    return chapters.length > 0 ? chapters : [{ title: '본문', content: text }];
  }

  // 기본 패턴: "제 1 장", "Chapter 1", "[1화]", "1.", "제1부" 등 감지
  const defaultRegex = /^(?:제\s*\d+\s*[장화부편절]|chapter\s*\d+|\d+\s*[\.\)]|\[\d+\])/i;
  const patternRegex = customPattern ? new RegExp(customPattern, 'i') : defaultRegex;

  const chapters: EpubChapter[] = [];
  let currentTitle = '프롤로그';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && patternRegex.test(trimmed)) {
      if (currentLines.length > 0) {
        chapters.push({
          title: currentTitle,
          content: currentLines.join('\n').trim(),
        });
        currentLines = [];
      }
      currentTitle = trimmed;
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    chapters.push({
      title: currentTitle,
      content: currentLines.join('\n').trim(),
    });
  }

  return chapters.length > 0 ? chapters : [{ title: options.title || '본문', content: text }];
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * TXT 파일 ➔ 국제 표준 EPUB 3.0 전자책 생성 함수 ⭐
 */
export async function convertTxtToEpub(
  textContent: string,
  options: TxtToEpubOptions
): Promise<Blob> {
  const zip = new JSZip();
  const bookTitle = options.title.trim() || 'Untitled Book';
  const bookAuthor = options.author.trim() || 'WebToolHub Author';
  const bookId = `urn:uuid:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const chapters = splitTextIntoChapters(textContent, options);

  // 1. mimetype (압축하지 않는 첫 번째 파일 규격)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. OEBPS/style.css (미려한 전자책 타이포그래피)
  zip.file(
    'OEBPS/style.css',
    `body {
  font-family: -apple-system, BlinkMacSystemFont, "KoPubWorld Batang", "Noto Serif KR", serif;
  line-height: 1.8;
  padding: 5%;
  color: #1a1a1a;
  background-color: #ffffff;
}
h1, h2, h3 {
  font-family: -apple-system, BlinkMacSystemFont, "KoPubWorld Dotum", "Noto Sans KR", sans-serif;
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 1em;
  color: #111827;
}
p {
  margin-bottom: 1em;
  text-indent: 1em;
  text-align: justify;
  word-break: break-word;
}`
  );

  // 4. 각 챕터별 XHTML 생성
  chapters.forEach((chap, idx) => {
    const paragraphs = chap.content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => `<p>${escapeXml(line.trim())}</p>`)
      .join('\n');

    const xhtmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ko">
<head>
  <title>${escapeXml(chap.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h2>${escapeXml(chap.title)}</h2>
  ${paragraphs}
</body>
</html>`;

    zip.file(`OEBPS/chapter_${idx + 1}.xhtml`, xhtmlContent);
  });

  // 5. OEBPS/nav.xhtml (EPUB 3 표준 목차 네비게이션)
  const navList = chapters
    .map((chap, idx) => `<li><a href="chapter_${idx + 1}.xhtml">${escapeXml(chap.title)}</a></li>`)
    .join('\n');

  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ko">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>목 차</h1>
    <ol>
      ${navList}
    </ol>
  </nav>
</body>
</html>`
  );

  // 6. OEBPS/toc.ncx (EPUB 2 하위 호환 목차)
  const navPoints = chapters
    .map(
      (chap, idx) => `  <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
    <navLabel><text>${escapeXml(chap.title)}</text></navLabel>
    <content src="chapter_${idx + 1}.xhtml"/>
  </navPoint>`
    )
    .join('\n');

  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(bookTitle)}</text></docTitle>
  <docAuthor><text>${escapeXml(bookAuthor)}</text></docAuthor>
  <navMap>
${navPoints}
  </navMap>
</ncx>`
  );

  // 7. OEBPS/content.opf (메타데이터, 매니페스트, 스파인)
  const manifestItems = [
    '<item id="style" href="style.css" media-type="text/css"/>',
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    ...chapters.map(
      (_, idx) =>
        `<item id="chap-${idx + 1}" href="chapter_${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ),
  ].join('\n    ');

  const spineItems = chapters
    .map((_, idx) => `<itemref idref="chap-${idx + 1}"/>`)
    .join('\n    ');

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:creator>${escapeXml(bookAuthor)}</dc:creator>
    <dc:identifier id="BookID">${bookId}</dc:identifier>
    <dc:language>ko</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`
  );

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * HTML/XHTML 문자열에서 순수 텍스트와 줄바꿈을 추출하는 헬퍼 함수 (DOMParser + Regex Fallback)
 */
function extractTextFromHtml(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style, nav').forEach((el) => el.remove());

      const blocks: string[] = [];
      doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, li, blockquote').forEach((block) => {
        const text = block.textContent?.trim();
        if (text) blocks.push(text);
      });

      if (blocks.length > 0) return blocks.join('\n\n');
      return doc.body.textContent?.trim() || '';
    } catch (e) {
      // Fallback to regex
    }
  }

  // Regex Fallback (Node.js 테스트 및 경량 환경)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<(?:h[1-6]|p|div|li|blockquote)[^>]*>(.*?)<\/(?:h[1-6]|p|div|li|blockquote)>/gi, '$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * EPUB 파일 ➔ 깨끗한 TXT 텍스트 추출 함수 ⭐
 */
export async function convertEpubToTxt(epubBuffer: ArrayBuffer): Promise<{ text: string; chapterCount: number; title: string }> {
  const zip = await JSZip.loadAsync(epubBuffer);
  let title = 'Extracted Book';
  let chapterCount = 0;

  // 1. container.xml을 읽어 OPF 경로 찾기
  const containerFile = zip.file('META-INF/container.xml');
  let opfPath = 'OEBPS/content.opf';

  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const match = containerXml.match(/full-path=["']([^"']+)["']/i);
    if (match && match[1]) {
      opfPath = match[1];
    }
  }

  // 2. OPF 파일 파싱 (제목 및 스파인 읽기 순서 추출)
  const opfFile = zip.file(opfPath);
  const basePath = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  const orderedHtmlPaths: string[] = [];

  if (opfFile) {
    const opfXml = await opfFile.async('text');

    // Title 추출
    const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i) || opfXml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Manifest & Spine 매핑
    const manifestMap = new Map<string, string>();
    const itemMatches = opfXml.matchAll(/<item\s+[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
    for (const m of itemMatches) {
      manifestMap.set(m[1], basePath + m[2]);
    }
    // id와 href 순서 반대 케이스 처리
    const itemMatchesAlt = opfXml.matchAll(/<item\s+[^>]*href=["']([^"']+)["'][^>]*id=["']([^"']+)["'][^>]*>/gi);
    for (const m of itemMatchesAlt) {
      manifestMap.set(m[2], basePath + m[1]);
    }

    const itemrefMatches = opfXml.matchAll(/<itemref\s+[^>]*idref=["']([^"']+)["'][^>]*>/gi);
    for (const m of itemrefMatches) {
      const idref = m[1];
      if (manifestMap.has(idref)) {
        orderedHtmlPaths.push(manifestMap.get(idref)!);
      }
    }
  }

  // 만약 스파인 매핑에 실패했다면 zip 내의 모든 .html / .xhtml 파일 탐색
  const finalPaths = orderedHtmlPaths.length > 0
    ? orderedHtmlPaths
    : Object.keys(zip.files).filter((path) => /\.(x?html|htm)$/i.test(path) && !path.includes('nav.xhtml'));

  const textSections: string[] = [];

  for (const htmlPath of finalPaths) {
    const file = zip.file(htmlPath);
    if (file) {
      const htmlContent = await file.async('text');
      const text = extractTextFromHtml(htmlContent);

      if (text.length > 0) {
        textSections.push(text);
        chapterCount++;
      }
    }
  }

  const combinedText = `[도서명: ${title}]\n\n` + textSections.join('\n\n----------------------------------------\n\n');

  return {
    text: combinedText,
    chapterCount,
    title,
  };
}

