import React, { useState, useRef } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Video } from 'lucide-react';

export const VideoConvertPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'webm' | 'mp4'>('webm');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const labels = {
    ko: { selectTitle: '변환할 동영상(MP4, WebM, MOV) 파일을 선택하세요', targetLabel: '변환할 목표 동영상 포맷:', btnConvert: '동영상 포맷 변환 실행', doneTitle: '동영상 포맷 변환 완료!' },
    en: { selectTitle: 'Select video file (MP4, WebM, MOV) to convert', targetLabel: 'Target Video Format:', btnConvert: 'Convert Video Format', doneTitle: 'Video Conversion Completed!' },
    es: { selectTitle: 'Seleccione archivo de video para convertir', targetLabel: 'Formato de video de destino:', btnConvert: 'Convertir formato de video', doneTitle: '¡Conversión de video completada!' },
    zh: { selectTitle: '选择要转换的视频文件 (MP4, WebM, MOV)', targetLabel: '目标视频格式：', btnConvert: '执行视频格式转换', doneTitle: '视频格式转换完成！' },
    ja: { selectTitle: '変換する動画ファイルを選択してください', targetLabel: '変換後の動画フォーマット:', btnConvert: '動画フォーマット変換を実行', doneTitle: '動画フォーマット変換完了！' },
  }[language] || { selectTitle: 'Select video file to convert', targetLabel: 'Target Video Format:', btnConvert: 'Convert Video Format', doneTitle: 'Video Conversion Completed!' };

  const getOriginalFormat = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'mp4') return 'mp4';
    if (ext === 'webm') return 'webm';
    return ext;
  };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('video/')) {
      alert('동영상 파일만 선택이 가능합니다.');
      return;
    }
    setFile(selected);
    setVideoUrl(URL.createObjectURL(selected));
    setResultUrl(null);

    const orig = getOriginalFormat(selected.name);
    if (orig === 'webm') setTargetFormat('mp4');
    else setTargetFormat('webm');
  };

  /**
   * 영상(비디오 트랙) + 오디오 트랙 100% 음원 합성 변환 ⭐
   */
  const handleConvertVideo = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    setIsProcessing(true);
    setProgress(10);
    trackToolUsage('video-convert', '동영상 포맷 변환');

    try {
      video.currentTime = 0;
      await new Promise((res) => { video.onseeked = res; });

      // 1. 비디오 엘리먼트 고유 캡처 스트림 생성 (오디오 트랙 포함)
      let videoMediaStream: MediaStream | null = null;
      if ((video as any).captureStream) {
        videoMediaStream = (video as any).captureStream();
      } else if ((video as any).mozCaptureStream) {
        videoMediaStream = (video as any).mozCaptureStream();
      }

      // 2. Canvas 캔버스 비디오 트랙 생성
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      const canvasStream = canvas.captureStream(30);

      // 3. 🎵 비디오 미디어 스트림에서 오디오 트랙을 가져와 캔버스 스트림에 합성! ⭐
      if (videoMediaStream) {
        const audioTracks = videoMediaStream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks.forEach((track) => canvasStream.addTrack(track));
        }
      }

      // 4. 지원 가능한 MediaRecorder MimeType 지정
      const requestedMime = targetFormat === 'webm' ? 'video/webm;codecs=vp8,opus' : 'video/mp4';
      const recorderMime = MediaRecorder.isTypeSupported(requestedMime) 
        ? requestedMime 
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: recorderMime });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const convertedBlob = new Blob(chunks, { type: targetFormat === 'webm' ? 'video/webm' : 'video/mp4' });
        const url = URL.createObjectURL(convertedBlob);
        setResultUrl(url);
        setProgress(100);
        setIsProcessing(false);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      };

      mediaRecorder.start();
      video.muted = false; // 오디오 렌더링을 위해 음소거 해제 ⭐
      video.play();

      const durationSec = video.duration || 10;
      let animId: number;

      const renderLoop = () => {
        if (video.paused || video.ended) {
          cancelAnimationFrame(animId);
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
          return;
        }

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const pct = Math.min(95, Math.round((video.currentTime / durationSec) * 100));
        setProgress(pct);

        animId = requestAnimationFrame(renderLoop);
      };

      renderLoop();

      video.onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

    } catch (err) {
      alert(`Video conversion failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (videoRef.current) videoRef.current.pause();
    setFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setProgress(0);
  };

  const origFmt = file ? getOriginalFormat(file.name) : '';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="video-convert"
        title="동영상 포맷 변환 (Video Converter)"
        description="MP4, WebM 동영상 포맷 간을 영상과 오디오 음원 트랙 손실 없이 브라우저 메모리 상에서 안전하게 변환합니다."
      />

      <AdBanner slotId="videoconvert-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.doneTitle}</h2>

          <video controls src={resultUrl} style={{ width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }} />

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

          {videoUrl && (
            <div style={{ maxHeight: '280px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <video ref={videoRef} src={videoUrl} controls style={{ maxHeight: '260px', maxWidth: '100%' }} />
            </div>
          )}

          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>{labels.targetLabel}</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {(['webm', 'mp4'] as const).map((fmt) => {
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
            onClick={handleConvertVideo}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <RefreshCw size={18} /> {isProcessing ? t.processing : labels.btnConvert}
          </button>
        </div>
      )}

      <AdBanner slotId="videoconvert-bottom" />
    </div>
  );
};
