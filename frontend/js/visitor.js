// ── 방문자 카운터 모듈 ──
import { hitVisitor, getVisitorStats, HAS_BACKEND } from './api.js';

const LS_KEY = 'javis_visitor';

function animateNum(el, target) {
  if (!el) return;
  const steps = 30, dur = 800;
  const start = parseInt(el.textContent.replace(/,/g,'')) || 0;
  const inc = (target - start) / steps;
  let cur = start, step = 0;
  const t = setInterval(() => {
    step++;
    cur += inc;
    el.textContent = Math.round(cur).toLocaleString();
    if (step >= steps) { el.textContent = target.toLocaleString(); clearInterval(t); }
  }, dur / steps);
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}

function saveLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

export async function initVisitorCounter() {
  const today = new Date().toISOString().slice(0,10);
  let data = loadLocal();
  if (!data.total)      data.total = 0;
  if (!data.lastDate)   data.lastDate = '';
  if (!data.streak)     data.streak = 0;
  if (!data.todayCount) data.todayCount = 0;
  if (!data.firstVisit) data.firstVisit = today;

  const isNewDay = data.lastDate !== today;
  if (isNewDay) {
    const yd = new Date(Date.now()-86400000).toISOString().slice(0,10);
    data.streak = data.lastDate === yd ? data.streak + 1 : 1;
    data.todayCount = 0;
    data.lastDate = today;
  }
  data.total++;
  data.todayCount++;
  saveLocal(data);

  // UI 즉시 반영
  setTimeout(() => {
    animateNum(document.getElementById('vc-total'),  data.total);
    animateNum(document.getElementById('vc-today'),  data.todayCount);
    animateNum(document.getElementById('vc-streak'), data.streak);

    const msgEl = document.getElementById('vc-msg');
    if (msgEl) {
      msgEl.textContent =
        data.streak >= 7 ? `🔥 ${data.streak}일 연속 방문 중! 대단한 열정!` :
        data.streak >= 3 ? `🔥 ${data.streak}일 연속 방문 중! 잘하고 있어요!` :
        data.streak === 2 ? '이틀 연속 방문이네요! 좋은 습관이에요 😊' :
        isNewDay ? '오늘 첫 방문이에요! 어서오세요 🌟' : '오늘도 다시 방문했네요! 😄';
    }
  }, 300);

  // hits 배지
  const badgeEl = document.getElementById('vc-badge');
  const labelEl = document.getElementById('vc-badge-label');
  if (badgeEl) {
    badgeEl.src = 'https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Flegendart.github.io%2Fpong-game&count_bg=%23C9A84C&title_bg=%23160B2C&icon=star.svg&icon_color=%23F0D080&title=total&edge_flat=true';
    if (labelEl) labelEl.style.display = 'inline';
  }

  // 백엔드 DB 업데이트 (가능하면)
  if (HAS_BACKEND) {
    try {
      const result = await hitVisitor();
      if (result.ok && result.total > data.total) {
        animateNum(document.getElementById('vc-total'), result.total);
        data.total = result.total;
        saveLocal(data);
      }
    } catch {}
  }
}
