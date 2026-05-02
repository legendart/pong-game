// ── 사용자 프로필 관리 모듈 ──
// 저장 우선순위: 백엔드 SQLite DB → localStorage 폴백
import { getUser, saveUser, deleteUser, HAS_BACKEND } from './api.js';

const LS_USER_KEY   = 'saju_user';
const LS_DEVICE_KEY = 'saju_device_id';

// ── 디바이스 UUID 생성/조회 ──
export function getDeviceId() {
  let id = localStorage.getItem(LS_DEVICE_KEY);
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(LS_DEVICE_KEY, id);
  }
  return id;
}

// ── 사용자 정보 저장 (DB + localStorage 동시) ──
export async function saveUserProfile(name, birth, hour) {
  const user = { name, birth, hour: parseInt(hour) };

  // localStorage 즉시 저장 (백엔드 실패해도 유지)
  try { localStorage.setItem(LS_USER_KEY, JSON.stringify(user)); } catch {}

  // 백엔드 DB 저장
  if (HAS_BACKEND) {
    try {
      const deviceId = getDeviceId();
      const result = await saveUser(deviceId, name, birth, hour);
      if (result.ok) {
        console.log('[User] DB에 저장 완료:', result.user);
        showSaveBadge('✅ 정보가 저장되었어요!');
        return { source: 'db', user: result.user };
      }
    } catch (e) {
      console.warn('[User] DB 저장 실패, localStorage만 사용:', e.message);
    }
  }

  showSaveBadge('💾 로컬에 저장되었어요');
  return { source: 'local', user };
}

// ── 사용자 정보 로드 (DB 우선, fallback: localStorage) ──
export async function loadUserProfile() {
  // 1. 백엔드 DB에서 로드 시도
  if (HAS_BACKEND) {
    try {
      const deviceId = getDeviceId();
      const result = await getUser(deviceId);
      if (result.ok && result.user) {
        const u = result.user;
        const user = { name: u.name, birth: u.birth, hour: String(u.hour) };
        // localStorage도 최신으로 동기화
        try { localStorage.setItem(LS_USER_KEY, JSON.stringify(user)); } catch {}
        console.log('[User] DB에서 로드:', user);
        return { source: 'db', user };
      }
    } catch (e) {
      console.warn('[User] DB 로드 실패, localStorage 시도:', e.message);
    }
  }

  // 2. localStorage 폴백
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      console.log('[User] localStorage에서 로드:', user);
      return { source: 'local', user };
    }
  } catch {}

  return null; // 저장된 정보 없음
}

// ── 사용자 정보 삭제 ──
export async function deleteUserProfile() {
  localStorage.removeItem(LS_USER_KEY);
  if (HAS_BACKEND) {
    try { await deleteUser(getDeviceId()); } catch {}
  }
}

// ── 저장 완료 알림 배지 ──
function showSaveBadge(msg) {
  const existing = document.getElementById('save-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'save-badge';
  badge.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,rgba(201,168,76,.95),rgba(139,94,26,.95));
    color:#07040f;font-size:13px;font-weight:600;
    padding:10px 20px;border-radius:50px;
    box-shadow:0 4px 20px rgba(201,168,76,.4);
    z-index:9999;white-space:nowrap;
    animation:slideUp .3s ease;
    font-family:'Noto Sans KR',sans-serif;
  `;
  badge.textContent = msg;
  document.body.appendChild(badge);

  // 스타일 추가
  if (!document.getElementById('badge-style')) {
    const s = document.createElement('style');
    s.id = 'badge-style';
    s.textContent = '@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }

  setTimeout(() => badge.style.opacity = '0', 2500);
  setTimeout(() => badge.remove(), 3000);
}

// ── 프로필 섹션 렌더 (앱 헤더 아래) ──
export function renderProfileStatus(user, source) {
  const el = document.getElementById('profile-status');
  if (!el) return;
  const icon = source === 'db' ? '☁️' : '💾';
  const label = source === 'db' ? 'DB 저장됨' : '로컬 저장됨';
  el.innerHTML = `
    <span style="font-size:10px;color:var(--text-dim);">${icon} ${label}</span>
  `;
}
