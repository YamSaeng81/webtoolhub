import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { analyzeText } from '../../utils/textServices';
import { useLanguage } from '../../context/LanguageContext';
import { Copy, Trash2, Check } from 'lucide-react';

export const TextCounterPage: React.FC = () => {
  const { language } = useLanguage();
  const [text, setText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const stats = analyzeText(text);

  const labels = {
    ko: { placeholder: '이곳에 글자수를 측정할 텍스트를 입력하거나 붙여넣으세요...', charInclude: '공백 포함 글자수', charExclude: '공백 제외 글자수', bytes: 'UTF-8 용량 (Byte)', words: '단어 수 (Words)', readTime: '예상 읽기 시간', copyBtn: '텍스트 복사', clearBtn: '초기화' },
    en: { placeholder: 'Type or paste text here to count characters...', charInclude: 'Chars (With Spaces)', charExclude: 'Chars (No Spaces)', bytes: 'UTF-8 Size (Bytes)', words: 'Word Count', readTime: 'Est. Reading Time', copyBtn: 'Copy Text', clearBtn: 'Clear' },
    es: { placeholder: 'Escriba o pegue texto aquí para contar caracteres...', charInclude: 'Caracteres (Con espacios)', charExclude: 'Caracteres (Sin espacios)', bytes: 'Tamaño UTF-8 (Bytes)', words: 'Palabras', readTime: 'Tiempo de lectura', copyBtn: 'Copiar Texto', clearBtn: 'Limpiar' },
    zh: { placeholder: '在此处输入或粘贴要统计字数的文本...', charInclude: '含空格字符数', charExclude: '不含空格字符数', bytes: 'UTF-8 容量 (Bytes)', words: '单词数 (Words)', readTime: '预计阅读时间', copyBtn: '复制文本', clearBtn: '清空' },
    ja: { placeholder: 'ここに文字数をカウントするテキストを入力または貼り付けてください...', charInclude: '文字数 (空白含む)', charExclude: '文字数 (空白除く)', bytes: 'UTF-8容量 (Byte)', words: '単語数 (Words)', readTime: '想定読了時間', copyBtn: 'テキストをコピー', clearBtn: 'クリア' },
  }[language] || { placeholder: 'Type or paste text here to count characters...', charInclude: 'Chars (With Spaces)', charExclude: 'Chars (No Spaces)', bytes: 'UTF-8 Size (Bytes)', words: 'Word Count', readTime: 'Est. Reading Time', copyBtn: 'Copy Text', clearBtn: 'Clear' };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="text-counter"
        title="글자수 & 바이트(Byte) 세기"
        description="공백 포함/제외 글자 수, Byte 용량, 단어 수, 예상 읽기 시간을 실시간 계산합니다."
      />

      <AdBanner slotId="counter-top" />

      {/* 실시간 수치 카드 메트릭 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{labels.charInclude}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.charsWithSpace.toLocaleString()}</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{labels.charExclude}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.charsNoSpace.toLocaleString()}</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{labels.bytes}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{stats.byteCount.toLocaleString()} B</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{labels.words}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.wordCount.toLocaleString()}</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{labels.readTime}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>{stats.readingTimeMin} min</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {isCopied ? 'Copied!' : labels.copyBtn}
          </button>
          <button onClick={() => setText('')} className="btn-secondary" style={{ fontSize: '0.8rem', color: '#ef4444' }}>
            <Trash2 size={14} /> {labels.clearBtn}
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.placeholder}
          rows={12}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            lineHeight: '1.6',
            resize: 'vertical',
          }}
        />
      </div>

      <AdBanner slotId="counter-bottom" />

      <ToolGuideSection
        toolId="text-counter"
        toolTitle="무료 글자수 & 바이트(Byte) 실시간 계산기 (Character Counter)"
        categoryName="텍스트 도구"
      />
    </div>
  );
};

