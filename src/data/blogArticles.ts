export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  category: 'PDF 가이드' | '이미지 팁' | '미디어 편집' | '문서 & 취업';
  summary: string;
  author: string;
  date: string;
  readTime: string;
  coverEmoji: string;
  contentHtml: string;
  relatedToolPath: string;
  relatedToolName: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'article-1',
    slug: 'how-to-compress-pdf-securely',
    title: '관공서·이메일 제출용 대용량 PDF 용량 줄이기 완벽 가이드 & 보안 수칙',
    category: 'PDF 가이드',
    summary: '정부24, 공공기관, 대기업 채용 포털에 PDF 제출 시 발생하는 용량 초과 문제를 텍스트 선명도 손실 없이 안전하게 압축하는 실전 노하우를 공개합니다.',
    author: 'WebToolHub 테크 에디터',
    date: '2026-09-18',
    readTime: '5분 소요',
    coverEmoji: '📄',
    relatedToolPath: '/pdf/compress',
    relatedToolName: '무료 PDF 용량 줄이기 툴 바로가기',
    contentHtml: `
      <h2>1. 왜 공공기관과 기업은 PDF 용량을 제한할까요?</h2>
      <p>정부24, 국세청 홈택스, 대기업 채용 포털 등 수많은 전자 문서 접수처에서는 첨부 파일 크기를 <strong>건당 10MB 또는 20MB 이하</strong>로 엄격히 제한하고 있습니다. 이는 수십만 명의 사용자가 동시에 접속하는 대형 서버의 네트워크 트래픽 과부하를 방지하고, 데이터베이스 아카이빙 비용을 절감하기 위한 기술적 조치입니다.</p>
      <p>그러나 고화질 증명서나 스캔 문서는 아무런 최적화 없이 저장할 경우 30MB~50MB를 가볍게 넘어가기 일쑤이며, 이로 인해 서류 마감 직전에 제출 실패로 곤란을 겪는 사용자들이 매우 많습니다.</p>

      <h2>2. 화질 손상 없이 PDF 용량을 줄이는 3대 기술 원리</h2>
      <ul>
        <li><strong>고해상도 래스터 이미지(DPI) 다운샘플링:</strong> 문서 내에 삽입된 600DPI 이상의 인쇄용 사진을 화면 표시 및 열람에 최적화된 150~200DPI로 리샘플링하여 파일 크기를 절반 이하로 줄입니다.</li>
        <li><strong>미사용 폰트 서브셋 제거:</strong> 문서 전체에 쓰이지 않는 폰트 글리프(Glyph) 데이터를 파기하고, 실제 본문에 등장한 글자 데이터만 남겨 파일 헤더를 슬림화합니다.</li>
        <li><strong>무손실 스트림 압축(FlateDecode):</strong> PDF 내부의 텍스트 레이어와 벡터 그래픽 객체를 최신 zlib 무손실 알고리즘으로 재압축합니다.</li>
      </ul>

      <h2>3. 온라인 변환 사이트 이용 시 주의해야 할 프라이버시 보안 수칙</h2>
      <p>주민등록초본, 재직증명서, 세무자료와 같은 민감한 문서를 일반적인 온라인 파일 변환 사이트에 업로드할 때는 각별한 주의가 필요합니다. 대다수 일반 사이트는 사용자의 문서를 중앙 원격 서버로 전송받아 변환하기 때문에, 해킹이나 데이터 유출 사고의 위험이 존재합니다.</p>
      <p>안전한 문서 변환을 위해서는 <strong>WebAssembly(WASM) 기반으로 파일이 외부 서버로 단 1바이트도 전송되지 않고 브라우저 메모리 내부에서만 처리되는 보안 툴</strong>을 사용하는 것이 필수적입니다.</p>
    `,
  },
  {
    id: 'article-2',
    slug: 'epub-vs-pdf-ebook-comparison',
    title: '전자책 완벽 입문: EPUB과 PDF의 차이점과 TXT 변환 활용법',
    category: '문서 & 취업',
    summary: '이북리더기(크레마, 오닉스, 리디페이퍼) 사용자가 반드시 알아야 할 고정 레이아웃 PDF와 반응형 리플로우 EPUB의 장단점을 심층 비교합니다.',
    author: 'WebToolHub 에디터',
    date: '2026-09-17',
    readTime: '6분 소요',
    coverEmoji: '📖',
    relatedToolPath: '/text/epub-converter',
    relatedToolName: '무료 TXT ⇄ EPUB 전자책 변환기 바로가기',
    contentHtml: `
      <h2>1. EPUB과 PDF의 가장 결정적인 차이: '리플로우(Reflowable)'</h2>
      <p>전자책을 읽을 때 많은 분들이 <em>"PDF로 읽을까, EPUB으로 변환해서 읽을까?"</em> 고민합니다. 두 규격의 가장 핵심적인 차이는 바로 <strong>화면 크기에 맞춰 글자 배치가 유동적으로 변하는가(리플로우)</strong>입니다.</p>
      <ul>
        <li><strong>PDF (Portable Document Format):</strong> 인쇄물과 100% 동일한 '고정 레이아웃'을 유지합니다. 6인치 전자책 단말기에서 A4 크기 PDF를 열면 글자가 너무 작아져 매번 확대 및 패닝을 해야 하는 불편함이 있습니다.</li>
        <li><strong>EPUB (Electronic Publication):</strong> 웹 문서(HTML+CSS)처럼 작동하여, 글꼴 크기를 키우면 줄바꿈과 페이지 수가 기기 화면에 맞춰 자동으로 재배치됩니다. 스마트폰이나 이북리더기에서 가장 편안한 독서 경험을 제공합니다.</li>
      </ul>

      <h2>2. 일반 텍스트(.txt) 소설이나 강의 노트를 EPUB으로 변환하는 이유</h2>
      <p>단순한 메모장 TXT 파일은 목차(Index)가 없고 줄간격 조절이 어렵습니다. 하지만 이를 표준 EPUB 3.0 규격으로 변환하면 다음과 같은 혜택을 누릴 수 있습니다:</p>
      <ol>
        <li><strong>자동 챕터 목차(TOC) 생성:</strong> [제 1 장], [Chapter 1] 등의 키워드를 분석하여 터치 한 번으로 원하는 장으로 건너뛸 수 있습니다.</li>
        <li><strong>시력 보호 맞춤형 스타일:</strong> 명조체, 고딕체 폰트 변경과 배경 다크모드, 야간 조명 모드를 뷰어 앱에서 완벽하게 지원합니다.</li>
        <li><strong>독서 진도율 및 북마크 동기화:</strong> 클라우드 서재를 통해 태블릿과 스마트폰 간의 읽던 위치가 정확히 연동됩니다.</li>
      </ol>
    `,
  },
  {
    id: 'article-3',
    slug: 'ai-background-remover-guide',
    title: '인물·상품 사진 누끼(배경 제거) 투명 PNG로 0.1초 만에 따는 기술 원리',
    category: '이미지 팁',
    summary: '포토샵 펜툴 없이도 온디바이스 AI 세그멘테이션 신경망을 활용해 인물 머리카락과 쇼핑몰 상품 배경을 깔끔하게 분리하는 노하우를 알아봅니다.',
    author: 'AI 비전 연구팀',
    date: '2026-09-16',
    readTime: '4분 소요',
    coverEmoji: '✂️',
    relatedToolPath: '/image/bg-remover',
    relatedToolName: 'AI 이미지 배경 제거(누끼) 툴 바로가기',
    contentHtml: `
      <h2>1. 온디바이스(On-device) AI 누끼 제거란 무엇인가?</h2>
      <p>기존에는 이미지의 배경을 제거(누끼 따기)하기 위해 사진을 해외 클라우드 서버로 업로드해야 했습니다. 그러나 최근 웹 표준인 <strong>WebAssembly(WASM)와 WebGL 가속 기술</strong>의 비약적인 발전으로, 수십 메가바이트 크기의 경량화된 딥러닝 세그멘테이션 모델이 사용자의 웹 브라우저 안에서 직접 GPU 연산으로 구동될 수 있게 되었습니다.</p>

      <h2>2. 쇼핑몰 스마트스토어 상세페이지 제작 시 투명 PNG의 중요성</h2>
      <p>네이버 스마트스토어, 쿠팡 등 이커머스 오픈마켓에서는 흰색 단색 배경이나 투명 배경(Alpha Channel)의 대표 상품 썸네일을 필수 가이드라인으로 권장합니다. 배경이 정돈되지 않은 상품 사진은 고객의 구매 전환율을 떨어뜨리는 주요 원인이 됩니다.</p>
      <p>투명 PNG로 추출된 상품 이미지는 어떤 색상의 상세페이지 템플릿과도 자연스럽게 합성되며, 감각적인 프로모션 배너를 제작할 수 있는 밑바탕이 됩니다.</p>
    `,
  },
  {
    id: 'article-4',
    slug: 'resume-character-byte-count-tips',
    title: '취업 자기소개서 작성 시 공백 포함 글자수와 UTF-8 바이트(Byte) 계산법',
    category: '문서 & 취업',
    summary: '대기업 및 공기업 채용 전형에서 가장 헷갈리는 공백 포함/제외 글자 수와 한글 2바이트 vs 3바이트 인코딩 차이점을 완벽하게 해설합니다.',
    author: '취업 컨설팅 칼럼니스트',
    date: '2026-09-15',
    readTime: '4분 소요',
    coverEmoji: '✍️',
    relatedToolPath: '/text/counter',
    relatedToolName: '글자수 & 바이트 실시간 계산기 바로가기',
    contentHtml: `
      <h2>1. 왜 채용 사이트마다 글자 수와 바이트 수가 다르게 측정될까요?</h2>
      <p>취업 준비생들이 입사지원서를 작성할 때 가장 많이 당황하는 순간은 <em>"내 워드프로세서에서는 1,000자인데, 채용 포털에서는 3,000바이트 초과로 짤리는 현상"</em>입니다. 이는 시스템마다 문자를 바이트(Byte) 단위로 변환하는 인코딩 표준이 다르기 때문입니다.</p>
      <ul>
        <li><strong>EUC-KR / CP949 (레거시 공기업 시스템):</strong> 영문/공백은 1Byte, 한글 한 글자는 <strong>2Byte</strong>로 계산합니다.</li>
        <li><strong>UTF-8 (현대 웹 표준 및 대다수 대기업):</strong> 영문/숫자는 1Byte, 공백 1Byte, 한글 한 글자는 <strong>3Byte</strong>로 계산합니다.</li>
      </ul>

      <h2>2. 자소서 분량 맞춤 실전 작성 팁</h2>
      <p>항목당 500자(1,500Byte) 기준이라면, 한글 480자 내외에 공백을 적절히 배분하여 95%~98% 분량을 채우는 것이 가장 성의 있는 지원서로 평가받습니다. 실시간으로 글자 수와 바이트 수를 동시에 계측해 주는 신뢰할 수 있는 도구를 곁에 두고 작성하는 것을 권장합니다.</p>
    `,
  },
];

/**
 * 슬러그(slug) 문자열을 기반으로 등록된 블로그 아티클 객체를 검색합니다.
 * @param slug 아티클의 고유 URL 슬러그
 * @returns 일치하는 BlogArticle 객체 또는 undefined
 */
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(article => article.slug === slug);
}

