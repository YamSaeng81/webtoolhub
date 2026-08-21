import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { protectPdf, unlockPdf } from '../../utils/pdfServices';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Lock, Unlock, ShieldCheck, KeyRound } from 'lucide-react';

export const PdfProtectPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '암호를 설정하거나 해제할 PDF 파일을 선택하세요', passProtectLabel: 'PDF 열람 비밀번호 설정:', passUnlockLabel: '기존 PDF 암호 입력:', passProtectPlaceholder: '열람 시 필요한 비밀번호 입력', passUnlockPlaceholder: '해제할 올바른 비밀번호 입력', btnProtect: 'PDF 암호 설정 적용하기', btnUnlock: 'PDF 암호 해제하기', doneProtect: 'PDF 암호 설정 완료!', doneUnlock: 'PDF 암호 해제 완료!' },
    en: { selectTitle: 'Select PDF file to protect or unlock', passProtectLabel: 'Set Open Password:', passUnlockLabel: 'Enter Existing Password:', passProtectPlaceholder: 'Enter password required to open', passUnlockPlaceholder: 'Enter correct password to unlock', btnProtect: 'Apply Password Protection', btnUnlock: 'Unlock PDF Password', doneProtect: 'PDF Protection Completed!', doneUnlock: 'PDF Unlock Completed!' },
    es: { selectTitle: 'Seleccione archivo PDF para proteger o desbloquear', passProtectLabel: 'Establecer Contraseña:', passUnlockLabel: 'Ingresar Contraseña Existente:', passProtectPlaceholder: 'Ingrese la contraseña requerida', passUnlockPlaceholder: 'Ingrese contraseña correcta para desbloquear', btnProtect: 'Aplicar Protección con Contraseña', btnUnlock: 'Desbloquear PDF', doneProtect: '¡Protección de PDF Completada!', doneUnlock: '¡Desbloqueo de PDF Completado!' },
    zh: { selectTitle: '选择要加密或解密的 PDF 文件', passProtectLabel: '设置打开密码：', passUnlockLabel: '输入现有密码：', passProtectPlaceholder: '输入打开所需的密码', passUnlockPlaceholder: '输入正确的密码以解密', btnProtect: '应用密码保护', btnUnlock: '解密 PDF 密码', doneProtect: 'PDF 加密完成！', doneUnlock: 'PDF 解密完成！' },
    ja: { selectTitle: 'パスワードを設定または解除するPDFファイルを選択してください', passProtectLabel: 'PDF閲覧パスワード設定:', passUnlockLabel: '既存のパスワード入力:', passProtectPlaceholder: '閲覧に必要なパスワードを入力', passUnlockPlaceholder: '解除する正しいパスワードを入力', btnProtect: 'PDFパスワード設定を適用', btnUnlock: 'PDFパスワードを解除', doneProtect: 'PDFパスワード設定完了！', doneUnlock: 'PDFパスワード解除完了！' },
  }[language] || { selectTitle: 'Select PDF file to protect or unlock', passProtectLabel: 'Set Open Password:', passUnlockLabel: 'Enter Existing Password:', passProtectPlaceholder: 'Enter password required to open', passUnlockPlaceholder: 'Enter correct password to unlock', btnProtect: 'Apply Password Protection', btnUnlock: 'Unlock PDF Password', doneProtect: 'PDF Protection Completed!', doneUnlock: 'PDF Unlock Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.includes('pdf')) return;
    setFile(selected);
    setResultUrl(null);
  };

  const handleProcess = async () => {
    if (!file || !password.trim()) {
      alert(mode === 'protect' ? labels.passProtectPlaceholder : labels.passUnlockPlaceholder);
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('pdf-protect', mode === 'protect' ? 'PDF 암호 설정' : 'PDF 암호 해제');

    try {
      const buffer = await file.arrayBuffer();
      setProgress(60);

      let processedBytes: Uint8Array;
      if (mode === 'protect') {
        processedBytes = await protectPdf(buffer, password.trim());
      } else {
        processedBytes = await unlockPdf(buffer, password.trim());
      }

      const blob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
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
        title="PDF 암호 설정 & 해제 (Protect & Unlock)"
        description="PDF 문서에 보안 열람 암호를 설정하거나, 기존 암호를 알고 있는 PDF의 암호를 완전히 제거(Unlock)하여 무암호 파일로 다운로드합니다."
      />

      <AdBanner slotId="protect-top" />

      {/* 모드 선택 탭 (암호 설정 vs 암호 해제) ⭐ */}
      <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => { setMode('protect'); handleReset(); }}
          className="btn-secondary"
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '0.75rem',
            border: mode === 'protect' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: mode === 'protect' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
            color: mode === 'protect' ? 'var(--accent-primary)' : 'var(--text-main)',
            fontWeight: mode === 'protect' ? 700 : 500,
          }}
        >
          <Lock size={18} /> 🔒 PDF 암호 설정 (Protect)
        </button>

        <button
          onClick={() => { setMode('unlock'); handleReset(); }}
          className="btn-secondary"
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '0.75rem',
            border: mode === 'unlock' ? '2px solid #10b981' : '1px solid var(--border-color)',
            background: mode === 'unlock' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
            color: mode === 'unlock' ? '#10b981' : 'var(--text-main)',
            fontWeight: mode === 'unlock' ? 700 : 500,
          }}
        >
          <Unlock size={18} /> 🔓 PDF 암호 해제 (Unlock)
        </button>
      </div>

      {resultUrl ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: mode === 'protect' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: mode === 'protect' ? 'var(--accent-primary)' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {mode === 'protect' ? labels.doneProtect : labels.doneUnlock}
          </h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a
              href={resultUrl}
              download={mode === 'protect' ? 'WebToolHub_Protected.pdf' : 'WebToolHub_Unlocked.pdf'}
              className="btn-primary"
            >
              <Download size={18} /> {t.download} {mode === 'protect' ? 'Protected PDF' : 'Unlocked PDF'}
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
            <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <KeyRound size={16} color="var(--accent-primary)" />
              {mode === 'protect' ? labels.passProtectLabel : labels.passUnlockLabel}
            </label>
            <input
              type="password"
              placeholder={mode === 'protect' ? labels.passProtectPlaceholder : labels.passUnlockPlaceholder}
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
            onClick={handleProcess}
            disabled={isProcessing || !password.trim()}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1.05rem',
              background: mode === 'unlock' ? '#10b981' : undefined,
            }}
          >
            {mode === 'protect' ? <Lock size={18} /> : <Unlock size={18} />}
            {isProcessing ? t.processing : mode === 'protect' ? labels.btnProtect : labels.btnUnlock}
          </button>
        </div>
      )}

      <AdBanner slotId="protect-bottom" />

      <ToolGuideSection
        toolId="pdf-protect"
        toolTitle="무료 PDF 암호 설정 & 잠금 해제 (PDF Protect & Unlock)"
        categoryName="PDF 도구"
      />
    </div>
  );
};

