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
  {
    id: 'article-5',
    slug: 'gif-compression-optimization-guide',
    title: '블로그·커뮤니티 업로드용 움짤 GIF 용량 1/5로 줄이는 압축 기술 원리',
    category: '미디어 편집',
    summary: '디시인사이드, 네이버 블로그, 트위터의 GIF 첨부 용량 제한(5MB~10MB)을 화질 저하 없이 극복하는 색상 팔레트 최적화 및 프레임 스킵 기법을 분석합니다.',
    author: 'WebToolHub 그래픽 랩',
    date: '2026-09-18',
    readTime: '6분 소요',
    coverEmoji: '🎞️',
    relatedToolPath: '/media/gif-maker',
    relatedToolName: '고성능 무료 GIF 움짤 제작기 바로가기',
    contentHtml: `
      <h2>1. 왜 GIF 포맷은 영상보다 용량이 비정상적으로 클까요?</h2>
      <p>GIF(Graphics Interchange Format)는 1987년에 개발된 초창기 래스터 그래픽 포맷입니다. 현대 비디오 코덱(H.264, AV1 등)은 이전 프레임과 다음 프레임 간의 <em>'움직임 차이(Delta)'</em>만을 기록하여 고압축을 달성하지만, 레거시 GIF는 <strong>매 프레임마다 256색 비트맵 정지 이미지를 독립적으로 나열</strong>하는 무거운 구조를 갖습니다.</p>
      <p>이로 인해 3초짜리 짧은 1080p 고화질 영상도 GIF로 그대로 변환하면 20MB~30MB를 훌쩍 넘겨버리게 되며, 각종 커뮤니티나 블로그 플랫폼의 첨부 용량 제한(보통 5MB~10MB)에 걸려 업로드가 차단됩니다.</p>

      <h2>2. 시각적 화질을 보존하며 GIF 용량을 줄이는 3대 핵심 기법</h2>
      <ul>
        <li><strong>적응형 256색 팔레트 양자화(NeuQuant / Octree Quantization):</strong> 원본의 수백만 가지 색상 중 사람의 눈이 가장 민감하게 인지하는 핵심 256가지 색상만 추출하여 인덱싱 컬러 맵을 재구성합니다.</li>
        <li><strong>지능형 프레임 레이트(FPS) 조절:</strong> 60FPS의 과도한 프레임 레이트를 자연스러운 움직임을 보장하는 15~20FPS 수준으로 다운샘플링하여 전체 데이터양을 50% 이상 즉시 감축합니다.</li>
        <li><strong>투명화 디더링 최적화(Lempel-Ziv-Welch 압축):</strong> 움직이지 않는 배경 영역은 이전 프레임의 픽셀을 재사용하도록 투명 처리하여 LZW 사전식 압축 효율을 극대화합니다.</li>
      </ul>

      <h2>3. WebToolHub GIF 툴을 활용한 원스톱 최적화 팁</h2>
      <p>외부 인코더 소프트웨어를 복잡하게 설치할 필요 없이, 브라우저에서 바로 사진이나 연속 이미지를 불러와 프레임 지연 시간(Delay ms)과 해상도를 조절하면 1초 만에 2MB 이하의 초경량 고화질 움짤을 완성할 수 있습니다.</p>
    `,
  },
  {
    id: 'article-6',
    slug: 'ocr-accuracy-enhancement-guide',
    title: '스캔 문서 및 이미지 글자 인식(OCR) 정확도 100% 끌어올리는 전처리 꿀팁',
    category: 'PDF 가이드',
    summary: '스마트폰으로 촬영한 영수증, 계약서, 논문 이미지에서 오탈자 없이 텍스트를 정확하게 추출하는 이미지 전처리(Binarization, Deskew) 비법을 소개합니다.',
    author: 'AI 비전 연구팀',
    date: '2026-09-18',
    readTime: '5분 소요',
    coverEmoji: '🔍',
    relatedToolPath: '/pdf/ocr',
    relatedToolName: '브라우저 기반 무료 OCR 글자 인식기 바로가기',
    contentHtml: `
      <h2>1. OCR(Optical Character Recognition)의 작동 메커니즘</h2>
      <p>광학 문자 인식(OCR) 엔진(예: Tesseract.js 및 LSTM 신경망)은 입력된 이미지의 명암 대비와 윤곽선을 분석하여 글자의 기하학적 특징(획, 곡선, 교차점)을 찾아냅니다. 따라서 <strong>배경과 글자 간의 대비(Contrast)가 뚜렷할수록, 글자가 수평으로 바르게 정렬되어 있을수록</strong> 인식률은 99.9%에 수렴합니다.</p>

      <h2>2. OCR 인식률을 2배 높이는 4단계 이미지 전처리 수칙</h2>
      <ol>
        <li><strong>적응형 이진화(Adaptive Binarization):</strong> 그림자나 조명 얼룩이 있는 회색조 이미지를 완전한 흑백(Black & White) 2단계 색조로 전환하여 텍스트 외곽선을 강조합니다.</li>
        <li><strong>기울기 보정(Deskew):</strong> 비스듬하게 스캔된 문서는 인식 엔진이 줄바꿈과 띄어쓰기를 오인하게 만듭니다. 수평 각도를 0도로 정렬해 주는 것이 필수적입니다.</li>
        <li><strong>고해상도 확보(최소 300DPI 권장):</strong> 글자의 세부 획(예: 'ㄹ'과 'ㅁ', 'o'와 'c')이 뭉개지지 않도록 적절한 픽셀 해상도를 유지해야 합니다.</li>
        <li><strong>언어 모델 설정:</strong> 한글과 영문이 혼용된 문서의 경우 다중 언어 딕셔너리를 동시에 활성화하면 복합 어휘 인식률이 대폭 향상됩니다.</li>
      </ol>

      <h2>3. 100% 로컬 브라우저 OCR의 보안상 강점</h2>
      <p>주민등록번호, 사업자등록증, 은행 통장 사본 등 극비 민감 정보가 포함된 서류는 클라우드 OCR API로 전송할 경우 유출 위험이 큽니다. WebToolHub는 WebAssembly로 포팅된 OCR 엔진을 클라이언트 내부에서만 실행하므로 데이터 보안이 완벽하게 지켜집니다.</p>
    `,
  },
  {
    id: 'article-7',
    slug: 'video-to-mp3-bitrate-guide',
    title: '동영상에서 고음질 MP3 음원 추출 시 필수 상식: 비트레이트(kbps)와 포맷 비교',
    category: '미디어 편집',
    summary: 'MP4 영상에서 배경음악이나 강의 음성을 추출할 때 128kbps, 192kbps, 320kbps 중 어떤 비트레이트를 선택해야 무손실 원음 품질을 지킬 수 있는지 정리해 드립니다.',
    author: '사운드 엔지니어링 팁',
    date: '2026-09-17',
    readTime: '4분 소요',
    coverEmoji: '🎵',
    relatedToolPath: '/media/video-to-mp3',
    relatedToolName: '초고속 비디오 MP3 음원 추출기 바로가기',
    contentHtml: `
      <h2>1. 비트레이트(Bitrate, kbps)란 무엇이며 왜 중요할까요?</h2>
      <p>비트레이트는 1초 동안 전달되는 오디오 데이터의 양을 의미하며, 단위로는 <strong>kbps(kilobits per second)</strong>를 사용합니다. 비트레이트 수치가 높을수록 소리의 해상도(주파수 대역폭 및 다이내믹 레인지)가 풍부해져 원음에 가까운 깊은 음향을 들려줍니다.</p>

      <h2>2. 상황별 권장 비트레이트 가이드</h2>
      <ul>
        <li><strong>128kbps (표준 품질):</strong> 인터넷 강의, 회의 녹취록, 팟캐스트 등 사람의 목소리가 중심인 음성 파일에 최적입니다. 용량이 매우 작아 스마트폰 저장 공간을 절약할 수 있습니다.</li>
        <li><strong>192kbps (우수 품질):</strong> 일반적인 가요, 유튜브 영상 오디오 트랙을 보관할 때 권장되는 균형 잡힌 설정입니다.</li>
        <li><strong>320kbps (스튜디오 최고 품질):</strong> 클래식, 오케스트라, 전자음악 등 고음역과 저음역의 디테일이 중요한 음악 파일에 필수적인 프리미엄 음질입니다.</li>
      </ul>

      <h2>3. 비디오에서 음원을 분리하는 스마트한 방법</h2>
      <p>영상 속 원본 오디오 스트림(AAC 또는 Opus)을 불필요한 이중 압축 없이 브라우저의 FFmpeg 엔진으로 깨끗하게 디코딩하여 타깃 비트레이트의 MP3로 패키징하면, 지직거리는 잡음 없이 깨끗한 사운드를 영구 소장할 수 있습니다.</p>
    `,
  },
  {
    id: 'article-8',
    slug: 'epub-font-rendering-troubleshooting',
    title: 'EPUB 전자책 폰트 깨짐 및 스타일 렌더링 오류 완벽 해결 가이드',
    category: '문서 & 취업',
    summary: '크레마, 리디페이퍼, 킨들, 캘리버(Calibre)에서 전자책을 열었을 때 글자가 외계어로 깨지거나 줄바꿈이 어색할 때 1분 만에 고치는 실전 해결책입니다.',
    author: '전자출판 테크니컬 리드',
    date: '2026-09-16',
    readTime: '5분 소요',
    coverEmoji: '📖',
    relatedToolPath: '/text/epub-converter',
    relatedToolName: '무료 TXT ⇄ EPUB 전자책 변환기 바로가기',
    contentHtml: `
      <h2>1. EPUB 전자책에서 폰트 깨짐(글꼴 오류)이 일어나는 근본 원인</h2>
      <p>EPUB 파일은 본질적으로 HTML, CSS, XML 문서들을 ZIP 형태로 압축한 개방형 표준 전자책 포맷입니다. 리더기에서 글자가 네모 박스(Tofu 현상)나 기괴한 기호로 깨지는 현상은 주로 다음 두 가지 이유로 발생합니다.</p>
      <ul>
        <li><strong>문서 인코딩 불일치:</strong> 텍스트 파일이 레거시 EUC-KR이나 ANSI로 저장되어 있는데, EPUB 뷰어가 이를 국제 표준인 <strong>UTF-8</strong>로 파싱하려 할 때 100% 깨짐이 발생합니다.</li>
        <li><strong>임베디드 폰트 부재:</strong> 전자기기 내부에 한글 글꼴이 내장되어 있지 않은 상태에서 CSS 글꼴 지정이 누락되었을 경우 기본 서체가 누락됩니다.</li>
      </ul>

      <h2>2. 깨끗한 전자책을 만들기 위한 3단계 점검 리스트</h2>
      <ol>
        <li><strong>텍스트 파일 UTF-8 인코딩 통일:</strong> 원본 텍스트 문서를 EPUB으로 변환하기 전에 메모장이나 변환 툴을 통해 UTF-8(BOM 없음)으로 인코딩을 표준화합니다.</li>
        <li><strong>단락 구분과 문단 태그(&lt;p&gt;) 정규화:</strong> 단순 줄바꿈(Enter)이 아닌 시맨틱 문단 태그로 변환되어야 모든 전자책 단말기에서 글자 크기와 줄간격 조절이 유연하게 동작합니다.</li>
        <li><strong>메타데이터(제목, 저자, 언어: ko) 명시:</strong> OPF(Package Document) 파일 안에 &lt;dc:language&gt;ko&lt;/dc:language&gt; 속성을 지정해 주면 리더기가 최적의 한국어 렌더링 엔진을 작동시킵니다.</li>
      </ol>

      <h2>3. WebToolHub EPUB 변환기를 이용한 무결점 전자책 제작</h2>
      <p>WebToolHub의 EPUB 변환 도구는 원본 텍스트의 인코딩을 자동 감지하여 100% 무결점 UTF-8 XHTML 표준 규격으로 컴파일하므로, 어떤 e-잉크 리더기나 태블릿 앱에서도 글꼴 깨짐 없는 편안한 독서를 즐기실 수 있습니다.</p>
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

