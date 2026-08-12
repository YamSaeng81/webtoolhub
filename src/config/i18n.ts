export type Language = 'ko' | 'en' | 'es' | 'zh' | 'ja';

export interface TranslationDictionary {
  siteTitle: string;
  siteSubtitle: string;
  searchPlaceholder: string;
  selectLanguage: string;
  allTools: string;
  pdfCategory: string;
  imageCategory: string;
  mediaCategory: string;
  textCategory: string;
  communityCategory: string;
  dropFileTitle: string;
  dropFileDesc: string;
  selectFile: string;
  processing: string;
  download: string;
  reset: string;
  myPostsViewBtn: string;
  adminMasterViewBtn: string;
  feedbackSubmitTitle: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  categoryLabel: string;
  catFeature: string;
  catBug: string;
  catGeneral: string;
  contentLabel: string;
  contentPlaceholder: string;
  btnSubmit: string;
  postsHeader: string;
  
  // 추가 호환 키
  dropFileSub?: string;
  privacyBadge?: string;
  brandSub?: string;
  navTitle?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDesc?: string;
  featSpeed?: string;
  featSecurity?: string;
  featFree?: string;
  pdfCategoryTitle?: string;
  imageCategoryTitle?: string;
  mediaCategoryTitle?: string;
  textCategoryTitle?: string;
  communityCategoryTitle?: string;
  pdfCategoryDesc?: string;
  imageCategoryDesc?: string;
  mediaCategoryDesc?: string;
  textCategoryDesc?: string;
  communityCategoryDesc?: string;

  // 신규 PDF 툴 번역 키 ⭐
  toolPdfMergeTitle: string;
  toolPdfMergeDesc: string;
  toolPdfCompressTitle: string;
  toolPdfCompressDesc: string;
  toolPdfRotateTitle: string;
  toolPdfRotateDesc: string;
}

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export const translations: Record<Language, TranslationDictionary> = {
  ko: {
    siteTitle: 'WebToolHub',
    siteSubtitle: '올인원 웹 유틸리티 포털',
    searchPlaceholder: '도구 검색 (예: PDF, OCR, MP3)...',
    selectLanguage: '언어 선택',
    allTools: '전체 도구',
    pdfCategory: 'PDF 도구',
    imageCategory: '이미지 편집 & 변환',
    mediaCategory: '비디오 & 오디오 미디어',
    textCategory: '텍스트 & 개발자 유틸리티',
    communityCategory: '소통 & 커뮤니티',
    dropFileTitle: '파일을 이곳에 드래그하거나 클릭하여 선택하세요',
    dropFileDesc: '서버 업로드 없이 100% 내 브라우저에서 안전하게 처리됩니다',
    dropFileSub: '서버 업로드 없이 100% 내 브라우저에서 안전하게 처리됩니다',
    privacyBadge: '🔒 100% 브라우저 메모리 보안 처리',
    brandSub: '올인원 웹 유틸리티 포털',
    navTitle: '유틸리티 메뉴',
    heroTitle: '빠르고 안전한 무료',
    heroHighlight: '웹 유틸리티 포털',
    heroDesc: 'PDF, 이미지, 미디어, 텍스트 변환까지 모든 작업을 서버 업로드 없이 브라우저에서 100% 안전하게 무료로 이용하세요.',
    featSpeed: '⚡ 초고속 변환',
    featSecurity: '🔒 100% 개인정보 보호',
    featFree: '💯 영구 무료 이용',
    pdfCategoryTitle: 'PDF 도구',
    imageCategoryTitle: '이미지 편집 & 변환',
    mediaCategoryTitle: '비디오 & 오디오 미디어',
    textCategoryTitle: '텍스트 & 개발자 유틸리티',
    communityCategoryTitle: '소통 & 커뮤니티',
    pdfCategoryDesc: 'PDF 합치기, 용량 축소, 회전, 변환, OCR, 암호화 도구 모음',
    imageCategoryDesc: '이미지 압축, 포맷 변환, 크기 조절 및 파비콘 패키지 생성',
    mediaCategoryDesc: '동영상 MP3 추출 및 오디오 구간 정밀 커팅',
    textCategoryDesc: '글자수 세기, JSON Pretty 정렬 및 문법 검증, Text Diff 비교',
    communityCategoryDesc: '자유로운 신규 툴 제안 및 개선 피드백 게시판',
    selectFile: '파일 선택',
    processing: '처리 중...',
    download: '다운로드',
    reset: '초기화',
    myPostsViewBtn: '본인 작성글 조회',
    adminMasterViewBtn: '관리자 마스터 모드',
    feedbackSubmitTitle: '의견 및 피드백 작성',
    nicknameLabel: '닉네임',
    nicknamePlaceholder: '닉네임 입력',
    passwordLabel: '비밀번호',
    passwordPlaceholder: '글 관리용 비밀번호 입력',
    categoryLabel: '카테고리',
    catFeature: '💡 기능 제안 / 개선',
    catBug: '🐛 버그 제보',
    catGeneral: '💬 일반 문의 / 의견',
    contentLabel: '내용',
    contentPlaceholder: '개선 피드백 및 의견을 자유롭게 작성해 주세요.',
    btnSubmit: '피드백 제출하기',
    postsHeader: '등록된 소통 게시글',

    toolPdfMergeTitle: 'PDF 파일 합치기 (PDF Merge)',
    toolPdfMergeDesc: '여러 개의 PDF 문서를 원하는 순서대로 배치하여 하나의 파일로 병합합니다.',
    toolPdfCompressTitle: 'PDF 용량 줄이기 (PDF Compress)',
    toolPdfCompressDesc: '고화질 PDF 문서의 해상도를 유지하면서 파일 용량을 수십 % 최적화 압축합니다.',
    toolPdfRotateTitle: 'PDF 페이지 회전 (PDF Rotate)',
    toolPdfRotateDesc: 'PDF 문서의 각 페이지를 시각적으로 확인하며 90도, 180도, 270도 원하는 대로 회전합니다.',
  },
  en: {
    siteTitle: 'WebToolHub',
    siteSubtitle: 'All-in-One Web Utility Portal',
    searchPlaceholder: 'Search tools (e.g. PDF, OCR, MP3)...',
    selectLanguage: 'Select Language',
    allTools: 'All Tools',
    pdfCategory: 'PDF Tools',
    imageCategory: 'Image Editing & Conversion',
    mediaCategory: 'Video & Audio Media',
    textCategory: 'Text & Developer Utilities',
    communityCategory: 'Community & Feedback',
    dropFileTitle: 'Drag & Drop files here or click to browse',
    dropFileDesc: 'Processed 100% safely in your browser memory with zero server upload',
    dropFileSub: 'Processed 100% safely in your browser memory with zero server upload',
    privacyBadge: '🔒 100% Safe Browser Processing',
    brandSub: 'All-in-One Utility Portal',
    navTitle: 'Utility Menu',
    heroTitle: 'Fast & Secure Free',
    heroHighlight: 'Web Utility Portal',
    heroDesc: 'All tools work 100% in your browser memory without uploading files to server.',
    featSpeed: '⚡ High Speed',
    featSecurity: '🔒 100% Privacy',
    featFree: '💯 100% Free',
    pdfCategoryTitle: 'PDF Tools',
    imageCategoryTitle: 'Image Tools',
    mediaCategoryTitle: 'Video & Audio',
    textCategoryTitle: 'Text Utilities',
    communityCategoryTitle: 'Community & Feedback',
    pdfCategoryDesc: 'PDF Merge, Compress, Rotate, Convert, OCR & Protect tools',
    imageCategoryDesc: 'Compress, Convert, Resize & Favicon generator',
    mediaCategoryDesc: 'Video MP3 extractor and Audio cutter',
    textCategoryDesc: 'Character Counter, JSON Formatter & Text Diff',
    communityCategoryDesc: 'Feature requests & feedback board',
    selectFile: 'Select File',
    processing: 'Processing...',
    download: 'Download',
    reset: 'Reset',
    myPostsViewBtn: 'My Posts View',
    adminMasterViewBtn: 'Admin Master Mode',
    feedbackSubmitTitle: 'Submit Feedback & Ideas',
    nicknameLabel: 'Nickname',
    nicknamePlaceholder: 'Enter nickname',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter post password',
    categoryLabel: 'Category',
    catFeature: '💡 Feature Request',
    catBug: '🐛 Bug Report',
    catGeneral: '💬 General Inquiry',
    contentLabel: 'Content',
    contentPlaceholder: 'Write your feedback or suggestions freely.',
    btnSubmit: 'Submit Feedback',
    postsHeader: 'Community Posts',

    toolPdfMergeTitle: 'Merge PDF Files',
    toolPdfMergeDesc: 'Combine multiple PDF documents into a single unified file in your preferred order.',
    toolPdfCompressTitle: 'Compress PDF Size',
    toolPdfCompressDesc: 'Reduce PDF file size significantly while preserving high document quality.',
    toolPdfRotateTitle: 'Rotate PDF Pages',
    toolPdfRotateDesc: 'Visually rotate individual PDF pages by 90, 180, or 270 degrees.',
  },
  es: {
    siteTitle: 'WebToolHub',
    siteSubtitle: 'Portal de Utilidades Web Todo en Uno',
    searchPlaceholder: 'Buscar herramientas (ej. PDF, OCR)...',
    selectLanguage: 'Seleccionar Idioma',
    allTools: 'Todas las Herramientas',
    pdfCategory: 'Herramientas PDF',
    imageCategory: 'Edición y Conversión de Imágenes',
    mediaCategory: 'Medios de Video y Audio',
    textCategory: 'Texto y Utilidades para Desarrolladores',
    communityCategory: 'Comunidad y Comentarios',
    dropFileTitle: 'Arrastre archivos aquí o haga clic para buscar',
    dropFileDesc: 'Procesado 100% seguro en la memoria de su navegador sin carga al servidor',
    selectFile: 'Seleccionar Archivo',
    processing: 'Procesando...',
    download: 'Descargar',
    reset: 'Restablecer',
    myPostsViewBtn: 'Ver mis publicaciones',
    adminMasterViewBtn: 'Modo Maestro Administrador',
    feedbackSubmitTitle: 'Enviar comentarios e ideas',
    nicknameLabel: 'Apodo',
    nicknamePlaceholder: 'Ingrese su apodo',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Contraseña de la publicación',
    categoryLabel: 'Categoría',
    catFeature: '💡 Sugerencia de función',
    catBug: '🐛 Informe de error',
    catGeneral: '💬 Consulta general',
    contentLabel: 'Contenido',
    contentPlaceholder: 'Escriba sus comentarios o sugerencias libremente.',
    btnSubmit: 'Enviar Comentarios',
    postsHeader: 'Publicaciones de la Comunidad',

    toolPdfMergeTitle: 'Combinar archivos PDF',
    toolPdfMergeDesc: 'Combine varios documentos PDF en un solo archivo unificado en el orden que prefiera.',
    toolPdfCompressTitle: 'Comprimir tamaño de PDF',
    toolPdfCompressDesc: 'Reduzca el tamaño del archivo PDF preservando la alta calidad del documento.',
    toolPdfRotateTitle: 'Rotar páginas PDF',
    toolPdfRotateDesc: 'Rote visualmente páginas individuales de PDF 90, 180 o 270 grados.',
  },
  zh: {
    siteTitle: 'WebToolHub',
    siteSubtitle: '多合一 Web 工具门户',
    searchPlaceholder: '搜索工具（例如 PDF、OCR、MP3）...',
    selectLanguage: '选择语言',
    allTools: '所有工具',
    pdfCategory: 'PDF 工具',
    imageCategory: '图像编辑与转换',
    mediaCategory: '视频与音频媒体',
    textCategory: '文本与开发者实用工具',
    communityCategory: '社区与反馈',
    dropFileTitle: '拖放文件到此处或点击浏览',
    dropFileDesc: '100% 在您的浏览器内存中安全处理，零服务器上传',
    selectFile: '选择文件',
    processing: '处理中...',
    download: '下载',
    reset: '重置',
    myPostsViewBtn: '查看我的帖子',
    adminMasterViewBtn: '管理员主模式',
    feedbackSubmitTitle: '提交意见与反馈',
    nicknameLabel: '昵称',
    nicknamePlaceholder: '输入昵称',
    passwordLabel: '密码',
    passwordPlaceholder: '输入帖子管理密码',
    categoryLabel: '分类',
    catFeature: '💡 功能建议',
    catBug: '🐛 提交 Bug',
    catGeneral: '💬 一般咨询',
    contentLabel: '内容',
    contentPlaceholder: '请自由填写您的改进建议与反馈。',
    btnSubmit: '提交反馈',
    postsHeader: '社区帖子列表',

    toolPdfMergeTitle: '合并 PDF 文件',
    toolPdfMergeDesc: '按您喜欢的顺序将多个 PDF 文档合并为一个统一的文件。',
    toolPdfCompressTitle: '压缩 PDF 大小',
    toolPdfCompressDesc: '在保持高质量的同时显著降低 PDF 文件大小。',
    toolPdfRotateTitle: '旋转 PDF 页面',
    toolPdfRotateDesc: '以可视化方式将单个 PDF 页面旋转 90度、180度 或 270度。',
  },
  ja: {
    siteTitle: 'WebToolHub',
    siteSubtitle: 'オールインワンWebユーティリティポータル',
    searchPlaceholder: 'ツールを検索 (例: PDF, OCR, MP3)...',
    selectLanguage: '言語を選択',
    allTools: 'すべてのツール',
    pdfCategory: 'PDFツール',
    imageCategory: '画像編集＆変換',
    mediaCategory: '動画＆音声メディア',
    textCategory: 'テキスト＆開発者ユーティリティ',
    communityCategory: 'コミュニティ＆フィードバック',
    dropFileTitle: 'ここにファイルをドラッグ＆ドロップするかクリックして選択',
    dropFileDesc: 'サーバーアップロードなしで100%ブラウザメモリ内で安全に処理されます',
    selectFile: 'ファイルを選択',
    processing: '処理中...',
    download: 'ダウンロード',
    reset: 'リセット',
    myPostsViewBtn: '自分の投稿を表示',
    adminMasterViewBtn: '管理者マスターモード',
    feedbackSubmitTitle: 'ご意見・フィードバックの送信',
    nicknameLabel: 'ニックネーム',
    nicknamePlaceholder: 'ニックネームを入力',
    passwordLabel: 'パスワード',
    passwordPlaceholder: '投稿管理用パスワードを入力',
    categoryLabel: 'カテゴリ',
    catFeature: '💡 機能提案',
    catBug: '🐛 バグ報告',
    catGeneral: '💬 一般的なお問い合わせ',
    contentLabel: '内容',
    contentPlaceholder: '改善点やご意見をご自由にお書きください。',
    btnSubmit: 'フィードバックを送信',
    postsHeader: 'コミュニティの投稿一覧',

    toolPdfMergeTitle: 'PDFファイルを結合 (PDF Merge)',
    toolPdfMergeDesc: '複数のPDFドキュメントをお好みの順序で1つのファイルに結合します。',
    toolPdfCompressTitle: 'PDF容量を削減 (PDF Compress)',
    toolPdfCompressDesc: '高品質を維持しながらPDFファイルの容量を圧縮・最適化します。',
    toolPdfRotateTitle: 'PDFページを回転 (PDF Rotate)',
    toolPdfRotateDesc: '各ページを視覚的に確認しながら90度、180度、270度に回転させます。',
  },
};

export const TRANSLATIONS = translations;
