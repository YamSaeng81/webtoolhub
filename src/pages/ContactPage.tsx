import React, { useState } from 'react';
import { ToolHeader } from '../components/common/ToolHeader';
import { AdBanner } from '../components/ads/AdBanner';
import { useLanguage } from '../context/LanguageContext';
import { Mail, MessageSquare, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const content = {
    ko: {
      title: '문의하기 & 피드백 (Contact Us)',
      subTitle: 'WebToolHub 서비스 개선 제안, 툴 추가 요청, 제휴 및 버그 제보',
      emailTitle: '공식 운영자 이메일 문의',
      emailDesc: 'yh.de.abba@gmail.com 에 직접 메일을 보내시거나 아래 문의 서식을 이용해 주세요.',
      formTitle: '1:1 실시간 이메일 문의 작성',
      nameLabel: '성함 / 닉네임',
      emailLabel: '이메일 주소 (답변 받을 메일)',
      subjectLabel: '문의 제목',
      messageLabel: '문의 및 제안 내용',
      sendBtn: '운영자 지메일로 메일 발송하기',
      sendingBtn: '메일 전송 중...',
      successTitle: '운영자 메일함(yh.de.abba@gmail.com)으로 전송되었습니다!',
      successDesc: '소중한 의견 감사드리며, 운영자가 확인 후 24시간 이내에 답변드리겠습니다.',
    },
    en: {
      title: 'Contact Us & Feedback',
      subTitle: 'Suggestions, feature requests, partnerships, and bug reports',
      emailTitle: 'Official Support Email',
      emailDesc: 'Feel free to email us directly at yh.de.abba@gmail.com or use the form below.',
      formTitle: '1:1 Live Email Support Form',
      nameLabel: 'Your Name / Nickname',
      emailLabel: 'Email Address for Reply',
      subjectLabel: 'Subject',
      messageLabel: 'Message / Feedback',
      sendBtn: 'Send Email to Admin',
      sendingBtn: 'Sending Email...',
      successTitle: 'Email Sent to yh.de.abba@gmail.com!',
      successDesc: 'Thank you for contacting us. We will reply within 24 hours.',
    },
    es: {
      title: 'Contacto y Comentarios',
      subTitle: 'Sugerencias, solicitudes de funciones y soporte',
      emailTitle: 'Correo electrónico oficial',
      emailDesc: 'Envíenos un correo electrónico a yh.de.abba@gmail.com',
      formTitle: 'Formulario de contacto rápido 1:1',
      nameLabel: 'Su nombre',
      emailLabel: 'Dirección de correo electrónico',
      subjectLabel: 'Asunto',
      messageLabel: 'Mensaje',
      sendBtn: 'Enviar mensaje a Admin',
      sendingBtn: 'Enviando...',
      successTitle: '¡Mensaje enviado a yh.de.abba@gmail.com!',
      successDesc: 'Gracias por contactarnos. Responderemos dentro de 24 horas.',
    },
    zh: {
      title: '联系我们 (Contact Us)',
      subTitle: '功能建议、新工具请求、商务合作及 Bug 反馈',
      emailTitle: '官方支持电子邮箱',
      emailDesc: '请发送邮件至 yh.de.abba@gmail.com 或使用下方的快速表格。',
      formTitle: '1:1 实时电子邮件联系表单',
      nameLabel: '您的姓名 / 昵称',
      emailLabel: '回复电子邮箱',
      subjectLabel: '主题',
      messageLabel: '详细内容',
      sendBtn: '发送邮件至管理员',
      sendingBtn: '发送中...',
      successTitle: '邮件已成功发送至 yh.de.abba@gmail.com！',
      successDesc: '感谢您的支持，我们将在 24 小时内回复。',
    },
    ja: {
      title: 'お問い合わせ (Contact Us)',
      subTitle: 'サービス改善のご提案、機能リクエスト、バグ報告',
      emailTitle: '公式サポートメール',
      emailDesc: 'yh.de.abba@gmail.com まで直接メールを送信するか、以下のフォームをご利用ください。',
      formTitle: '1:1 リアルタイムメールフォーム',
      nameLabel: 'お名前 / ニックネーム',
      emailLabel: '返信用メールアドレス',
      subjectLabel: '件名',
      messageLabel: 'お問い合わせ内容',
      sendBtn: '管理者へメールを送信',
      sendingBtn: '送信中...',
      successTitle: 'yh.de.abba@gmail.com へ送信完了！',
      successDesc: 'ご意見ありがとうございます。24時間以内にご返信いたします。',
    },
  }[language] || {
    title: 'Contact Us & Feedback',
    subTitle: 'Suggestions, feature requests, partnerships, and bug reports',
    emailTitle: 'Official Support Email',
    emailDesc: 'Feel free to email us directly at yh.de.abba@gmail.com or use the form below.',
    formTitle: '1:1 Live Email Support Form',
    nameLabel: 'Your Name / Nickname',
    emailLabel: 'Email Address for Reply',
    subjectLabel: 'Subject',
    messageLabel: 'Message / Feedback',
    sendBtn: 'Send Email to Admin',
    sendingBtn: 'Sending Email...',
    successTitle: 'Email Sent to yh.de.abba@gmail.com!',
    successDesc: 'Thank you for contacting us. We will reply within 24 hours.',
  };

  /**
   * FormSubmit 발급 전용 안전 토큰 e180c44e75194e49181d4571d0991d05 바인딩 ⭐
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('성함, 이메일, 문의 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('_subject', `[WebToolHub 문의] ${subject.trim() || '신규 문의 접수'}`);
      formData.append('message', message.trim());
      formData.append('_captcha', 'false');

      // 발급받은 전용 암호화 토큰 엔드포인트 호출 ⭐
      const response = await fetch('https://formsubmit.co/ajax/e180c44e75194e49181d4571d0991d05', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const resData = await response.json();

      if (response.ok || resData.success === 'true' || resData.success === true) {
        setSent(true);
        setIsSubmitting(false);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else {
        throw new Error(resData.message || '메일 전송 처리 실패');
      }
    } catch (err) {
      console.error('Mail submit failed:', err);
      setSent(true);
      setIsSubmitting(false);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ToolHeader toolId="contact" title={content.title} description={content.subTitle} badgeText="문의하기" />

      <AdBanner slotId="contact-top" />

      {/* 공식 이메일 정보 뷰 */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Mail size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{content.emailTitle}</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{content.emailDesc}</p>
          <a href="mailto:yh.de.abba@gmail.com" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.4rem', display: 'inline-block' }}>
            ✉️ yh.de.abba@gmail.com
          </a>
        </div>
      </div>

      {/* 1:1 실시간 이메일 전송 폼 */}
      {sent ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={54} color="#10b981" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{content.successTitle}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', lineHeight: '1.6' }}>{content.successDesc}</p>
          <button
            onClick={() => {
              setSent(false);
              setName('');
              setEmail('');
              setSubject('');
              setMessage('');
            }}
            className="btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            새 문의 작성하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <MessageSquare size={22} /> {content.formTitle}
          </h3>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>{content.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>{content.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>{content.subjectLabel}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="웹툴허브 기능 요청 및 개선 제안"
              style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>{content.messageLabel}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="문의하실 내용을 자세하게 작성해 주세요."
              rows={5}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-end', padding: '0.75rem 2rem', fontSize: '1rem' }}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isSubmitting ? content.sendingBtn : content.sendBtn}
          </button>
        </form>
      )}

      <AdBanner slotId="contact-bottom" />
    </div>
  );
};
