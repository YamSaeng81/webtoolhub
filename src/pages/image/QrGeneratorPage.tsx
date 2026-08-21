import React, { useState, useEffect, useRef } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { useLanguage } from '../../context/LanguageContext';
import { trackToolUsage } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Wifi, Link, AlignLeft, Phone, Mail, Check } from 'lucide-react';

type QrInputType = 'url' | 'text' | 'wifi' | 'phone' | 'email';

export const QrGeneratorPage: React.FC = () => {
  const { language } = useLanguage();
  const [inputType, setInputType] = useState<QrInputType>('url');

  // Input Fields
  const [urlText, setUrlText] = useState<string>('https://webtoolhub.yhdeabba.com');
  const [plainText, setPlainText] = useState<string>('WebToolHub QR Code Generator');
  const [wifiSsid, setWifiSsid] = useState<string>('MyWiFi_Network');
  const [wifiPass, setWifiPass] = useState<string>('12345678');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [phoneNum, setPhoneNum] = useState<string>('010-1234-5678');
  const [emailAddr, setEmailAddr] = useState<string>('yh.de.abba@gmail.com');

  // Styling Options
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(300);
  const margin = 2;

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const labels = {
    ko: {
      typeUrl: '웹사이트 URL',
      typeText: '일반 텍스트',
      typeWifi: 'Wi-Fi 접속',
      typePhone: '전화번호',
      typeEmail: '이메일',
      fgColorLabel: 'QR 코드 색상:',
      bgColorLabel: '배경 색상:',
      sizeLabel: 'QR 크기 (px):',
      downloadPng: 'PNG 다운로드',
      downloadJpeg: 'JPEG 다운로드',
      copySuccess: '클립보드 복사 완료!',
      copyBtn: '이미지 복사',
      doneTitle: 'QR 코드 생성 완료!',
    },
    en: {
      typeUrl: 'Website URL',
      typeText: 'Plain Text',
      typeWifi: 'Wi-Fi Network',
      typePhone: 'Phone Number',
      typeEmail: 'Email',
      fgColorLabel: 'QR Color:',
      bgColorLabel: 'Background Color:',
      sizeLabel: 'QR Size (px):',
      downloadPng: 'Download PNG',
      downloadJpeg: 'Download JPEG',
      copySuccess: 'Copied to Clipboard!',
      copyBtn: 'Copy Image',
      doneTitle: 'QR Code Generated!',
    },
    es: {
      typeUrl: 'URL del sitio web',
      typeText: 'Texto plano',
      typeWifi: 'Red Wi-Fi',
      typePhone: 'Teléfono',
      typeEmail: 'Correo electrónico',
      fgColorLabel: 'Color de QR:',
      bgColorLabel: 'Color de fondo:',
      sizeLabel: 'Tamaño (px):',
      downloadPng: 'Descargar PNG',
      downloadJpeg: 'Descargar JPEG',
      copySuccess: '¡Copiado!',
      copyBtn: 'Copiar imagen',
      doneTitle: '¡Código QR generado!',
    },
    zh: {
      typeUrl: '网站 URL',
      typeText: '普通文本',
      typeWifi: 'Wi-Fi 网络',
      typePhone: '电话号码',
      typeEmail: '电子邮件',
      fgColorLabel: 'QR 码颜色：',
      bgColorLabel: '背景颜色：',
      sizeLabel: '尺寸 (px)：',
      downloadPng: '下载 PNG',
      downloadJpeg: '下载 JPEG',
      copySuccess: '已复制！',
      copyBtn: '复制图片',
      doneTitle: 'QR 码生成完成！',
    },
    ja: {
      typeUrl: 'ウェブサイトURL',
      typeText: 'テキスト',
      typeWifi: 'Wi-Fi接続',
      typePhone: '電話番号',
      typeEmail: 'メール',
      fgColorLabel: 'QRコードの色:',
      bgColorLabel: '背景色:',
      sizeLabel: 'サイズ (px):',
      downloadPng: 'PNGダウンロード',
      downloadJpeg: 'JPEGダウンロード',
      copySuccess: 'コピー完了！',
      copyBtn: '画像をコピー',
      doneTitle: 'QRコード生成完了！',
    },
  }[language] || {
    typeUrl: 'Website URL',
    typeText: 'Plain Text',
    typeWifi: 'Wi-Fi Network',
    typePhone: 'Phone Number',
    typeEmail: 'Email',
    fgColorLabel: 'QR Color:',
    bgColorLabel: 'Background Color:',
    sizeLabel: 'QR Size (px):',
    downloadPng: 'Download PNG',
    downloadJpeg: 'Download JPEG',
    copySuccess: 'Copied to Clipboard!',
    copyBtn: 'Copy Image',
    doneTitle: 'QR Code Generated!',
  };

  const getEncodedText = (): string => {
    switch (inputType) {
      case 'url':
        return urlText.trim().startsWith('http') ? urlText.trim() : `https://${urlText.trim()}`;
      case 'text':
        return plainText;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEnc};P:${wifiPass};;`;
      case 'phone':
        return `TEL:${phoneNum.trim()}`;
      case 'email':
        return `mailto:${emailAddr.trim()}`;
      default:
        return 'https://webtoolhub.yhdeabba.com';
    }
  };

  const generateQrCode = async () => {
    const rawContent = getEncodedText();
    if (!rawContent) return;

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      await QRCode.toCanvas(canvas, rawContent, {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      });

      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  useEffect(() => {
    generateQrCode();
  }, [inputType, urlText, plainText, wifiSsid, wifiPass, wifiEnc, phoneNum, emailAddr, fgColor, bgColor, size]);

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!qrDataUrl) return;
    trackToolUsage('image-qr-generator', 'QR 코드 생성기');
    const link = document.createElement('a');
    link.download = `qrcode_${inputType}_${Date.now()}.${format}`;
    link.href = qrDataUrl;
    link.click();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    trackToolUsage('image-qr-generator', 'QR 코드 생성기');
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          await navigator.clipboard.write([new (window as any).ClipboardItem({ [blob.type]: blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          alert('Clipboard image copy not supported in this browser.');
        }
      });
    } catch (e) {
      alert('Copy image failed.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="image-qr-generator"
        title="QR 코드 생성기 (QR Code Generator)"
        description="URL, Wi-Fi 자동 접속, 전화번호, 이메일을 고화질 QR 코드로 생성하고 색상과 크기를 자유롭게 커스텀 다운로드하세요."
      />

      <AdBanner slotId="qr-top" />

      {/* 입력 데이터 타입 선택 탭 ⭐ */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { id: 'url', label: labels.typeUrl, icon: <Link size={16} /> },
            { id: 'text', label: labels.typeText, icon: <AlignLeft size={16} /> },
            { id: 'wifi', label: labels.typeWifi, icon: <Wifi size={16} /> },
            { id: 'phone', label: labels.typePhone, icon: <Phone size={16} /> },
            { id: 'email', label: labels.typeEmail, icon: <Mail size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInputType(tab.id as QrInputType)}
              className={inputType === tab.id ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 탭별 입력 폼 */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {inputType === 'url' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.typeUrl}</label>
              <input
                type="text"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                placeholder="https://example.com"
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          )}

          {inputType === 'text' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.typeText}</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder="Enter any message or text..."
                rows={3}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          )}

          {inputType === 'wifi' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Wi-Fi 이름 (SSID):</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>비밀번호:</label>
                <input
                  type="password"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>암호화 방식:</label>
                <select
                  value={wifiEnc}
                  onChange={(e) => setWifiEnc(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">없음 (Open)</option>
                </select>
              </div>
            </div>
          )}

          {inputType === 'phone' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.typePhone}</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="010-0000-0000"
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          )}

          {inputType === 'email' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.typeEmail}</label>
              <input
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                placeholder="admin@example.com"
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          )}
        </div>

        {/* 커스텀 디자인 옵션 (색상, 크기) ⭐ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.fgColorLabel}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={{ width: '40px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fgColor}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.bgColorLabel}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '40px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{bgColor}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{labels.sizeLabel} {size}px</label>
            <input
              type="range"
              min={180}
              max={600}
              step={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* QR 코드 생성 결과 캔버스 & 다운로드 ⭐ */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={32} />
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{labels.doneTitle}</h3>

        <div style={{ padding: '1rem', background: bgColor, borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)', display: 'inline-flex' }}>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button onClick={() => handleDownload('png')} className="btn-primary">
            <Download size={18} /> {labels.downloadPng}
          </button>
          <button onClick={() => handleDownload('jpeg')} className="btn-secondary">
            <Download size={18} /> {labels.downloadJpeg}
          </button>
          <button onClick={handleCopyImage} className="btn-secondary">
            {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            {copied ? labels.copySuccess : labels.copyBtn}
          </button>
        </div>
      </div>

      <AdBanner slotId="qr-bottom" />

      <ToolGuideSection
        toolId="image-qr-generator"
        toolTitle="무료 고화질 QR 코드 생성기 (QR Code Generator)"
        categoryName="이미지 & AI 도구"
      />
    </div>
  );
};

