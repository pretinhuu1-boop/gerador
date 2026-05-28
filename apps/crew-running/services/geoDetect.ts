import { SP_CENTER, type LngLat } from '../data/spLiveMap';

const GPS_TIMEOUT_MS = 4_000;
const IP_API_URL = 'https://ipapi.co/json/';

export type GeoSource = 'gps' | 'ip' | 'fallback';

export interface GeoDetectResult {
  position: LngLat;
  source: GeoSource;
}

const fromGPS = (): Promise<LngLat> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('no geolocation'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: GPS_TIMEOUT_MS, maximumAge: 60_000 },
    );
  });

const fromIP = async (): Promise<LngLat> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3_000);
  const res = await fetch(IP_API_URL, { signal: controller.signal }).finally(() => clearTimeout(timer));
  if (!res.ok) throw new Error(`ip api ${res.status}`);
  const data = await res.json();
  if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
    throw new Error('ip api bad shape');
  }
  return { lng: data.longitude, lat: data.latitude };
};

export const detectPosition = async (): Promise<GeoDetectResult> => {
  try {
    return { position: await fromGPS(), source: 'gps' };
  } catch {
    // GPS denied or timed out — try IP
  }
  try {
    return { position: await fromIP(), source: 'ip' };
  } catch {
    // IP also failed — use hardcoded São Paulo center
  }
  return { position: SP_CENTER, source: 'fallback' };
};
