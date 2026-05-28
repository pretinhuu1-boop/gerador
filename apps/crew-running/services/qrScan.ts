import jsQR from 'jsqr';

export interface QrScanController {
  stop: () => void;
}

export const isCameraAvailable = (): boolean =>
  typeof navigator !== 'undefined' &&
  typeof navigator.mediaDevices?.getUserMedia === 'function';

export const startQrScan = (
  video: HTMLVideoElement,
  onResult: (data: string) => void,
  onError: (err: Error) => void,
): QrScanController => {
  let stopped = false;
  let stream: MediaStream | null = null;
  let rafId = 0;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    queueMicrotask(() => onError(new Error('Canvas 2D context unavailable.')));
    return { stop() {} };
  }

  const scan = () => {
    if (stopped) return;
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code?.data) {
        onResult(code.data);
        return;
      }
    }
    rafId = requestAnimationFrame(scan);
  };

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((s) => {
      if (stopped) { s.getTracks().forEach((t) => t.stop()); return; }
      stream = s;
      video.srcObject = s;
      video.play()
        .then(() => { rafId = requestAnimationFrame(scan); })
        .catch((err) => { if (!stopped) onError(err instanceof Error ? err : new Error(String(err))); });
    })
    .catch((err) => {
      if (!stopped) onError(err instanceof Error ? err : new Error(String(err)));
    });

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
};
