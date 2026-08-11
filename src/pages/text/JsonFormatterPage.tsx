import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { formatJson } from '../../utils/textServices';
import { useLanguage } from '../../context/LanguageContext';
import { Copy, Trash2, Check, Code } from 'lucide-react';

export const JsonFormatterPage: React.FC = () => {
  const { language } = useLanguage();
  const [inputJson, setInputJson] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const labels = {
    ko: { placeholder: '이곳에 검증 및 정렬할 JSON 텍스트를 입력하세요...', formatBtn: 'JSON 2스페이스 정렬', minifyBtn: 'JSON 한줄 압축', copyBtn: '결과 복사', clearBtn: '초기화' },
    en: { placeholder: 'Type or paste JSON text here to format or validate...', formatBtn: 'Pretty Print (2 Spaces)', minifyBtn: 'Minify JSON', copyBtn: 'Copy Result', clearBtn: 'Clear' },
    es: { placeholder: 'Ingrese texto JSON aquí para dar formato o validar...', formatBtn: 'Formatear (2 espacios)', minifyBtn: 'Minificar JSON', copyBtn: 'Copiar Resultado', clearBtn: 'Limpiar' },
    zh: { placeholder: '在此处输入或粘贴要校验格式化的 JSON 文本...', formatBtn: 'JSON 格式化 (2 空格)', minifyBtn: 'JSON 单行压缩', copyBtn: '复制结果', clearBtn: '清空' },
    ja: { placeholder: 'ここに整形・検証するJSONテキストを入力してください...', formatBtn: 'JSON整形 (2スペース)', minifyBtn: 'JSON 1行圧縮 (Minify)', copyBtn: '結果をコピー', clearBtn: 'クリア' },
  }[language] || { placeholder: 'Type or paste JSON text here to format or validate...', formatBtn: 'Pretty Print (2 Spaces)', minifyBtn: 'Minify JSON', copyBtn: 'Copy Result', clearBtn: 'Clear' };

  const handleFormat = (indent: number) => {
    if (!inputJson.trim()) return;
    const result = formatJson(inputJson, indent);
    if (result.isValid) {
      setFormattedJson(result.formatted);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.errorMsg || 'Invalid JSON Syntax');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson || inputJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="json-formatter"
        title="JSON 정렬 및 구문 검증기"
        description="복잡하고 뭉쳐진 JSON 텍스트를 보기 좋게 정렬하고 문법 오류(Syntax Error)를 자동 검출합니다."
      />

      <AdBanner slotId="json-top" />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => handleFormat(2)}>
          <Code size={16} /> {labels.formatBtn}
        </button>
        <button className="btn-secondary" onClick={() => handleFormat(0)}>
          {labels.minifyBtn}
        </button>
        <button className="btn-secondary" onClick={handleCopy}>
          {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          {isCopied ? 'Copied!' : labels.copyBtn}
        </button>
        <button className="btn-secondary" onClick={() => { setInputJson(''); setFormattedJson(''); setErrorMessage(null); }} style={{ color: '#ef4444' }}>
          <Trash2 size={16} /> {labels.clearBtn}
        </button>
      </div>

      {errorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
          ⚠️ Syntax Error: {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Input JSON:</span>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder={labels.placeholder}
            rows={14}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Formatted JSON Output:</span>
          <textarea
            value={formattedJson}
            readOnly
            placeholder="Formatted result will appear here..."
            rows={14}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>
      </div>

      <AdBanner slotId="json-bottom" />
    </div>
  );
};
