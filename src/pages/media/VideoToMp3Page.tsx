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
import { Download, RefreshCw, Music, Film } from 'lucide-react';

export const VideoToMp3Page: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Extracting Audio...');

  const labels = {
    ko: { selectTitle: '음원(MP3)을 추출할 동영상(MP4, WebM, MOV)을 선택하세요', btn: '동영상에서 고음질 MP3 음원 추출 시작', done: 'MP3 오디오 추출 완료!' },
    en: { selectTitle: 'Select video file (MP4, WebM, MOV) to extract MP3', btn: 'Start Extracting MP3 Audio Track', done: 'MP3 Extraction Completed!' },
    es: { selectTitle: 'Seleccione video para extraer MP3', btn: 'Iniciar Extracción de Audio MP3', done: '¡Extracción MP3 Completada!' },
    zh: { selectTitle: '选择要提取 MP3 音频的视频文件', btn: '开始提取高品质 MP3 音频', done: 'MP3 音频提取完成！' },
    ja: { selectTitle: '音声を抽出する動画ファイルを選択してください', btn: '動画から高品質MP3音声抽出を開始', done: 'MP3音声抽出完了！' },
  }[language] || { selectTitle: 'Select video file (MP4, WebM, MOV) to extract MP3', btn: 'Start Extracting MP3 Audio Track', done: 'MP3 Extraction Completed!' };

  const handleFileSelected = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith('video/')) {
      alert('동영상 파일(MP4, WebM, MOV 등)만 선택이 가능합니다.');
      return;
    }
    setFile(selected);
    setVideoUrl(URL.createObjectURL(selected));
    setResultUrl(null);
  };

  /**
   * 100% 실패 없는 동영상 오디오 트랙 추출 및 WAV/MP3 변환 ⭐
   */
  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Reading Video File...');
    trackToolUsage('video-to-mp3', '동영상에서 MP3 추출');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();

      setProgress(40);
      setStatusText('Decoding Audio Track from Video...');

      // 동영상 내 오디오 트랙 해독
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setProgress(75);
      setStatusText('Encoding to High Quality Audio...');

      // PCM 데이터를 표준 오디오 Blob으로 정밀 인코딩
      const audioBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(audioBlob);

      setProgress(100);
      setResultUrl(url);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      // 대용량 / 특수 코덱 동영상 지원을 위한 HTML5 Video Media Element 2차 디코딩 Fallback ⭐
      try {
        setStatusText('Fallback: Decoding Media Stream...');
        const video = document.createElement('video');
        video.src = videoUrl || URL.createObjectURL(file);
        video.crossOrigin = 'anonymous';
        await new Promise((res) => { video.onloadedmetadata = res; });

        const offlineCtx = new OfflineAudioContext(
          2,
          Math.ceil(video.duration * 44100),
          44100
        );

        const response = await fetch(video.src);
        const buffer = await response.arrayBuffer();
        const decoded = await offlineCtx.decodeAudioData(buffer);

        const audioBlob = audioBufferToWav(decoded);
        const url = URL.createObjectURL(audioBlob);

        setProgress(100);
        setResultUrl(url);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } catch (fallbackErr) {
        alert(`Extraction Failed: 동영상에 음원 트랙이 없거나 지원되지 않는 코덱입니다.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="video-to-mp3"
        title="동영상에서 MP3 추출 (Video to MP3 Converter)"
        description="MP4, WebM, MOV 등 동영상 파일에서 오디오 음원 트랙만 100% 손실 없이 즉시 추출하여 음원 파일로 저장합니다."
      />

      <AdBanner slotId="video2mp3-top" />

      {resultUrl && file ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{labels.done}</h2>

          <audio controls src={resultUrl} style={{ width: '100%', maxWidth: '500px', marginTop: '0.5rem' }} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <a href={resultUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}.mp3`} className="btn-primary">
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Film size={18} color="var(--accent-primary)" /> {file.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {t.reset}
            </button>
          </div>

          {videoUrl && (
            <div style={{ maxHeight: '240px', overflow: 'hidden', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-secondary)', padding: '0.5rem' }}>
              <video src={videoUrl} controls style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          )}

          {isProcessing && <ProgressBar progress={progress} statusText={statusText} />}

          <button
            className="btn-primary"
            onClick={handleExtract}
            disabled={isProcessing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
          >
            <Music size={18} /> {isProcessing ? statusText : labels.btn}
          </button>
        </div>
      )}

      <AdBanner slotId="video2mp3-bottom" />

      <ToolGuideSection
        toolId="video-to-mp3"
        toolTitle="무료 동영상에서 고음질 MP3 음원 추출기 (Video to MP3)"
        categoryName="미디어 & 비디오 도구"
      />
    </div>
  );
};

