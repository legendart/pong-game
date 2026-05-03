import { API_BASE, HAS_BACKEND } from './config.js';

const TIMEOUT_MS = 8000;

async function apiFetch(path, options = {}) {
  if (!HAS_BACKEND) throw new Error('NO_BACKEND');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── 사주 API ──
export async function fetchFortune(birth, hour) {
  const q = `birth=${encodeURIComponent(birth)}&hour=${hour}`;
  return apiFetch(`/api/fortune?${q}`);
}

// ── 역사 API ──
export async function fetchHistory(month, day) {
  return apiFetch(`/api/history?month=${month}&day=${day}`);
}

// ── 방문자 API ──
export async function hitVisitor(deviceId = null) {
  return apiFetch('/api/visitors/hit', { 
    method: 'POST',
    body: JSON.stringify({ deviceId })
  });
}
export async function getVisitorStats() {
  return apiFetch('/api/visitors/stats');
}

// ── 사용자 프로필 API ──
export async function getUser(deviceId) {
  return apiFetch(`/api/users/${encodeURIComponent(deviceId)}`);
}
export async function saveUser(deviceId, name, birth, hour) {
  return apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ deviceId, name, birth, hour }),
  });
}
export async function deleteUser(deviceId) {
  return apiFetch(`/api/users/${encodeURIComponent(deviceId)}`, { method: 'DELETE' });
}

// ── 헬스체크 ──
export async function checkHealth() {
  return apiFetch('/api/health');
}
