import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import { Copy, Check, RotateCcw, Sparkles } from 'lucide-react';
import * as Diff from 'diff';

export const TextDiffPage: React.FC = () => {
  const { language } = useLanguage();
  const [text1, setText1] = useState<string>(
    'WebToolHub는 PDF, 이미지, 미디어, 텍스트 도구를 제공하는 무료 웹 서비스입니다.'
  );
  const [text2, setText2] = useState<string>(
    'WebToolHub는 PDF, 이미지, 동영상, 텍스트 도구를 제공하는 프리미엄 무료 웹 서비스입니다.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const labels = {
    ko: {
      originalTitle: '원본 텍스트 (Original Text)',
      modifiedTitle: '비교 텍스트 (Modified Text)',
      placeholder1: '원본 텍스트를 입력하세요...',
      placeholder2: '비교할 텍스트를 입력하세요...',
      sampleBtn: '샘플 문장 넣기',
      clearBtn: '초기화',
      copyResult: '결과 복사',
      copiedText: '복사 완료!',
      diffResultTitle: '📌 핀포인트 텍스트 차이점 비교 (Differences)',
      addedLegend: '추가됨 (Added)',
      removedLegend: '삭제됨 (Removed)',
      charCount: '글자수',
      noSpaceCharCount: '공백제외',
      wordCount: '단어수',
      lineCount: '줄수',
      totalDiffs: '총 차이점 수:',
    },
    en: {
      originalTitle: 'Original Text',
      modifiedTitle: 'Modified Text',
      placeholder1: 'Enter original text...',
      placeholder2: 'Enter text to compare...',
      sampleBtn: 'Load Sample',
      clearBtn: 'Clear',
      copyResult: 'Copy Result',
      copiedText: 'Copied!',
      diffResultTitle: '📌 Pinpoint Text Differences',
      addedLegend: 'Added',
      removedLegend: 'Removed',
      charCount: 'Chars',
      noSpaceCharCount: 'No Space',
      wordCount: 'Words',
      lineCount: 'Lines',
      totalDiffs: 'Total Diffs:',
    },
    es: {
      originalTitle: 'Texto original',
      modifiedTitle: 'Texto modificado',
      placeholder1: 'Ingrese texto original...',
      placeholder2: 'Ingrese texto para comparar...',
      sampleBtn: 'Cargar muestra',
      clearBtn: 'Limpiar',
      copyResult: 'Copiar resultado',
      copiedText: '¡Copiado!',
      diffResultTitle: '📌 Diferencias de texto precisas',
      addedLegend: 'Agregado',
      removedLegend: 'Eliminado',
      charCount: 'Caracteres',
      noSpaceCharCount: 'Sin espacios',
      wordCount: 'Palabras',
      lineCount: 'Líneas',
      totalDiffs: 'Diferencias totales:',
    },
    zh: {
      originalTitle: '原始文本 (Original)',
      modifiedTitle: '对比文本 (Modified)',
      placeholder1: '请输入原始文本...',
      placeholder2: '请输入对比文本...',
      sampleBtn: '加载示例',
      clearBtn: '清空',
      copyResult: '复制结果',
      copiedText: '已复制！',
      diffResultTitle: '📌 精确单字/单词文本差异对比',
      addedLegend: '已添加 (Added)',
      removedLegend: '已删除 (Removed)',
      charCount: '字符数',
      noSpaceCharCount: '不含空格',
      wordCount: '单词数',
      lineCount: '行数',
      totalDiffs: '总差异数：',
    },
    ja: {
      originalTitle: '原文テキスト (Original)',
      modifiedTitle: '比較テキスト (Modified)',
      placeholder1: '原文テキストを入力...',
      placeholder2: '比較するテキストを入力...',
      sampleBtn: 'サンプル読み込み',
      clearBtn: 'クリア',
      copyResult: '結果コピー',
      copiedText: 'コピー完了！',
      diffResultTitle: '📌 高精度テキスト差分比較 (Diff)',
      addedLegend: '追加部分',
      removedLegend: '削除部分',
      charCount: '文字数',
      noSpaceCharCount: '空白除外',
      wordCount: '単語数',
      lineCount: '行数',
      totalDiffs: '総差分数:',
    },
  }[language] || {
    originalTitle: 'Original Text',
    modifiedTitle: 'Modified Text',
    placeholder1: 'Enter original text...',
    placeholder2: 'Enter text to compare...',
    sampleBtn: 'Load Sample',
    clearBtn: 'Clear',
    copyResult: 'Copy Result',
    copiedText: 'Copied!',
    diffResultTitle: '📌 Pinpoint Text Differences',
    addedLegend: 'Added',
    removedLegend: 'Removed',
    charCount: 'Chars',
    noSpaceCharCount: 'No Space',
    wordCount: 'Words',
    lineCount: 'Lines',
    totalDiffs: 'Total Diffs:',
  };

  /**
   * 텍스트 메트릭스 통계 계산 ⭐
   */
  const getTextStats = (txt: string) => {
    const chars = txt.length;
    const noSpace = txt.replace(/\s/g, '').length;
    const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
    const lines = txt ? txt.split('\n').length : 0;
    return { chars, noSpace, words, lines };
  };

  const stats1 = getTextStats(text1);
  const stats2 = getTextStats(text2);

  /**
   * 핀포인트 1글자/1단어 정밀 Diff 연산 ⭐
   */
  const diffParts = Diff.diffWordsWithSpace(text1, text2);
  const diffCount = diffParts.filter((part) => part.added || part.removed).length;

  const handleLoadSample = () => {
    setText1('WebToolHub는 PDF, 이미지, 미디어, 텍스트 도구를 제공하는 무료 웹 서비스입니다.');
    setText2('WebToolHub는 PDF, 이미지, 동영상, 텍스트 도구를 제공하는 프리미엄 무료 웹 서비스입니다.');
  };

  const handleClear = () => {
    setText1('');
    setText2('');
  };

  const handleCopyDiffResult = async () => {
    const resultText = diffParts
      .map((part) => {
        if (part.added) return `[+ ${part.value}]`;
        if (part.removed) return `[- ${part.value}]`;
        return part.value;
      })
      .join('');

    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolUsage('text-diff', '텍스트 비교 결과 복사');
    } catch (e) {
      alert('Copy failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="text-diff"
        title="텍스트 비교 (Text Diff Checker)"
        description="두 문장에서 틀린 1글자/1단어만 핀포인트로 정확히 찾아내어 색상으로 비교하고, 실시간 글자수·단어수를 세어줍니다."
      />

      <AdBanner slotId="textdiff-top" />

      {/* 컨트롤 버튼 헤더 */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button onClick={handleLoadSample} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Sparkles size={15} /> {labels.sampleBtn}
        </button>
        <button onClick={handleClear} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <RotateCcw size={15} /> {labels.clearBtn}
        </button>
      </div>

      {/* 2열 원본 & 비교 텍스트 입력창 (글자수 카운터 탑재 ⭐) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* 원본 텍스트 창 */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{labels.originalTitle}</h3>
            {/* 글자수 메트릭스 뱃지 ⭐ */}
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem' }}>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.charCount}: <strong>{stats1.chars.toLocaleString()}</strong>자
              </span>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.noSpaceCharCount}: <strong>{stats1.noSpace.toLocaleString()}</strong>자
              </span>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.wordCount}: <strong>{stats1.words.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder={labels.placeholder1}
            rows={8}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>

        {/* 비교 텍스트 창 */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#10b981' }}>{labels.modifiedTitle}</h3>
            {/* 글자수 메트릭스 뱃지 ⭐ */}
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem' }}>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.charCount}: <strong>{stats2.chars.toLocaleString()}</strong>자
              </span>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.noSpaceCharCount}: <strong>{stats2.noSpace.toLocaleString()}</strong>자
              </span>
              <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {labels.wordCount}: <strong>{stats2.words.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder={labels.placeholder2}
            rows={8}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      {/* 📌 정밀 핀포인트 텍스트 Diff 결과 패널 ⭐ */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{labels.diffResultTitle}</h3>
            <span style={{ fontSize: '0.82rem', padding: '0.25rem 0.6rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {labels.totalDiffs} {diffCount}개
            </span>
          </div>

          {/* 범례 (Legend) */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', borderRadius: '3px' }}></span>
              <span>{labels.removedLegend}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', borderRadius: '3px' }}></span>
              <span>{labels.addedLegend}</span>
            </div>

            <button onClick={handleCopyDiffResult} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? labels.copiedText : labels.copyResult}
            </button>
          </div>
        </div>

        {/* 핀포인트 1글자/1단어 강조 Diff 렌더링 박스 ⭐ */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.95rem',
            lineHeight: '1.8',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '120px',
          }}
        >
          {diffParts.map((part, index) => {
            if (part.added) {
              return (
                <mark
                  key={index}
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    borderBottom: '2px solid #10b981',
                    padding: '0.15rem 0.25rem',
                    margin: '0 1px',
                    borderRadius: '3px',
                    fontWeight: 700,
                  }}
                >
                  {part.value}
                </mark>
              );
            }
            if (part.removed) {
              return (
                <del
                  key={index}
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    textDecoration: 'line-through',
                    padding: '0.15rem 0.25rem',
                    margin: '0 1px',
                    borderRadius: '3px',
                    fontWeight: 700,
                  }}
                >
                  {part.value}
                </del>
              );
            }
            return <span key={index}>{part.value}</span>;
          })}
        </div>
      </div>

      <AdBanner slotId="textdiff-bottom" />

      <ToolGuideSection
        toolId="text-diff"
        toolTitle="무료 텍스트 비교 및 차이점 분석기 (Text Diff Checker)"
        categoryName="텍스트 도구"
      />
    </div>
  );
};

