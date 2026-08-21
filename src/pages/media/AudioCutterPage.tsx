import React, { useState, useRef, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import { audioBufferToWav, formatTime } from '../../utils/audioServices';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors, Play, Pause, Music, Clock, Plus, Minus } from 'lucide-react';

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

  const labels = {
    ko: { selectTitle: '자르고 싶은 오디오(MP3, WAV, OGG) 파일을 선택하세요', totalTime: '전체 오디오 길이:', startLabel: '시작 시간:', endLabel: '종료 시간:', durationLabel: '잘라낼 선택 구간:', previewBtn: '선택 구간 미리듣기', pauseBtn: '미리듣기 정지', cutBtn: '오디오 구간 잘라내기 & 다운로드', doneTitle: '오디오 구간 자르기 완료!' },
    en: { selectTitle: 'Select audio file (MP3, WAV, OGG) to cut', totalTime: 'Total Audio Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Range:', previewBtn: 'Preview Selected Range', pauseBtn: 'Pause Preview', cutBtn: 'Cut Selected Segment & Download', doneTitle: 'Audio Trimming Completed!' },
    es: { selectTitle: 'Seleccione archivo de audio para recortar', totalTime: 'Duración total del audio:', startLabel: 'Inicio:', endLabel: 'Fin:', durationLabel: 'Segmento seleccionado:', previewBtn: 'Escuchar fragmento seleccionado', pauseBtn: 'Pausar vista previa', cutBtn: 'Recortar segmento y descargar', doneTitle: '¡Recorte de audio completado!' },
    zh: { selectTitle: '选择要剪辑的音频文件 (MP3, WAV, OGG)', totalTime: '音频总时长：', startLabel: '起始时间：', endLabel: '结束时间：', durationLabel: '选中片段：', previewBtn: '预览选定片段', pauseBtn: '暂停预览', cutBtn: '剪辑选定片段并下载', doneTitle: '音频剪辑完成！' },
    ja: { selectTitle: 'カットする音声ファイルを選択してください', totalTime: '全体再生時間:', startLabel: '開始時間:', endLabel: '終了時間:', durationLabel: '選択区間:', previewBtn: '選択区間をプレビュー再生', pauseBtn: 'プレビュー一時停止', cutBtn: '選択区間をカットしてダウンロード', doneTitle: '音声トリミング完了！' },
  }[language] || { selectTitle: 'Select audio file (MP3, WAV, OGG) to cut', totalTime: 'Total Audio Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Range:', previewBtn: 'Preview Selected Range', pauseBtn: 'Pause Preview', cutBtn: 'Cut Selected Segment & Download', doneTitle: 'Audio Trimming Completed!' };

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

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="audio-cutter"
        title="오디오 / MP3 구간 자르기 (Audio Trimmer)"
        description="통합 타임라인 바 및 시작/종료 슬라이더로 원하는 음악 구간을 정밀 선택하고 실시간으로 미리 들어본 후 자릅니다."
      />

      <AdBanner slotId="cutter-top" />

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

          {/* 통합 타임라인 시각화 + 100% 선택 보장 슬라이더 컨트롤 ⭐ */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 선택 구간 수치 및 미리듣기 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {labels.durationLabel} <span style={{ color: 'var(--accent-primary)', fontSize: '1.15rem', fontWeight: 800 }}>{formatTime(startTime)} ~ {formatTime(endTime)} ({Math.max(0, endTime - startTime)}초)</span>
              </div>

              <button
                onClick={togglePreview}
                className="btn-secondary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  background: isPlayingPreview ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  color: isPlayingPreview ? '#ef4444' : 'var(--accent-primary)',
                  border: isPlayingPreview ? '1px solid #ef4444' : '1px solid var(--accent-primary)',
                }}
              >
                {isPlayingPreview ? <Pause size={16} /> : <Play size={16} />}
                {isPlayingPreview ? labels.pauseBtn : labels.previewBtn}
              </button>
            </div>

            {/* 시각적 오디오 트랙 레일 바 */}
            <div style={{ position: 'relative', height: '14px', borderRadius: '7px', background: 'var(--border-color)', width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  left: `${startPercent}%`,
                  width: `${Math.max(0, endPercent - startPercent)}%`,
                  height: '100%',
                  borderRadius: '7px',
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.6)',
                }}
              />
            </div>

            {/* 🎯 시작 시간 & 종료 시간 100% 완벽 개별 조절 슬라이더 (독점 미스 차단) ⭐ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* 🟢 시작 시간 슬라이더 */}
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span style={{ color: '#10b981' }}>▶️ {labels.startLabel}</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{formatTime(startTime)} ({startTime}초)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 1)}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  style={{ accentColor: '#10b981', cursor: 'pointer', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setStartTime((prev) => Math.max(0, prev - 1))} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Minus size={12} /> 1s
                  </button>
                  <button onClick={() => setStartTime((prev) => Math.min(endTime - 1, prev + 1))} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={12} /> 1s
                  </button>
                </div>
              </div>

              {/* 🔴 종료 시간 슬라이더 */}
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span style={{ color: '#ef4444' }}>⏹️ {labels.endLabel}</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{formatTime(endTime)} ({endTime}초)</span>
                </div>
                <input
                  type="range"
                  min={startTime + 1}
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  style={{ accentColor: '#ef4444', cursor: 'pointer', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEndTime((prev) => Math.max(startTime + 1, prev - 1))} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Minus size={12} /> 1s
                  </button>
                  <button onClick={() => setEndTime((prev) => Math.min(duration, prev + 1))} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={12} /> 1s
                  </button>
                </div>
              </div>
            </div>

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

      <ToolGuideSection
        toolId="audio-cutter"
        toolTitle="무료 오디오 자르기 & 벨소리 편집기 (Audio Cutter & Trimmer)"
        categoryName="미디어 & 오디오 도구"
      />
    </div>
  );
};

