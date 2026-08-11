import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { protectPdf } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

export const PdfProtectPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '암호를 설정할 PDF 파일을 선택하세요', passLabel: 'PDF 열람 비밀번호 설정:', passPlaceholder: '열람 시 필요한 비밀번호 입력', btn: 'PDF 암호 설정 적용하기', done: 'PDF 암호 설정 완료!' },
    en: { selectTitle: 'Select PDF file to protect', passLabel: 'Set Open Password:', passPlaceholder: 'Enter password required to open', btn: 'Apply Password Protection', done: 'PDF Protection Completed!' },
    es: { selectTitle: 'Seleccione archivo PDF para proteger', passLabel: 'Establecer Contraseña:', passPlaceholder: 'Ingrese la contraseña requerida', btn: 'Aplicar Protección con Contraseña', done: '¡Protección de PDF Completada!' },
    zh: { selectTitle: '选择要加密的 PDF 文件', passLabel: '设置打开密码：', passPlaceholder: '输入打开所需的密码', btn: '应用密码保护', done: 'PDF 加密完成！' },
    ja: { selectTitle: 'パスワードを設定するPDFファイルを選択してください', passLabel: 'PDF閲覧パスワード設定:', passPlaceholder: '閲覧に必要なパスワードを入力', btn: 'PDFパスワード設定を適用', done: 'PDFパスワード設定完了！' },
  }[language] || { selectTitle: 'Select PDF file to protect', passLabel: 'Set Open Password:', passPlaceholder: 'Enter password required to open', btn: 'Apply Password Protection', done: 'PDF Protection Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) return;
    setFile(selected);
  };

  const handleProtect = async () => {
    if (!file || !password.trim()) {
      alert(labels.passPlaceholder);
      return;
    }

    setIsProcessing(true);
    setProgress(30);

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const protectedBytes = await protectPdf(buffer, password.trim());
      const blob = new Blob([protectedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="pdf-protect"
        title="PDF 암호 설정"
        description="내 소중한 PDF 문서에 열람 암호를 설정하여 보안을 강화합니다."
      />

      <AdBanner slotId="protect-top" />

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download="WebToolHub_Protected.pdf" className="btn-primary">
              <Download size={18} /> {t.download} Protected PDF
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          title={labels.selectTitle}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>{labels.passLabel}</label>
            <input
              type="password"
              placeholder={labels.passPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleProtect}
            disabled={isProcessing || !password.trim()}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Lock size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="protect-bottom" />
    </div>
  );
};
