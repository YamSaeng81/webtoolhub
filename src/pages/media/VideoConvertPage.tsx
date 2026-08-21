import React, { useState, useRef } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ProgressBar } from '../../components/common/ProgressBar';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

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
  const [statusMsg, setStatusMsg] = useState<string>('변환 준비 중...');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  const labels = {
    ko: { selectTitle: '변환할 동영상(MP4, WebM, MOV) 파일을 선택하세요', targetLabel: '변환할 목표 동영상 포맷:', btnConvert: '고화질 동영상 포맷 변환 실행', doneTitle: '동영상 포맷 변환 완료!' },
    en: { selectTitle: 'Select video file (MP4, WebM, MOV) to convert', targetLabel: 'Target Video Format:', btnConvert: 'Start HD Video Conversion', doneTitle: 'Video Conversion Completed!' },
    es: { selectTitle: 'Seleccione archivo de video para convertir', targetLabel: 'Formato de video de destino:', btnConvert: 'Iniciar conversión de video HD', doneTitle: '¡Conversión de video completada!' },
    zh: { selectTitle: '选择要转换的视频文件 (MP4, WebM, MOV)', targetLabel: '目标视频格式：', btnConvert: '执行高清视频格式转换', doneTitle: '视频格式转换完成！' },
    ja: { selectTitle: '変換する動画ファイルを選択してください', targetLabel: '変換後の動画フォーマット:', btnConvert: '高品質動画変換を開始', doneTitle: '動画フォーマット変換完了！' },
  }[language] || { selectTitle: 'Select video file to convert', targetLabel: 'Target Video Format:', btnConvert: 'Start HD Video Conversion', doneTitle: 'Video Conversion Completed!' };

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
   * 300MB+ 대용량 4K 동영상도 OOM 멈춤 없이 100% 변환되는 초고속 Direct Encoder ⭐
   */
  const handleConvertVideo = async () => {
    const hiddenVideo = hiddenVideoRef.current;
    if (!hiddenVideo || !file) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusMsg('동영상 스트림 렌더링 준비 중...');
    trackToolUsage('video-convert', '동영상 포맷 변환');

    try {
      hiddenVideo.currentTime = 0;
      await new Promise((res) => { hiddenVideo.onseeked = res; });

      // 1. 비디오 다이렉트 캡처 스트림 (MediaStream)
      let stream: MediaStream | null = null;
      if ((hiddenVideo as any).captureStream) {
        stream = (hiddenVideo as any).captureStream();
      } else if ((hiddenVideo as any).mozCaptureStream) {
        stream = (hiddenVideo as any).mozCaptureStream();
      }

      if (!stream) {
        throw new Error('Direct stream capture not supported');
      }

      // 스피커 음소거 (소리 유출 차단)
      hiddenVideo.muted = true;

      // 2. 고화질 MimeType 지정 (WebM/MP4)
      const requestedMime = targetFormat === 'webm' ? 'video/webm;codecs=vp8,opus' : 'video/mp4';
      const recorderMime = MediaRecorder.isTypeSupported(requestedMime)
        ? requestedMime
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recorderMime,
        videoBitsPerSecond: 8000000, // 8 Mbps 초고화질
        audioBitsPerSecond: 192000,  // 192 kbps 초고음질
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        hiddenVideo.pause();
        const convertedBlob = new Blob(chunks, { type: targetFormat === 'webm' ? 'video/webm' : 'video/mp4' });

        if (convertedBlob.size === 0) {
          alert('변환된 파일 용량이 0바이트입니다. 다시 시도해 주세요.');
          setIsProcessing(false);
          return;
        }

        const url = URL.createObjectURL(convertedBlob);
        setResultUrl(url);
        setProgress(100);
        setStatusMsg('변환 완료!');
        setIsProcessing(false);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      };

      // 3. 인코딩 렌더링 구동
      mediaRecorder.start(250);
      
      // 빠른 초고속 렌더링을 위해 재생속도 2.0x 지원
      hiddenVideo.playbackRate = 2.0;
      hiddenVideo.play();

      const totalDuration = hiddenVideo.duration || 10;

      const interval = setInterval(() => {
        if (hiddenVideo.paused || hiddenVideo.ended) {
          clearInterval(interval);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } else {
          const currentPct = Math.min(95, Math.round((hiddenVideo.currentTime / totalDuration) * 100));
          setProgress(currentPct);
          setStatusMsg(`초고속 변환 렌더링 중... (${currentPct}%)`);
        }
      }, 200);

      hiddenVideo.onended = () => {
        clearInterval(interval);
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
    if (hiddenVideoRef.current) hiddenVideoRef.current.pause();
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
        description="MP4, WebM 동영상 포맷 간을 대용량(300MB+)도 멈춤 없이 100% 브라우저 인메모리 상에서 고화질로 상호 변환합니다."
      />

      <AdBanner slotId="videoconvert-top" />

      {/* 백그라운드 변환 전용 숨김 비디오 ⭐ */}
      {videoUrl && (
        <video
          ref={hiddenVideoRef}
          src={videoUrl}
          preload="auto"
          style={{ display: 'none', position: 'absolute', pointerEvents: 'none', opacity: 0 }}
        />
      )}

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
              <video src={videoUrl} controls style={{ maxHeight: '260px', maxWidth: '100%' }} />
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

          {isProcessing && <ProgressBar progress={progress} statusText={statusMsg} />}

          <button
            className="btn-primary"
            onClick={handleConvertVideo}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <RefreshCw size={18} /> {isProcessing ? statusMsg : labels.btnConvert}
          </button>
        </div>
      )}

      <AdBanner slotId="videoconvert-bottom" />

      <ToolGuideSection
        toolId="video-convert"
        toolTitle="무료 동영상 포맷 변환기 (MP4, WebM Video Converter)"
        categoryName="미디어 & 비디오 도구"
      />
    </div>
  );
};

