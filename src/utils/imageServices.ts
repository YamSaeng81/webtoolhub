/**
 * 브라우저 HTML Canvas 기반 100% Client-Side 고속 이미지 처리 엔진
 */

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  dataUrl: string;
}

export async function compressImage(file: File, quality: number = 0.7): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D Context를 생성할 수 없습니다.'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = file.type.includes('png') ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 압축 생성 실패'));
            return;
          }
          const compressedDataUrl = URL.createObjectURL(blob);
          resolve({
            blob,
            originalSize: file.size,
            compressedSize: blob.size,
            dataUrl: compressedDataUrl,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('이미지 로딩 실패'));
    img.src = url;
  });
}

export async function convertImageFormat(
  file: File,
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas Context 오류'));
        return;
      }

      // JPEG의 경우 투명 배경을 흰색으로 처리
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('포맷 변환 실패'));
        },
        targetFormat,
        0.9
      );
    };

    img.onerror = () => reject(new Error('이미지 파일 손상'));
    img.src = url;
  });
}

export async function resizeImage(file: File, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas Context 오류'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('리사이즈 실패'));
        },
        file.type || 'image/png',
        0.9
      );
    };

    img.onerror = () => reject(new Error('이미지 로딩 실패'));
    img.src = url;
  });
}
