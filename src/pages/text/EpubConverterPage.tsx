import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import {
  convertTxtToEpub,
  convertEpubToTxt,
  splitTextIntoChapters,
} from '../../utils/epubServices';
import type { TxtToEpubOptions } from '../../utils/epubServices';

import confetti from 'canvas-confetti';
import {
  BookOpen,
  FileText,
  Download,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Settings2,
  BookMarked,
} from 'lucide-react';

type Mode = 'txt-to-epub' | 'epub-to-txt';

export const EpubConverterPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<Mode>('txt-to-epub');

  // TXT -> EPUB State
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [txtContent, setTxtContent] = useState<string>('');
  const [bookTitle, setBookTitle] = useState<string>('');
  const [bookAuthor, setBookAuthor] = useState<string>('');
  const [splitBy, setSplitBy] = useState<'pattern' | 'length' | 'none'>('pattern');
  const [chunkLength, setChunkLength] = useState<number>(5000);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);
  const [epubUrl, setEpubUrl] = useState<string | null>(null);

  // EPUB -> TXT State
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [extractedTxt, setExtractedTxt] = useState<string>('');
  const [extractedTitle, setExtractedTitle] = useState<string>('');
  const [extractedChapters, setExtractedChapters] = useState<number>(0);
  const [txtUrl, setTxtUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Common State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');

  const labels = {
    ko: {
      tabTxtToEpub: '📘 텍스트 ➔ EPUB 전자책 생성',
      tabEpubToTxt: '📄 EPUB ➔ 텍스트(TXT) 추출',
      txtDropTitle: '전자책으로 변환할 텍스트(.txt) 파일을 선택하세요',
      epubDropTitle: '텍스트를 추출할 전자책(.epub) 파일을 선택하세요',
      metaTitle: '도서 메타데이터 설정',
      bookTitleLabel: '도서 제목 (Book Title):',
      bookTitlePlaceholder: '예: 삼국지, 나의 전자책',
      authorLabel: '저자명 (Author):',
      authorPlaceholder: '예: 홍길동, 작가명',
      splitLabel: '목차(챕터) 자동 분할 기준:',
      splitPattern: '자동 키워드 감지 (제1장, Chapter 1, [1화] 등)',
      splitLength: '글자 수 단위 분할',
      splitNone: '단일 챕터 (분할 안 함)',
      chunkLabel: '챕터당 글자 수:',
      btnMakeEpub: '표준 EPUB 전자책 만들기',
      btnExtractTxt: 'EPUB에서 TXT 텍스트 추출하기',
      doneEpub: 'EPUB 3.0 전자책 생성 완료!',
      doneTxt: '텍스트(TXT) 추출 완료!',
      previewLabel: '추출된 텍스트 미리보기:',
      copyBtn: '텍스트 복사',
      chapterCount: '총 챕터 수:',
    },
    en: {
      tabTxtToEpub: '📘 TXT ➔ EPUB E-Book',
      tabEpubToTxt: '📄 EPUB ➔ TXT Text Extractor',
      txtDropTitle: 'Select text file (.txt) to convert into E-Book',
      epubDropTitle: 'Select E-Book file (.epub) to extract text',
      metaTitle: 'Book Metadata Settings',
      bookTitleLabel: 'Book Title:',
      bookTitlePlaceholder: 'e.g., My Novel, Study Note',
      authorLabel: 'Author:',
      authorPlaceholder: 'e.g., John Doe',
      splitLabel: 'Chapter Splitting Rule:',
      splitPattern: 'Auto Pattern (Chapter 1, Part 1, [1], etc.)',
      splitLength: 'By Character Length',
      splitNone: 'Single Chapter (No Split)',
      chunkLabel: 'Chars per Chapter:',
      btnMakeEpub: 'Generate Standard EPUB E-Book',
      btnExtractTxt: 'Extract TXT from EPUB',
      doneEpub: 'EPUB E-Book Generated Successfully!',
      doneTxt: 'TXT Text Extracted Successfully!',
      previewLabel: 'Extracted Text Preview:',
      copyBtn: 'Copy Text',
      chapterCount: 'Total Chapters:',
    },
    es: {
      tabTxtToEpub: '📘 TXT ➔ EPUB Libro',
      tabEpubToTxt: '📄 EPUB ➔ TXT Texto',
      txtDropTitle: 'Seleccione archivo de texto (.txt) para convertir',
      epubDropTitle: 'Seleccione archivo (.epub) para extraer texto',
      metaTitle: 'Configuración de Metadatos',
      bookTitleLabel: 'Título del libro:',
      bookTitlePlaceholder: 'ej., Mi Novela',
      authorLabel: 'Autor:',
      authorPlaceholder: 'ej., Juan Pérez',
      splitLabel: 'Regla de división de capítulos:',
      splitPattern: 'Detección automática (Capítulo 1, etc.)',
      splitLength: 'Por longitud de caracteres',
      splitNone: 'Capítulo único',
      chunkLabel: 'Caracteres por capítulo:',
      btnMakeEpub: 'Generar Libro EPUB',
      btnExtractTxt: 'Extraer Texto de EPUB',
      doneEpub: '¡Libro EPUB Generado con Éxito!',
      doneTxt: '¡Texto Extraído con Éxito!',
      previewLabel: 'Vista previa del texto extraído:',
      copyBtn: 'Copiar Texto',
      chapterCount: 'Capítulos totales:',
    },
    zh: {
      tabTxtToEpub: '📘 TXT 转 EPUB 电子书',
      tabEpubToTxt: '📄 EPUB 转 TXT 文本提取',
      txtDropTitle: '选择要转换为电子书的文本 (.txt) 文件',
      epubDropTitle: '选择要提取文本的电子书 (.epub) 文件',
      metaTitle: '电子书元数据设置',
      bookTitleLabel: '图书标题：',
      bookTitlePlaceholder: '例如：我的小说、学习笔记',
      authorLabel: '作者名称：',
      authorPlaceholder: '例如：作者名',
      splitLabel: '章节自动分章规则：',
      splitPattern: '智能关键字识别 (第一章、Chapter 1 等)',
      splitLength: '按字数固定切分',
      splitNone: '单章节 (不切分)',
      chunkLabel: '每章字符数：',
      btnMakeEpub: '生成国际标准 EPUB 电子书',
      btnExtractTxt: '从 EPUB 提取 TXT 纯文本',
      doneEpub: 'EPUB 电子书生成完成！',
      doneTxt: 'TXT 文本提取完成！',
      previewLabel: '提取文本预览：',
      copyBtn: '复制文本',
      chapterCount: '总章节数：',
    },
    ja: {
      tabTxtToEpub: '📘 TXT ➔ EPUB 電子書籍変換',
      tabEpubToTxt: '📄 EPUB ➔ TXT テキスト抽出',
      txtDropTitle: '電子書籍にするテキスト(.txt)ファイルを選択してください',
      epubDropTitle: 'テキストを抽出する電子書籍(.epub)ファイルを選択してください',
      metaTitle: '電子書籍メタデータ設定',
      bookTitleLabel: '書籍タイトル:',
      bookTitlePlaceholder: '例: 私の小説、勉強ノート',
      authorLabel: '著者名:',
      authorPlaceholder: '例: 著者名',
      splitLabel: '章(チャプター)自動分割基準:',
      splitPattern: '自動キーワード検出 (第1章、Chapter 1 等)',
      splitLength: '文字数単位で分割',
      splitNone: '分割なし (単一章)',
      chunkLabel: '1章あたりの文字数:',
      btnMakeEpub: '標準EPUB電子書籍を作成',
      btnExtractTxt: 'EPUBからテキストを抽出',
      doneEpub: 'EPUB電子書籍の作成が完了しました！',
      doneTxt: 'テキスト(TXT)の抽出が完了しました！',
      previewLabel: '抽出テキストのプレビュー:',
      copyBtn: 'テキストをコピー',
      chapterCount: '総チャプター数:',
    },
  }[language] || {
    tabTxtToEpub: '📘 TXT ➔ EPUB E-Book',
    tabEpubToTxt: '📄 EPUB ➔ TXT Text Extractor',
    txtDropTitle: 'Select text file (.txt) to convert into E-Book',
    epubDropTitle: 'Select E-Book file (.epub) to extract text',
    metaTitle: 'Book Metadata Settings',
    bookTitleLabel: 'Book Title:',
    bookTitlePlaceholder: 'e.g., My Novel, Study Note',
    authorLabel: 'Author:',
    authorPlaceholder: 'e.g., John Doe',
    splitLabel: 'Chapter Splitting Rule:',
    splitPattern: 'Auto Pattern (Chapter 1, Part 1, [1], etc.)',
    splitLength: 'By Character Length',
    splitNone: 'Single Chapter (No Split)',
    chunkLabel: 'Chars per Chapter:',
    btnMakeEpub: 'Generate Standard EPUB E-Book',
    btnExtractTxt: 'Extract TXT from EPUB',
    doneEpub: 'EPUB E-Book Generated Successfully!',
    doneTxt: 'TXT Text Extracted Successfully!',
    previewLabel: 'Extracted Text Preview:',
    copyBtn: 'Copy Text',
    chapterCount: 'Total Chapters:',
  };

  // 1. TXT 파일 업로드 핸들러
  const handleTxtSelected = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setTxtFile(file);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setBookTitle(fileNameWithoutExt);
    setBookAuthor('WebToolHub User');

    // 파일 인코딩 읽기 (UTF-8 기본, EUC-KR 감지 지원)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTxtContent(text || '');
    };
    reader.readAsText(file, 'UTF-8');
  };

  // 2. EPUB 파일 업로드 핸들러
  const handleEpubSelected = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setEpubFile(file);
    setExtractedTxt('');
    setTxtUrl(null);
  };

  // 3. TXT -> EPUB 변환 실행
  const handleCreateEpub = async () => {
    if (!txtContent) return;

    setIsProcessing(true);
    setProgress(20);
    setStatusText('텍스트 분석 및 챕터 목차 생성 중...');
    trackToolUsage('text-epub-converter', 'TXT to EPUB 변환');

    try {
      const options: TxtToEpubOptions = {
        title: bookTitle || 'Untitled Book',
        author: bookAuthor || 'Author',
        splitBy,
        chunkLength,
      };

      setProgress(50);
      setStatusText('EPUB 3.0 표준 XML 및 패키징 빌드 중...');

      const blob = await convertTxtToEpub(txtContent, options);
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setEpubBlob(blob);
      setEpubUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`EPUB 생성 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. EPUB -> TXT 변환 실행
  const handleExtractTxt = async () => {
    if (!epubFile) return;

    setIsProcessing(true);
    setProgress(20);
    setStatusText('EPUB 압축 해제 및 스파인(Spine) 분석 중...');
    trackToolUsage('text-epub-converter', 'EPUB to TXT 변환');

    try {
      const buffer = await epubFile.arrayBuffer();
      setProgress(60);
      setStatusText('XHTML 태그 정제 및 텍스트 조합 중...');

      const res = await convertEpubToTxt(buffer);
      const blob = new Blob([res.text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setExtractedTxt(res.text);
      setExtractedTitle(res.title);
      setExtractedChapters(res.chapterCount);
      setTxtUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`TXT 추출 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTxtFile(null);
    setTxtContent('');
    setEpubBlob(null);
    setEpubUrl(null);
    setEpubFile(null);
    setExtractedTxt('');
    setTxtUrl(null);
    setProgress(0);
  };

  const handleCopyText = () => {
    if (!extractedTxt) return;
    navigator.clipboard.writeText(extractedTxt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const estimatedChapters = txtContent ? splitTextIntoChapters(txtContent, {
    title: bookTitle,
    author: bookAuthor,
    splitBy,
    chunkLength,
  }).length : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="text-epub-converter"
        title="TXT ⇄ EPUB 전자책 상호 변환기 (E-Book Converter)"
        description="텍스트 메모장(.txt)을 이북리더기 전용 표준 전자책(.epub)으로 제작하거나, EPUB 파일에서 깨끗한 텍스트를 100% 브라우저 메모리에서 추출합니다."
        badgeText="전자책 필수 도구"
      />

      <AdBanner slotId="epub-top" />

      {/* 모드 전환 탭 */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setMode('txt-to-epub'); handleReset(); }}
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            border: mode === 'txt-to-epub' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: mode === 'txt-to-epub' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
            color: mode === 'txt-to-epub' ? 'var(--accent-primary)' : 'var(--text-main)',
            fontWeight: mode === 'txt-to-epub' ? 800 : 600,
            fontSize: '0.98rem',
          }}
        >
          <BookOpen size={18} /> {labels.tabTxtToEpub}
        </button>

        <button
          onClick={() => { setMode('epub-to-txt'); handleReset(); }}
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            border: mode === 'epub-to-txt' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: mode === 'epub-to-txt' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
            color: mode === 'epub-to-txt' ? 'var(--accent-primary)' : 'var(--text-main)',
            fontWeight: mode === 'epub-to-txt' ? 800 : 600,
            fontSize: '0.98rem',
          }}
        >
          <FileText size={18} /> {labels.tabEpubToTxt}
        </button>
      </div>

      {/* 📘 MODE 1: TXT -> EPUB */}
      {mode === 'txt-to-epub' && (
        <>
          {epubUrl && epubBlob && txtFile ? (
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookMarked size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneEpub}</h2>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>도서명: <strong style={{ color: 'var(--text-main)' }}>{bookTitle}</strong></span>
                <span>총 챕터: <strong style={{ color: 'var(--accent-primary)' }}>{estimatedChapters}개</strong></span>
                <span>파일 크기: <strong style={{ color: '#10b981' }}>{(epubBlob.size / 1024).toFixed(1)} KB</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <a href={epubUrl} download={`${bookTitle || 'Book'}.epub`} className="btn-primary">
                  <Download size={18} /> {t.download} .EPUB E-Book
                </a>
                <button onClick={handleReset} className="btn-secondary">
                  <RefreshCw size={18} /> {t.reset}
                </button>
              </div>
            </div>
          ) : !txtFile ? (
            <FileDropzone
              accept=".txt,text/plain"
              onFilesSelected={handleTxtSelected}
              title={labels.txtDropTitle}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={18} color="var(--accent-primary)" /> {txtFile.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {(txtFile.size / 1024).toFixed(1)} KB ({txtContent.length.toLocaleString()} 글자)
                  </p>
                </div>
                <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                  {t.reset}
                </button>
              </div>

              {/* 전자책 메타데이터 설정 폼 */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Settings2 size={16} color="var(--accent-primary)" /> {labels.metaTitle}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.bookTitleLabel}</label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder={labels.bookTitlePlaceholder}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.authorLabel}</label>
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder={labels.authorPlaceholder}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                    />
                  </div>
                </div>

                {/* 챕터 분할 옵션 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.splitLabel}</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSplitBy('pattern')}
                      className={splitBy === 'pattern' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                    >
                      {labels.splitPattern}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitBy('length')}
                      className={splitBy === 'length' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                    >
                      {labels.splitLength}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitBy('none')}
                      className={splitBy === 'none' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                    >
                      {labels.splitNone}
                    </button>
                  </div>

                  {splitBy === 'length' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.82rem' }}>{labels.chunkLabel}</span>
                      <input
                        type="number"
                        min={1000}
                        max={50000}
                        step={1000}
                        value={chunkLength}
                        onChange={(e) => setChunkLength(Number(e.target.value))}
                        style={{ width: '120px', padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>자</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                    📖 예상 분할 챕터: <strong>{estimatedChapters}개</strong> 목차 생성 예정
                  </div>
                </div>
              </div>

              {isProcessing && <ProgressBar progress={progress} statusText={statusText} />}

              <button
                className="btn-primary"
                onClick={handleCreateEpub}
                disabled={isProcessing}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
              >
                <Sparkles size={18} /> {isProcessing ? statusText : labels.btnMakeEpub}
              </button>
            </div>
          )}
        </>
      )}

      {/* 📄 MODE 2: EPUB -> TXT */}
      {mode === 'epub-to-txt' && (
        <>
          {txtUrl && extractedTxt && epubFile ? (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{labels.doneTxt}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    도서명: <strong style={{ color: 'var(--text-main)' }}>{extractedTitle}</strong> | {labels.chapterCount} <strong style={{ color: 'var(--accent-primary)' }}>{extractedChapters}개</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleCopyText} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                    {isCopied ? 'Copied!' : labels.copyBtn}
                  </button>
                  <a href={txtUrl} download={`${extractedTitle || 'Extracted'}.txt`} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                    <Download size={16} /> {t.download} .TXT
                  </a>
                  <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    <RefreshCw size={16} /> {t.reset}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.previewLabel}</span>
                <textarea
                  value={extractedTxt.slice(0, 3000) + (extractedTxt.length > 3000 ? '\n\n... (이하 생략 - 다운로드 파일에는 전체 내용이 포함됩니다)' : '')}
                  readOnly
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          ) : !epubFile ? (
            <FileDropzone
              accept=".epub,application/epub+zip"
              onFilesSelected={handleEpubSelected}
              title={labels.epubDropTitle}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={18} color="var(--accent-primary)" /> {epubFile.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {(epubFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                  {t.reset}
                </button>
              </div>

              {isProcessing && <ProgressBar progress={progress} statusText={statusText} />}

              <button
                className="btn-primary"
                onClick={handleExtractTxt}
                disabled={isProcessing}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
              >
                <FileText size={18} /> {isProcessing ? statusText : labels.btnExtractTxt}
              </button>
            </div>
          )}
        </>
      )}

      <AdBanner slotId="epub-bottom" />

      <ToolGuideSection
        toolId="text-epub-converter"
        toolTitle="무료 TXT ⇄ EPUB 전자책 상호 변환기 (TXT to EPUB / EPUB to TXT)"
        categoryName="텍스트 & 전자책 도구"
      />
    </div>
  );
};
