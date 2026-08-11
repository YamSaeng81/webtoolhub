/**
 * WebToolHub 다국어(i18n) 시스템 - 5개 국어 완벽 지원
 * (한국어 ko, 영어 en, 스페인어 es, 중국어 zh, 일본어 ja)
 */

export type Language = 'ko' | 'en' | 'es' | 'zh' | 'ja';

export interface TranslationDictionary {
  brandSub: string;
  searchPlaceholder: string;
  allTools: string;
  privacyBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  featSpeed: string;
  featSecurity: string;
  featFree: string;
  pdfCategoryTitle: string;
  pdfCategoryDesc: string;
  imageCategoryTitle: string;
  imageCategoryDesc: string;
  mediaCategoryTitle: string;
  mediaCategoryDesc: string;
  textCategoryTitle: string;
  textCategoryDesc: string;
  communityCategoryTitle: string;
  communityCategoryDesc: string;
  selectFile: string;
  dropFileTitle: string;
  dropFileSub: string;
  processing: string;
  download: string;
  convert: string;
  reset: string;
  navTitle: string;

  // 게시판 & 폼 전용 다국어 키
  feedbackSubmitTitle: string;
  nicknameLabel: string;
  passwordLabel: string;
  categoryLabel: string;
  contentLabel: string;
  btnSubmit: string;
  catFeature: string;
  catBug: string;
  catGeneral: string;
  myPostsViewBtn: string;
  adminMasterViewBtn: string;
  nicknamePlaceholder: string;
  passwordPlaceholder: string;
  contentPlaceholder: string;
  postsHeader: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  ko: {
    brandSub: '올인원 웹 유틸리티 포털',
    searchPlaceholder: '어떤 도구를 찾으시나요? (예: PDF, OCR, MP3)...',
    allTools: '전체 툴',
    privacyBadge: '100% 브라우저 메모리 처리 (개인정보 & 파일 완벽 보호)',
    heroTitle: '빠르고 안전한 무제한',
    heroHighlight: '웹 유틸리티 포털',
    heroDesc: 'PDF 변환부터 이미지 압축, 동영상 MP3 추출, 글자수 세기까지! 파일이 서버로 업로드되지 않고 0.1초만에 내 브라우저에서 안전하게 처리됩니다.',
    featSpeed: '서버 대기시간 0초',
    featSecurity: '100% 데이터 유출 방지',
    featFree: '회원가입/비용 완전 무료',
    pdfCategoryTitle: '📄 PDF 도구 모음',
    pdfCategoryDesc: '서버 업로드 없이 100% 브라우저에서 처리되는 고성능 PDF 툴킷',
    imageCategoryTitle: '🖼️ 이미지 편집 & 변환',
    imageCategoryDesc: '용량 압축, 포맷 변환, 크기 조절, 파비콘 생성기',
    mediaCategoryTitle: '🎬 미디어 & 오디오 툴',
    mediaCategoryDesc: '동영상 MP3 추출, 오디오 구간 자르기',
    textCategoryTitle: '🔤 텍스트 & 개발자 계산기',
    textCategoryDesc: '글자수 세기, JSON 포맷터, Diff 문장 비교',
    communityCategoryTitle: '💬 소통 & 피드백 커뮤니티',
    communityCategoryDesc: '회원가입 없는 익명 피드백, 개선요청, 버그제보 게시판',
    selectFile: '파일 선택하기',
    dropFileTitle: '파일을 이곳으로 드래그하거나 클릭하여 선택하세요',
    dropFileSub: '서버에 저장되지 않고 100% 귀하의 브라우저에서 안전하게 처리됩니다.',
    processing: '처리 중...',
    download: '다운로드',
    convert: '변환 시작',
    reset: '다른 파일 작업하기',
    navTitle: '도구 내비게이션',

    feedbackSubmitTitle: '새 의견 / 개선사항 남기기',
    nicknameLabel: '닉네임:',
    passwordLabel: '비밀번호 (조회/삭제용):',
    categoryLabel: '카테고리:',
    contentLabel: '피드백 내용:',
    btnSubmit: '의견 등록하기',
    catFeature: '✨ 신규 툴 / 기능 신청',
    catBug: '🐛 버그 / 오류 제보',
    catGeneral: '💡 일반 소감 & 개선 의견',
    myPostsViewBtn: '내가 쓴 글 조회 (일반 유저)',
    adminMasterViewBtn: '관리자 모드 (모든 글 통으로 보기)',
    nicknamePlaceholder: '예: 익명유저',
    passwordPlaceholder: '조회 및 삭제용 비밀번호',
    contentPlaceholder: '자유롭게 의견이나 신규 도구 아이디어를 남겨주세요...',
    postsHeader: '등록된 유저 피드백',
  },

  en: {
    brandSub: 'All-in-One Web Utility Portal',
    searchPlaceholder: 'Search tools (e.g. PDF, OCR, MP3)...',
    allTools: 'All Tools',
    privacyBadge: '100% In-Browser Memory Processing (Full Privacy)',
    heroTitle: 'Fast, Safe & Unlimited',
    heroHighlight: 'Web Utility Portal',
    heroDesc: 'From PDF conversion to image compression, video MP3 extraction, and word count! No server upload—processed 100% safely in your browser in 0.1s.',
    featSpeed: '0s Server Latency',
    featSecurity: '100% Data Leak Protection',
    featFree: '100% Free & No Sign-up',
    pdfCategoryTitle: '📄 PDF Tools',
    pdfCategoryDesc: 'High-performance PDF toolkit processed 100% inside your browser',
    imageCategoryTitle: '🖼️ Image Editing & Conversion',
    imageCategoryDesc: 'Compress image size, format conversion, resize, favicon generator',
    mediaCategoryTitle: '🎬 Media & Audio Tools',
    mediaCategoryDesc: 'Video to MP3 converter, Audio trimmer',
    textCategoryTitle: '🔤 Text & Developer Utilities',
    textCategoryDesc: 'Word & Byte counter, JSON formatter, Text diff viewer',
    communityCategoryTitle: '💬 Community & Feedback',
    communityCategoryDesc: 'Anonymous feedback, feature requests, and bug reporting board',
    selectFile: 'Select File',
    dropFileTitle: 'Drag & Drop your files here or click to select',
    dropFileSub: '100% processed safely inside your browser without server upload.',
    processing: 'Processing...',
    download: 'Download',
    convert: 'Start Conversion',
    reset: 'Process Another File',
    navTitle: 'TOOL NAVIGATION',

    feedbackSubmitTitle: 'Submit Feedback / Request',
    nicknameLabel: 'Nickname:',
    passwordLabel: 'Password (For View/Delete):',
    categoryLabel: 'Category:',
    contentLabel: 'Content:',
    btnSubmit: 'Submit Feedback',
    catFeature: '✨ Feature Request',
    catBug: '🐛 Bug Report',
    catGeneral: '💡 General Suggestion',
    myPostsViewBtn: 'My Posts View (Private)',
    adminMasterViewBtn: 'Admin Master View',
    nicknamePlaceholder: 'e.g. User123',
    passwordPlaceholder: 'Password for view/delete',
    contentPlaceholder: 'Feel free to leave your thoughts or tool requests...',
    postsHeader: 'User Feedback Posts',
  },

  es: {
    brandSub: 'Portal de Utilidades Web Todo en Uno',
    searchPlaceholder: 'Buscar herramientas (ej. PDF, OCR, MP3)...',
    allTools: 'Todas las Herramientas',
    privacyBadge: 'Procesamiento 100% en Memoria del Navegador (Privacidad)',
    heroTitle: 'Rápido, Seguro e Ilimitado',
    heroHighlight: 'Portal de Utilidades Web',
    heroDesc: '¡Desde conversión de PDF hasta compresión de imágenes y extracción de MP3! Sin subida a servidores: procesado de forma 100% segura en tu navegador.',
    featSpeed: '0s Latencia del Servidor',
    featSecurity: '100% Protección de Datos',
    featFree: '100% Gratis y Sin Registro',
    pdfCategoryTitle: '📄 Herramientas PDF',
    pdfCategoryDesc: 'Juego de herramientas PDF procesado 100% en tu navegador',
    imageCategoryTitle: '🖼️ Edición y Conversión de Imágenes',
    imageCategoryDesc: 'Compresión de imágenes, conversión de formato, redimensionado',
    mediaCategoryTitle: '🎬 Herramientas de Medios y Audio',
    mediaCategoryDesc: 'Convertidor de video a MP3, recortador de audio',
    textCategoryTitle: '🔤 Texto y Desarrollador',
    textCategoryDesc: 'Contador de palabras y bytes, formateador JSON, visor diff',
    communityCategoryTitle: '💬 Comunidad y Comentarios',
    communityCategoryDesc: 'Tablón de comentarios anónimos y sugerencias',
    selectFile: 'Seleccionar Archivo',
    dropFileTitle: 'Arrastra y suelta tus archivos aquí o haz clic para seleccionar',
    dropFileSub: 'Procesado 100% seguro en tu navegador sin subida al servidor.',
    processing: 'Procesando...',
    download: 'Descargar',
    convert: 'Iniciar Conversión',
    reset: 'Procesar Otro Archivo',
    navTitle: 'NAVEGACIÓN DE HERRAMIENTAS',

    feedbackSubmitTitle: 'Enviar comentarios / Sugerencia',
    nicknameLabel: 'Nombre de usuario:',
    passwordLabel: 'Contraseña (para ver/borrar):',
    categoryLabel: 'Categoría:',
    contentLabel: 'Contenido:',
    btnSubmit: 'Enviar Comentarios',
    catFeature: '✨ Solicitud de función',
    catBug: '🐛 Informe de error',
    catGeneral: '💡 Sugerencia general',
    myPostsViewBtn: 'Ver mis publicaciones',
    adminMasterViewBtn: 'Modo Administrador',
    nicknamePlaceholder: 'ej. Usuario123',
    passwordPlaceholder: 'Contraseña para ver/eliminar',
    contentPlaceholder: 'Siéntase libre de dejar sus comentarios...',
    postsHeader: 'Comentarios de Usuarios',
  },

  zh: {
    brandSub: '多合一 Web 实用工具门户',
    searchPlaceholder: '搜索工具（例如 PDF、OCR、MP3）...',
    allTools: '所有工具',
    privacyBadge: '100% 浏览器内存处理（全隐私保护）',
    heroTitle: '快速、安全且无限制',
    heroHighlight: 'Web 实用工具门户',
    heroDesc: '从 PDF 转换到图像压缩、视频 MP3 提取和字数统计！无服务器上传 — 100% 在您的浏览器中在 0.1 秒内安全处理。',
    featSpeed: '0秒 服务器延迟',
    featSecurity: '100% 数据防泄露',
    featFree: '100% 免费且免注册',
    pdfCategoryTitle: '📄 PDF 工具箱',
    pdfCategoryDesc: '100% 在您的浏览器中处理的高性能 PDF 工具箱',
    imageCategoryTitle: '🖼️ 图像编辑与转换',
    imageCategoryDesc: '图像压缩、格式转换、尺寸调整、Favicon 生成器',
    mediaCategoryTitle: '🎬 媒体与音频工具',
    mediaCategoryDesc: '视频转 MP3 提取器、音频剪辑器',
    textCategoryTitle: '🔤 文本与开发人员计算器',
    textCategoryDesc: '字数和字节统计、JSON 格式化程序、文本 Diff 对比',
    communityCategoryTitle: '💬 社区与反馈',
    communityCategoryDesc: '匿名反馈、功能申请和错误报告板',
    selectFile: '选择文件',
    dropFileTitle: '将文件拖放至此处或点击选择',
    dropFileSub: '100% 在您的浏览器内安全处理，无需上传服务器。',
    processing: '处理中...',
    download: '下载',
    convert: '开始转换',
    reset: '处理其他文件',
    navTitle: '工具导航',

    feedbackSubmitTitle: '提交意见 / 改善建议',
    nicknameLabel: '昵称：',
    passwordLabel: '密码 (用于查看/删除)：',
    categoryLabel: '分类：',
    contentLabel: '反馈内容：',
    btnSubmit: '提交意见',
    catFeature: '✨ 新工具 / 功能申请',
    catBug: '🐛 Bug / 错误汇报',
    catGeneral: '💡 一般建议与感想',
    myPostsViewBtn: '查看我的帖子 (个人)',
    adminMasterViewBtn: '管理员主模式',
    nicknamePlaceholder: '例如: 用户123',
    passwordPlaceholder: '查看及删除密码',
    contentPlaceholder: '随时留下您的意见或新工具构想...',
    postsHeader: '用户反馈帖子',
  },

  ja: {
    brandSub: 'オールインワン Web ユーティリティポータル',
    searchPlaceholder: 'ツールを検索 (例: PDF, OCR, MP3)...',
    allTools: 'すべてのツール',
    privacyBadge: '100% ブラウザメモリ処理 (完全プライバシー保護)',
    heroTitle: '高速・安全・無制限',
    heroHighlight: 'Web ユーティリティポータル',
    heroDesc: 'PDF変換から画像圧縮、動画MP3抽出、文字数カウントまで！サーバーへのアップロード不要—ブラウザ内で0.1秒で安全に処理されます。',
    featSpeed: 'サーバーレイテンシ0秒',
    featSecurity: '100% データ漏洩防止',
    featFree: '完全無料・会員登録不要',
    pdfCategoryTitle: '📄 PDF ツール',
    pdfCategoryDesc: 'ブラウザ内で100%処理される高性能PDFツールキット',
    imageCategoryTitle: '🖼️ 画像編集・変換',
    imageCategoryDesc: '画像圧縮、フォーマット変換、リサイズ、ファビコン生成',
    mediaCategoryTitle: '🎬 メディア・音声ツール',
    mediaCategoryDesc: '動画からMP3抽出、音声トリミング',
    textCategoryTitle: '🔤 テキスト・開発者ツール',
    textCategoryDesc: '文字数・バイト計算、JSONフォーマッター、Diff比較',
    communityCategoryTitle: '💬 コミュニティ・フィードバック',
    communityCategoryDesc: '匿名フィードバック、機能リクエスト、バグ報告掲示板',
    selectFile: 'ファイルを選択',
    dropFileTitle: 'ファイルをここにドラッグ＆ドロップするかクリックして選択',
    dropFileSub: 'サーバーにアップロードされず、ブラウザ内で100%安全に処理されます。',
    processing: '処理中...',
    download: 'ダウンロード',
    convert: '変換開始',
    reset: '別のファイルを処理',
    navTitle: 'ツールナビゲーション',

    feedbackSubmitTitle: '新しいご意見・機能リクエストの送信',
    nicknameLabel: 'ニックネーム:',
    passwordLabel: 'パスワード (閲覧・削除用):',
    categoryLabel: 'カテゴリ:',
    contentLabel: 'フィードバック内容:',
    btnSubmit: 'ご意見を送信',
    catFeature: '✨ 新ツール・機能リクエスト',
    catBug: '🐛 バグ・不具合報告',
    catGeneral: '💡 一般的なご感想・改善案',
    myPostsViewBtn: '自分の投稿を表示 (個人)',
    adminMasterViewBtn: '管理者モード (全件表示)',
    nicknamePlaceholder: '例: ユーザー123',
    passwordPlaceholder: '閲覧および削除用パスワード',
    contentPlaceholder: 'ご意見や新しいツールのアイデアを自由にご記入ください...',
    postsHeader: '投稿されたユーザーフィードバック',
  },
};

export const LANGUAGE_OPTIONS: { code: Language; name: string; flag: string }[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];
