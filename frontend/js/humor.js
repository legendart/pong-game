import { API_BASE, HAS_BACKEND } from './config.js';

let HUMOR_CACHE = null;

async function initHumorData() {
  if (!HAS_BACKEND) return;
  try {
    const res = await fetch(`${API_BASE}/api/content/humor`);
    if (!res.ok) throw new Error('Failed to load humor content');
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length) HUMOR_CACHE = json.data;
  } catch (e) {
    console.warn('Humor content load failed:', e);
  }
}

const AJAE_JOKES = [
  { category: '동물', setup: '왜 코끼리는 컴퓨터를 잘 할까요?', punchline: '코(코드)를 잘 다루니까요 🐘' },
  { category: '음식', setup: '왜 라면은 꼬불꼬불할까요?', punchline: '스트레이트는 심심하니까요 🍜' },
  { category: '학교', setup: '왜 수학은 어려울까요?', punchline: 'x가 어디 있는지 항상 찾아야 하니까요 📐' },
  { category: '생활', setup: '왜 우산은 펼칠까요?', punchline: '접으면 지팡이니까요 ☂️' },
  { category: '자연', setup: '왜 눈은 하얀색일까요?', punchline: '핑크 눈이면 이상하잖아요 🌨️' },
  { category: '인터넷', setup: '왜 와이파이는 비밀번호가 있을까요?', punchline: '없으면 옆집이 다 써버리니까요 📶' },
  { category: '한국', setup: '왜 한국인은 나이를 물어볼까요?', punchline: '존댓말을 써야 하나 봐야 하니까요 🎂' },
  { category: '감정', setup: '왜 웃으면 좋을까요?', punchline: '울면 눈물이 나니까요 😊' },
  { category: '스포츠', setup: '왜 축구공은 둥글까요?', punchline: '네모면 굴러가지 않으니까요 ⚽' },
  { category: '여행', setup: '왜 비행기는 하늘을 날까요?', punchline: '땅에서 달리면 버스니까요 ✈️' },
];

let _currentHumor = null;

function mkRand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

function getHumorItems() {
  return Array.isArray(HUMOR_CACHE) && HUMOR_CACHE.length ? HUMOR_CACHE : AJAE_JOKES;
}

export function renderHumor(seed) {
  const items = getHumorItems();
  const rnd = mkRand(seed || Date.now());
  _currentHumor = items[Math.floor(rnd() * items.length)] || items[0];
  document.getElementById('humor-setup').textContent = _currentHumor.setup;
  document.getElementById('humor-punchline').textContent = _currentHumor.punchline;
  document.getElementById('humor-punchline-wrap').style.display = 'none';
  document.getElementById('humor-reaction').style.display = 'none';
  document.getElementById('humor-btn').textContent = '🤔 정답 보기';
}

export function revealPunchline() {
  if (!_currentHumor) return;
  document.getElementById('humor-punchline-wrap').style.display = 'block';
  document.getElementById('humor-reaction').style.display = 'block';
  document.getElementById('humor-reaction').textContent = ['🤣','😆','😂','😉'][Math.floor(Math.random() * 4)];
}

export function nextHumor() {
  renderHumor(Date.now() + Math.floor(Math.random() * 100000));
}

export { initHumorData };
