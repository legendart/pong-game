// ── API 설정 ──
// 로컬 Mac 서버 주소 (Wi-Fi IP)
// iPhone에서 접속 시 Mac의 로컬 IP를 자동 감지

const DEV_BACKEND  = 'http://localhost:3000';
const PROD_BACKEND = 'https://legendart.github.io'; // 실제 배포 시 변경

// GitHub Pages에서 접속 시 → 백엔드 URL 자동 결정
// 1. localhost → 로컬 개발 서버
// 2. 로컬 IP → 같은 Wi-Fi에 있는 백엔드
// 3. GitHub Pages → 환경변수 또는 하드코딩된 백엔드 URL

function detectBackendURL() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return DEV_BACKEND;
  }
  // GitHub Pages에서 접속: 백엔드 URL을 localStorage에서 읽음
  // 첫 접속 시 설정 필요 (없으면 폴백 모드로 동작)
  const savedURL = localStorage.getItem('javis_backend_url');
  if (savedURL) return savedURL.replace(/\/$/, '');
  return null; // 백엔드 없음 → 프론트엔드 폴백 모드
}

export const API_BASE = detectBackendURL();
export const HAS_BACKEND = !!API_BASE;

// 백엔드 URL 수동 설정 (개발/디버깅용)
export function setBackendURL(url) {
  localStorage.setItem('javis_backend_url', url);
  location.reload();
}

// 전역 노출 (콘솔에서 setBackendURL('http://192.168.x.x:3000') 가능)
window.setBackendURL = setBackendURL;

console.log(`[Config] Backend: ${API_BASE || '(폴백 모드)'}`);
