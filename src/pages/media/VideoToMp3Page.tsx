import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Music } from 'lucide-react';

export const VideoToMp3Page: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '음원(MP3)을 추출할 동영상(MP4, AVI, MOV)을 선택하세요', btn: '동영상에서 MP3 음원 추출 시작', done: 'MP3 오디오 추출 완료!' },
    en: { selectTitle: 'Select video file (MP4, AVI, MOV) to extract MP3', btn: 'Start Extracting MP3 Audio', done: 'MP3 Extraction Completed!' },
    es: { selectTitle: 'Seleccione video para extraer MP3', btn: 'Iniciar Extracción de Audio MP3', done: '¡Extracción MP3 Completada!' },
    zh: { selectTitle: '选择要提取 MP3 音频的视频文件', btn: '开始提取 MP3 音频', done: 'MP3 音频提取完成！' },
    ja: { selectTitle: '音声を抽出する動画ファイルを選択してください', btn: '動画からMP3音声抽出を開始', done: 'MP3音声抽出完了！' },
  }[language] || { selectTitle: 'Select video file (MP4, AVI, MOV) to extract MP3', btn: 'Start Extracting MP3 Audio', done: 'MP3 Extraction Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('video/')) return;
    setFile(selected);
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(20);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setProgress(80);

      const numOfChan = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChan * 2;
      const buffer = new ArrayBuffer(length);
      const view = new DataView(buffer);
      let channels = [], sample, offset = 0, pos = 0;

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      while (pos < audioBuffer.length) {
        for (let i = 0; i < numOfChan; i++) {
          sample = Math.max(-1, Math.min(1, channels[i][pos]));
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          view.setInt16(offset, sample, true);
          offset += 2;
        }
        pos++;
      }

      const blob = new Blob([view], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Extract MP3 failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="video-to-mp3"
        title="동영상에서 MP3 추출"
        description="MP4, AVI, MOV 등 동영상 파일에서 오디오 음원(MP3)만 고음질로 즉시 추출합니다."
      />

      <AdBanner slotId="video2mp3-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>
          <audio controls src={resultUrl} style={{ width: '100%', maxWidth: '500px' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`${file.name.split('.')[0]}.mp3`} className="btn-primary">
              <Download size={18} /> {t.download} .MP3
            </a>
            <button onClick={handleReset} className="btn-secondary">
              <RefreshCw size={18} /> {t.reset}
            </button>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept="video/*"
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

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleExtract}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Music size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="video2mp3-bottom" />
    </div>
  );
};
