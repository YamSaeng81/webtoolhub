import React, { useState, useRef, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import { audioBufferToWav, formatTime } from '../../utils/audioServices';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors, Play, Pause, Music, Clock } from 'lucide-react';

export const AudioCutterPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 5개 국어 (KO, EN, ES, ZH, JA) i18n 레이블 딕셔너리 ⭐
  const labels = {
    ko: { selectTitle: '자르고 싶은 오디오(MP3, WAV, OGG) 파일을 선택하세요', totalTime: '전체 오디오 길이:', startLabel: '시작 시간:', endLabel: '종료 시간:', durationLabel: '잘라낼 구간 길이:', previewBtn: '선택 구간 미리듣기', pauseBtn: '미리듣기 정지', cutBtn: '오디오 구간 잘라내기 & 다운로드', doneTitle: '오디오 구간 자르기 완료!' },
    en: { selectTitle: 'Select audio file (MP3, WAV, OGG) to cut', totalTime: 'Total Audio Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Duration:', previewBtn: 'Preview Selected Range', pauseBtn: 'Pause Preview', cutBtn: 'Cut Selected Segment & Download', doneTitle: 'Audio Trimming Completed!' },
    es: { selectTitle: 'Seleccione archivo de audio para recortar', totalTime: 'Duración total del audio:', startLabel: 'Tiempo de inicio:', endLabel: 'Tiempo de fin:', durationLabel: 'Duración seleccionada:', previewBtn: 'Escuchar fragmento seleccionado', pauseBtn: 'Pausar vista previa', cutBtn: 'Recortar segmento y descargar', doneTitle: '¡Recorte de audio completado!' },
    zh: { selectTitle: '选择要剪辑的音频文件 (MP3, WAV, OGG)', totalTime: '音频总时长：', startLabel: '起始时间：', endLabel: '结束时间：', durationLabel: '选中片段时长：', previewBtn: '预览选定片段', pauseBtn: '暂停预览', cutBtn: '剪辑选定片段并下载', doneTitle: '音频剪辑完成！' },
    ja: { selectTitle: 'カットする音声ファイルを選択してください', totalTime: '全体再生時間:', startLabel: '開始時間:', endLabel: '終了時間:', durationLabel: '選択区間の長さ:', previewBtn: '選択区間をプレビュー再生', pauseBtn: 'プレビュー一時停止', cutBtn: '選択区間をカットしてダウンロード', doneTitle: '音声トリミング完了！' },
  }[language] || { selectTitle: 'Select audio file (MP3, WAV, OGG) to cut', totalTime: 'Total Audio Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Duration:', previewBtn: 'Preview Selected Range', pauseBtn: 'Pause Preview', cutBtn: 'Cut Selected Segment & Download', doneTitle: 'Audio Trimming Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('audio/')) {
      alert('오디오 파일만 업로드가 가능합니다.');
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setAudioUrl(url);

    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const dur = Math.round(tempAudio.duration);
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(30, dur));
    };
  };

  // 선택 구간 미리듣기 조종 루프 ⭐
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= endTime) {
        audio.pause();
        setIsPlayingPreview(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [endTime]);

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.currentTime = startTime;
      audio.play();
      setIsPlayingPreview(true);
    }
  };

  const handleCut = async () => {
    if (!file) return;

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    }

    setIsProcessing(true);
    setProgress(20);
    trackToolUsage('audio-cutter', '오디오 구간 자르기');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const startOffset = Math.floor(startTime * sampleRate);
      const endOffset = Math.floor(endTime * sampleRate);
      const frameCount = Math.max(1, endOffset - startOffset);

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
      // WAV PCM 인코딩
      const wavBlob = audioBufferToWav(trimmedBuffer);
      const url = URL.createObjectURL(wavBlob);

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
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setFile(null);
    setAudioUrl(null);
    setResultUrl(null);
    setProgress(0);
    setIsPlayingPreview(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="audio-cutter"
        title="오디오 / MP3 구간 자르기 (Audio Trimmer)"
        description="전체 오디오 길이를 확인하며 원하는 시작/종료 시간 구간을 실시간으로 미리 들어보고 정확히 잘라내어 저장합니다."
      />

      <AdBanner slotId="cutter-top" />

      {/* 실시간 오디오 미디어 엘리먼트 (미리듣기 컨트롤용) */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" style={{ display: 'none' }} />}

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>잘라낸 구간: {formatTime(startTime)} ~ {formatTime(endTime)} ({endTime - startTime}초)</p>
          </div>

          <audio controls src={resultUrl} style={{ width: '100%', maxWidth: '500px', marginTop: '0.5rem' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Trimmed_${file.name.replace(/\.[^/.]+$/, '')}.wav`} className="btn-primary">
              <Download size={18} /> {t.download} Trimmed Audio
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} color="var(--accent-primary)" /> {labels.totalTime} <strong style={{ color: 'var(--text-main)' }}>{formatTime(duration)} ({duration}초)</strong>
              </p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {/* 시작 시간 / 종료 시간 선택 및 구간 길이 표시 ⭐ */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{labels.durationLabel}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatTime(startTime)} ~ {formatTime(endTime)} ({Math.max(0, endTime - startTime)}초)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {/* 시작 시간 컨트롤 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{labels.startLabel}</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{formatTime(startTime)} ({startTime}초)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 1)}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* 종료 시간 컨트롤 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{labels.endLabel}</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{formatTime(endTime)} ({endTime}초)</span>
                </div>
                <input
                  type="range"
                  min={startTime + 1}
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* ▶️ 선택 구간 미리듣기 버튼 ⭐ */}
            <button
              onClick={togglePreview}
              className="btn-secondary"
              style={{
                alignSelf: 'center',
                padding: '0.65rem 1.5rem',
                fontSize: '0.95rem',
                background: isPlayingPreview ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: isPlayingPreview ? '#ef4444' : 'var(--accent-primary)',
                border: isPlayingPreview ? '1px solid #ef4444' : '1px solid var(--accent-primary)',
              }}
            >
              {isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}
              {isPlayingPreview ? labels.pauseBtn : labels.previewBtn}
            </button>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleCut}
            disabled={isProcessing || endTime <= startTime}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Scissors size={18} /> {isProcessing ? t.processing : labels.cutBtn}
          </button>
        </div>
      )}

      <AdBanner slotId="cutter-bottom" />
    </div>
  );
};
