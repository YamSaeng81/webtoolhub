import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { GitCompare } from 'lucide-react';

export const TextDiffPage: React.FC = () => {
  const { language } = useLanguage();
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');

  const labels = {
    ko: { textALabel: '원본 텍스트 (Original Text A):', textBLabel: '비교 텍스트 (Modified Text B):', placeholderA: '원본 문장을 입력하세요...', placeholderB: '수정되거나 변경된 문장을 입력하세요...', diffTitle: '문장 차이(Diff) 비교 결과' },
    en: { textALabel: 'Original Text A:', textBLabel: 'Modified Text B:', placeholderA: 'Enter original text...', placeholderB: 'Enter modified text...', diffTitle: 'Diff Comparison Result' },
    es: { textALabel: 'Texto Original A:', textBLabel: 'Texto Modificado B:', placeholderA: 'Ingrese texto original...', placeholderB: 'Ingrese texto modificado...', diffTitle: 'Resultado de Comparación Diff' },
    zh: { textALabel: '原始文本 A (Original)：', textBLabel: '修改文本 B (Modified)：', placeholderA: '输入原始句子...', placeholderB: '输入修改后的句子...', diffTitle: '文本差异 (Diff) 对比结果' },
    ja: { selectTitle: 'テキスト対照比較', textALabel: '原文テキスト A (Original):', textBLabel: '変更後テキスト B (Modified):', placeholderA: '原文を入力してください...', placeholderB: '変更後の文章を入力してください...', diffTitle: 'テキスト差分 (Diff) 比較結果' },
  }[language] || { textALabel: 'Original Text A:', textBLabel: 'Modified Text B:', placeholderA: 'Enter original text...', placeholderB: 'Enter modified text...', diffTitle: 'Diff Comparison Result' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="text-diff"
        title="텍스트 문장 차이(Diff) 비교"
        description="두 개의 텍스트를 비교하여 변경된 부분(추가된 글자/삭제된 글자)을 색상으로 표시합니다."
      />

      <AdBanner slotId="diff-top" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.textALabel}</span>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder={labels.placeholderA}
            rows={10}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
          />
        </div>

        <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.textBLabel}</span>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder={labels.placeholderB}
            rows={10}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
          />
        </div>
      </div>

      {(textA || textB) && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCompare size={18} color="var(--accent-primary)" /> {labels.diffTitle}
          </h3>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <div><span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.1rem 0.3rem' }}>- {textA || '(Empty A)'}</span></div>
            <div style={{ marginTop: '0.5rem' }}><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.1rem 0.3rem' }}>+ {textB || '(Empty B)'}</span></div>
          </div>
        </div>
      )}

      <AdBanner slotId="diff-bottom" />
    </div>
  );
};
