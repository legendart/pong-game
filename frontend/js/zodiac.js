// ── 별자리 모듈 ──
import { API_BASE, HAS_BACKEND } from './config.js';

// 캐시
let ZODIAC_CACHE = null;

// API에서 별자리 데이터 로드
async function loadZodiacData() {
  if (!HAS_BACKEND) return null;
  if (ZODIAC_CACHE) return ZODIAC_CACHE;
  try {
    const res = await fetch(`${API_BASE}/api/content/zodiac`);
    if (!res.ok) throw new Error('Failed to load zodiac data');
    const data = await res.json();
    ZODIAC_CACHE = data.data;
    return ZODIAC_CACHE;
  } catch (e) {
    console.warn('Failed to load zodiac from API:', e);
    return null;
  }
}

// ── 별자리 ──
async function getZodiac(bd) {
  const zodiacData = await loadZodiacData();
  if (!zodiacData) return null; // fallback needed
  const m = bd.getMonth() + 1, d = bd.getDate();
  for (const z of zodiacData) {
    const fm = z.from_month, fd = z.from_day, tm = z.to_month, td = z.to_day;
    if (fm > tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td)) return z;
    } else {
      if ((m === fm && d >= fd) || (m > fm && m < tm) || (m === tm && d <= td)) return z;
    }
  }
  return zodiacData[11];
}

// ── 운세 텍스트 생성 ──
function makeFortune(todayPillars, rand) {
  const dp=todayPillars[2], elem=STEM_ELEM[dp.s], branch=dp.b;
  const animal=ANIMAL_KR[branch], animalEmoji=ANIMALS[branch];
  const stemStr=STEMS[dp.s]+BRANCHES[dp.b];
  const texts=[
    `오늘은 <b style="color:var(--gold-l)">${elem} ${ELEM_EMOJI[elem]}</b>의 기운이 강하게 흐릅니다. ${animalEmoji} ${animal}의 날인 <b style="color:var(--gold-l)">${stemStr}일</b>, 집중과 꾸준함이 빛을 발합니다. 오전 중 중요한 결정을 내리는 것이 유리하며, 오후엔 새로운 인연이 찾아올 수 있습니다.`,
    `<b style="color:var(--gold-l)">${stemStr}일</b>, 하늘의 기운은 변화와 유연함을 요구합니다 ${animalEmoji}. 고집보다 경청이 더 좋은 결과를 가져옵니다. <b style="color:var(--gold-l)">${elem} ${ELEM_EMOJI[elem]}</b>의 흐름을 타면 재물운도 살짝 열립니다.`,
    `오늘 <b style="color:var(--gold-l)">${stemStr}일</b>은 인간관계에서 따뜻한 에너지가 넘칩니다 ${animalEmoji}. 오늘 만나는 사람이 귀인이 될 수 있으니 새로운 만남에 열린 마음을 가지세요.`,
  ];
  const overall=Math.floor(rand()*2)+3, love=Math.floor(rand()*2)+3, money=Math.floor(rand()*2)+3;
  const colors={'목':'초록색','화':'빨간색','토':'노란색','금':'흰색','수':'검은색'};
  const dirs=['동쪽','서쪽','남쪽','북쪽'];
  return {
    text:texts[Math.floor(rand()*texts.length)],
    scores:[{l:'종합운',v:overall},{l:'애정운',v:love},{l:'재물운',v:money}],
    tips:[{e:'🎨',l:'오늘의 색',v:colors[elem]},{e:'🔢',l:'행운 숫자',v:String(Math.floor(rand()*9)+1)},{e:'🧭',l:'행운 방향',v:dirs[Math.floor(rand()*dirs.length)]}],
    animal:animalEmoji, animalName:`${animal}의 날 · ${stemStr}`,
  };
}

// ══════════════════════════════════════════
// ── 4. 주간 데이터 빌드 (오늘=0부터 7일) ──

export { ZODIAC, ZF, Z_DETAIL_MSGS, Z_TIPS, DAYS_KR2, getZodiac };
