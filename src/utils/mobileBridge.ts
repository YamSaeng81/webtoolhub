import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';

/**
 * 현재 실행 환경이 Capacitor 네이티브 앱(Android/iOS)인지 여부를 판별합니다.
 * @returns {boolean} 네이티브 앱 환경일 경우 true, 일반 웹 브라우저일 경우 false
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * 모바일 앱 실행 시 필요한 라이프사이클 이벤트 및 하드웨어 뒤로가기 동작을 초기화합니다.
 * - Android 물리 뒤로가기 버튼 연동: 뒤로 갈 히스토리가 있으면 이전 페이지로 이동, 메인 홈일 경우 앱 종료
 * - 상단 상태바(StatusBar) 다크 스타일 적용
 *
 * @param onGoBack - 뒤로 가기 동작을 수행할 콜백 함수
 * @param isRootPath - 현재 사용자가 메인 홈('/')에 위치하는지 여부
 */
export async function initializeMobileApp(
  onGoBack: () => void,
  isRootPath: boolean
): Promise<() => void> {
  if (!isNativeApp()) {
    return () => {};
  }

  // 1. 상태바 스타일 설정
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch (e) {
    console.warn('StatusBar configuration failed or not supported:', e);
  }

  // 2. Android 하드웨어 뒤로가기 버튼 리스너 등록
  const backButtonHandler = await CapApp.addListener('backButton', () => {
    if (!isRootPath) {
      onGoBack();
    } else {
      // 메인 홈 화면에서는 앱 종료
      CapApp.exitApp();
    }
  });

  return () => {
    backButtonHandler.remove();
  };
}

export interface SharePayload {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * 모바일 네이티브 공유 시트 또는 웹 브라우저의 Web Share API를 호출합니다.
 * 미지원 브라우저 환경에서는 클립보드로 URL을 안전하게 복사합니다.
 *
 * @param payload - 공유할 제목, 본문, URL 정보
 * @returns {Promise<boolean>} 공유 또는 복사 성공 여부
 */
export async function shareContent(payload: SharePayload): Promise<boolean> {
  if (isNativeApp()) {
    try {
      await Share.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
        dialogTitle: payload.dialogTitle || '공유하기',
      });
      return true;
    } catch (e) {
      console.warn('Native share was cancelled or failed:', e);
      return false;
    }
  }

  // 웹 브라우저 환경
  if (navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return true;
    } catch {
      // 사용자가 취소했거나 권한 거부 시 클립보드 복사 시도
    }
  }

  if (payload.url && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(payload.url);
      alert('링크가 클립보드에 복사되었습니다.');
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }

  return false;
}
