import React, { useState, useRef } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import { formatTime } from '../../utils/audioServices';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Scissors, Film, Clock, Play, Pause } from 'lucide-react';

export const VideoCutterPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const labels = {
    ko: { selectTitle: '자르고 싶은 동영상(MP4, WebM, MOV) 파일을 선택하세요', totalTime: '전체 동영상 길이:', startLabel: '시작 시간:', endLabel: '종료 시간:', durationLabel: '잘라낼 선택 구간:', previewBtn: '선택 구간 재생해보기', pauseBtn: '일시 정지', cutBtn: '동영상 구간 잘라내기 & 다운로드', doneTitle: '동영상 구간 자르기 완료!' },
    en: { selectTitle: 'Select video file (MP4, WebM, MOV) to trim', totalTime: 'Total Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Range:', previewBtn: 'Preview Selected Segment', pauseBtn: 'Pause Preview', cutBtn: 'Trim Video & Download', doneTitle: 'Video Trimming Completed!' },
    es: { selectTitle: 'Seleccione archivo de video para recortar', totalTime: 'Duración total:', startLabel: 'Tiempo de inicio:', endLabel: 'Tiempo de fin:', durationLabel: 'Segmento seleccionado:', previewBtn: 'Ver vista previa', pauseBtn: 'Pausar', cutBtn: 'Recortar video y descargar', doneTitle: '¡Recorte de video completado!' },
    zh: { selectTitle: '选择要剪辑的视频文件 (MP4, WebM, MOV)', totalTime: '视频总时长：', startLabel: '起始时间：', endLabel: '结束时间：', durationLabel: '选中片段：', previewBtn: '预览选定片段', pauseBtn: '暂停', cutBtn: '剪辑视频并下载', doneTitle: '视频剪辑完成！' },
    ja: { selectTitle: 'カットする動画ファイルを選択してください', totalTime: '全体再生時間:', startLabel: '開始時間:', endLabel: '終了時間:', durationLabel: '選択区間:', previewBtn: '選択区間をプレビュー再生', pauseBtn: '一時停止', cutBtn: '動画区間をカットしてダウンロード', doneTitle: '動画トリミング完了！' },
  }[language] || { selectTitle: 'Select video file (MP4, WebM, MOV) to trim', totalTime: 'Total Duration:', startLabel: 'Start Time:', endLabel: 'End Time:', durationLabel: 'Selected Range:', previewBtn: 'Preview Selected Segment', pauseBtn: 'Pause Preview', cutBtn: 'Trim Video & Download', doneTitle: 'Video Trimming Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('video/')) {
      alert('동영상 파일(MP4, WebM, MOV 등)만 선택이 가능합니다.');
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setVideoUrl(url);
    setResultUrl(null);
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = Math.round(videoRef.current.duration);
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(15, dur));
    }
  };

  const togglePreview = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlayingPreview) {
      video.pause();
      setIsPlayingPreview(false);
    } else {
      video.currentTime = startTime;
      video.play();
      setIsPlayingPreview(true);
    }
  };

  /**
   * 브라우저 인메모리 MediaRecorder 동영상 구간 커팅 ⭐
   */
  const handleCutVideo = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    setIsProcessing(true);
    setProgress(20);
    trackToolUsage('video-cutter', '동영상 구간 자르기');

    try {
      video.currentTime = startTime;
      await new Promise((res) => { video.onseeked = res; });

      const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const trimmedBlob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(trimmedBlob);
        setResultUrl(url);
        setProgress(100);
        setIsProcessing(false);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      };

      mediaRecorder.start();
      video.play();

      const durationMs = (endTime - startTime) * 1000;
      const interval = setInterval(() => {
        if (video.currentTime >= endTime) {
          video.pause();
          mediaRecorder.stop();
          clearInterval(interval);
        } else {
          const elapsed = (video.currentTime - startTime) * 1000;
          setProgress(20 + Math.min(75, Math.round((elapsed / durationMs) * 75)));
        }
      }, 200);

    } catch (err) {
      alert(`Video cut failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (videoRef.current) videoRef.current.pause();
    setFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setProgress(0);
    setIsPlayingPreview(false);
  };

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="video-cutter"
        title="동영상 구간 자르기 (Video Cutter)"
        description="서버 업로드 없이 MP4, WebM, MOV 동영상에서 원하는 시작/종료 시각을 100% 브라우저 메모리 상에서 잘라내어 다운로드합니다."
      />

      <AdBanner slotId="videocutter-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>잘라낸 구간: {formatTime(startTime)} ~ {formatTime(endTime)} ({endTime - startTime}초)</p>
          </div>

          <video controls src={resultUrl} style={{ width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`Trimmed_${file.name}`} className="btn-primary">
              <Download size={18} /> {t.download} Trimmed Video
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

          {videoUrl && (
            <div style={{ maxHeight: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <video ref={videoRef} src={videoUrl} onLoadedMetadata={handleVideoLoaded} controls style={{ maxHeight: '280px', maxWidth: '100%' }} />
            </div>
          )}

          {/* 통합 타임라인 시각화 + 컨트롤 */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

            {/* 시각적 레일 바 */}
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

            {/* 시작 / 종료 시간 전용 슬라이더 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>▶️ {labels.startLabel} {formatTime(startTime)}</label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 1)}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  style={{ accentColor: '#10b981', cursor: 'pointer', width: '100%', marginTop: '0.4rem' }}
                />
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>⏹️ {labels.endLabel} {formatTime(endTime)}</label>
                <input
                  type="range"
                  min={startTime + 1}
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  style={{ accentColor: '#ef4444', cursor: 'pointer', width: '100%', marginTop: '0.4rem' }}
                />
              </div>
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} statusText={t.processing} />}

          <button
            className="btn-primary"
            onClick={handleCutVideo}
            disabled={isProcessing || endTime <= startTime}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Scissors size={18} /> {isProcessing ? t.processing : labels.cutBtn}
          </button>
        </div>
      )}

      <AdBanner slotId="videocutter-bottom" />
    </div>
  );
};
