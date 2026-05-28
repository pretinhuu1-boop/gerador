import QRCode from 'qrcode';

export const encodeQrDataUrl = async (payload: string): Promise<string> => {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
    color: {
      dark: '#000000',
      light: '#f0ebe0',
    },
  });
};
