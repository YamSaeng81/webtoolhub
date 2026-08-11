import React, { useState } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors } from 'lucide-react';

export const AudioCutterPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [duration, setDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const labels = {
    ko: { selectTitle: '자르고 싶은 오디오(MP3, WAV) 파일을 선택하세요', startLabel: '시작 시간 (초):', endLabel: '종료 시간 (초):', btn: '선택 구간 오디오 자르기 실행', done: '오디오 구간 자르기 완료!' },
    en: { selectTitle: 'Select audio file (MP3, WAV) to cut', startLabel: 'Start Time (s):', endLabel: 'End Time (s):', btn: 'Cut Audio Segment', done: 'Audio Trimming Completed!' },
    es: { selectTitle: 'Seleccione archivo de audio para recortar', startLabel: 'Tiempo de Inicio (s):', endLabel: 'Tiempo de Fin (s):', btn: 'Recortar Segmento de Audio', done: '¡Recorte de Audio Completado!' },
    zh: { selectTitle: '选择要剪辑的音频文件 (MP3, WAV)', startLabel: '起始时间 (秒)：', endLabel: '结束时间 (秒)：', btn: '执行音频片段剪辑', done: '音频剪辑完成！' },
    ja: { selectTitle: 'カットする音声ファイルを選択してください', startLabel: '開始時間 (秒):', endLabel: '終了時間 (秒):', btn: '選択区間の音声トリミングを実行', done: '音声トリミング完了！' },
  }[language] || { selectTitle: 'Select audio file (MP3, WAV) to cut', startLabel: 'Start Time (s):', endLabel: 'End Time (s):', btn: 'Cut Audio Segment', done: 'Audio Trimming Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('audio/')) return;
    setFile(selected);

    const audio = new Audio();
    audio.src = URL.createObjectURL(selected);
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration));
      setEndTime(Math.min(30, Math.round(audio.duration)));
    };
  };

  const handleCut = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(40);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const startOffset = Math.floor(startTime * sampleRate);
      const endOffset = Math.floor(endTime * sampleRate);
      const frameCount = endOffset - startOffset;

      const trimmedBuffer = audioCtx.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i).subarray(startOffset, endOffset);
        trimmedBuffer.copyToChannel(channelData, i);
      }

      setProgress(80);

      const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Cut failed: ${err instanceof Error ? err.message : String(err)}`);
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
        toolId="audio-cutter"
        title="오디오 / 음원 구간 자르기"
        description="MP3/WAV 음원 파일에서 원하는 구간을 잘라내어 벨소리나 알람음으로 만듭니다."
      />

      <AdBanner slotId="cutter-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>
          <audio controls src={resultUrl} style={{ width: '100%', maxWidth: '500px' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Trimmed_${file.name}`} className="btn-primary">
              <Download size={18} /> {t.download}
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total {duration} seconds</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.startLabel}</label>
              <input
                type="number"
                min="0"
                max={endTime - 1}
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.endLabel}</label>
              <input
                type="number"
                min={startTime + 1}
                max={duration || 300}
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleCut}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Scissors size={18} /> {isProcessing ? t.processing : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="cutter-bottom" />
    </div>
  );
};
