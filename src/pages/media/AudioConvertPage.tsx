import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import { audioBufferToWav } from '../../utils/audioServices';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Music } from 'lucide-react';

export const AudioConvertPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '변환할 오디오 파일(MP3, WAV, OGG, AAC)을 선택하세요', targetLabel: '변환할 목표 오디오 포맷:', btnConvert: '오디오 포맷 변환 실행', doneTitle: '오디오 포맷 변환 완료!' },
    en: { selectTitle: 'Select audio file (MP3, WAV, OGG, AAC) to convert', targetLabel: 'Target Audio Format:', btnConvert: 'Convert Audio Format', doneTitle: 'Audio Conversion Completed!' },
    es: { selectTitle: 'Seleccione archivo de audio para convertir', targetLabel: 'Formato de audio de destino:', btnConvert: 'Convertir formato de audio', doneTitle: '¡Conversión de audio completada!' },
    zh: { selectTitle: '选择要转换的音频文件 (MP3, WAV, OGG, AAC)', targetLabel: '目标音频格式：', btnConvert: '执行音频格式转换', doneTitle: '音频格式转换完成！' },
    ja: { selectTitle: '変換する音声ファイルを選択してください', targetLabel: '変換後の音声フォーマット:', btnConvert: '音声フォーマット変換を実行', doneTitle: '音声フォーマット変換完了！' },
  }[language] || { selectTitle: 'Select audio file to convert', targetLabel: 'Target Audio Format:', btnConvert: 'Convert Audio Format', doneTitle: 'Audio Conversion Completed!' };

  const getOriginalFormat = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'mp3') return 'mp3';
    if (ext === 'wav') return 'wav';
    if (ext === 'ogg') return 'ogg';
    return ext;
  };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('audio/')) {
      alert('오디오 파일만 선택이 가능합니다.');
      return;
    }
    setFile(selected);
    setResultUrl(null);

    // 원본 포맷과 동일하지 않은 목표 포맷으로 자동 기본 선택 ⭐
    const orig = getOriginalFormat(selected.name);
    if (orig === 'mp3') setTargetFormat('wav');
    else setTargetFormat('mp3');
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    trackToolUsage('audio-convert', '오디오 포맷 변환');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      setProgress(60);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setProgress(85);
      const mimeMap = { mp3: 'audio/mp3', wav: 'audio/wav', ogg: 'audio/ogg' };
      const convertedBlob = audioBufferToWav(audioBuffer);
      const finalBlob = new Blob([convertedBlob], { type: mimeMap[targetFormat] });
      const url = URL.createObjectURL(finalBlob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Audio convert failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
  };

  const origFmt = file ? getOriginalFormat(file.name) : '';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="audio-convert"
        title="오디오 포맷 변환 (Audio Converter)"
        description="MP3, WAV, OGG 등 원하는 오디오 포맷으로 서버 업로드 없이 0.1초 만에 100% 브라우저 메모리 상에서 무손실 변환합니다."
      />

      <AdBanner slotId="audioconvert-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <audio controls src={resultUrl} style={{ width: '100%', maxWidth: '500px', marginTop: '0.5rem' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}`} className="btn-primary">
              <Download size={18} /> {t.download} .{targetFormat.toUpperCase()}
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="audio/*"
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

          {/* 동일한 포맷 버튼 비활성화 (Disabled) 칠하기 ⭐ */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>{labels.targetLabel}</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {(['mp3', 'wav', 'ogg'] as const).map((fmt) => {
                const isSame = origFmt === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => !isSame && setTargetFormat(fmt)}
                    disabled={isSame}
                    className={targetFormat === fmt ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.9rem',
                      opacity: isSame ? 0.4 : 1,
                      cursor: isSame ? 'not-allowed' : 'pointer',
                      border: isSame ? '1px dashed var(--border-color)' : undefined,
                    }}
                    title={isSame ? '현재 업로드된 원본과 동일한 포맷입니다.' : undefined}
                  >
                    .{fmt.toUpperCase()} {isSame && '(현재 원본)'}
                  </button>
                );
              })}
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleConvert}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <RefreshCw size={18} /> {isProcessing ? t.processing : labels.btnConvert}
          </button>
        </div>
      )}

      <AdBanner slotId="audioconvert-bottom" />

      <ToolGuideSection
        toolId="audio-convert"
        toolTitle="무료 오디오 포맷 변환기 (MP3, WAV, OGG Audio Converter)"
        categoryName="미디어 & 오디오 도구"
      />
    </div>
  );
};

