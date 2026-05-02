import express from 'express';

const router = express.Router();

// ── 사주 계산 상수 ──
const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_KR  = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCH_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const ANIMALS  = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
const STEM_ELEM  = ['목','목','화','화','토','토','금','금','수','수'];
const BRANCH_ELEM = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const SIPSIN_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];

// 절기 테이블 (한국천문연구원 기준)
const JEOLGI = {
  2020:[4,5,4,5,5,6,7,7,8,7,7,6], 2021:[3,5,4,5,5,7,7,7,8,7,7,5],
  2022:[4,6,5,5,6,6,7,8,8,7,7,5], 2023:[4,6,5,6,6,7,7,8,8,8,8,6],
  2024:[4,5,4,5,5,6,6,7,8,7,7,6], 2025:[3,5,5,5,5,7,7,7,8,7,7,5],
  2026:[4,6,5,5,6,7,7,8,8,7,7,6], 2027:[4,6,5,6,6,7,7,8,8,8,7,5],
  2028:[4,5,4,5,5,6,7,7,7,7,7,6],
};
const JEOLGI_MONTHS = [2,3,4,5,6,7,8,9,10,11,12,1];

function getSajuMonth(y, m, d) {
  const tbl = JEOLGI[y] || JEOLGI[2025];
  for (let i = 11; i >= 0; i--) {
    const jm = JEOLGI_MONTHS[i], jd = tbl[i];
    if (i === 11) { if (m === 1 && d >= jd) return 12; }
    else { if (m === jm && d >= jd) return i + 1; }
  }
  return m === 1 ? 12 : 1;
}

function yearPillar(y) { return { s: ((y-4)%10+10)%10, b: ((y-4)%12+12)%12 }; }
function monthPillar(y,m,d) {
  const sm = getSajuMonth(y,m,d), ys = yearPillar(y).s;
  return { s: ((ys%5)*2+sm+1)%10, b: (sm+1)%12 };
}
function dayPillar(date) {
  const base = new Date('1900-01-31T00:00:00Z');
  const diff = Math.floor((date - base) / 86400000);
  return { s: ((diff%10)+10)%10, b: ((diff%12)+12)%12 };
}
function hourPillar(ds, h) {
  if (h < 0) return { s: -1, b: -1 }; // 모름
  const hb = Math.floor(((h+1)%24)/2);
  return { s: ((ds%5)*2+hb)%10, b: hb };
}

function buildSaju(birthDate, inputHour) {
  const y = birthDate.getFullYear(), m = birthDate.getMonth()+1, d = birthDate.getDate();
  const yp = yearPillar(y);
  const mp = monthPillar(y,m,d);
  const dp = dayPillar(birthDate);
  const hp = hourPillar(dp.s, inputHour);
  return [
    { label:'연주 (年柱)', ...yp },
    { label:'월주 (月柱)', ...mp },
    { label:'일주 (日柱)', ...dp },
    { label:'시주 (時柱)', ...hp },
  ];
}

function elemCount(pillars) {
  const c = {목:0,화:0,토:0,금:0,수:0};
  pillars.forEach(p => {
    if (p.s >= 0) c[STEM_ELEM[p.s]]++;
    if (p.b >= 0) c[BRANCH_ELEM[p.b]]++;
  });
  return c;
}

function pillarToObj(p) {
  const unknown = p.s === -1;
  return {
    label: p.label,
    stemChar: unknown ? '?' : STEMS[p.s],
    branchChar: unknown ? '?' : BRANCHES[p.b],
    stemKr: unknown ? '?' : STEM_KR[p.s],
    branchKr: unknown ? '?' : BRANCH_KR[p.b],
    stemElem: unknown ? null : STEM_ELEM[p.s],
    branchElem: unknown ? null : BRANCH_ELEM[p.b],
    animal: unknown ? null : ANIMALS[p.b],
    unknown,
  };
}

// GET /api/fortune?birth=1981-12-17&hour=7
router.get('/', (req, res) => {
  const { birth, hour } = req.query;
  if (!birth) return res.status(400).json({ ok: false, error: 'birth required (YYYY-MM-DD)' });

  const birthDate = new Date(birth + 'T00:00:00Z');
  if (isNaN(birthDate.getTime())) return res.status(400).json({ ok: false, error: 'invalid birth date' });

  const h = hour === undefined ? -1 : parseInt(hour);
  const pillars = buildSaju(birthDate, h);
  const today = new Date();
  const todayPillars = buildSaju(today, today.getHours());
  const elems = elemCount(todayPillars);

  // 일간 기준 십신
  const dayPillarBirth = pillars[2];
  const dayPillarToday = todayPillars[2];
  const sipsinIdx = dayPillarBirth.s >= 0 && dayPillarToday.s >= 0
    ? ((dayPillarToday.s - dayPillarBirth.s) + 10) % 10
    : -1;

  res.json({
    ok: true,
    birth: { date: birth, hour: h },
    pillars: pillars.map(pillarToObj),
    today: {
      pillars: todayPillars.map(pillarToObj),
      elements: elems,
      sipsin: sipsinIdx >= 0 ? SIPSIN_NAMES[sipsinIdx] : null,
      date: today.toISOString().slice(0,10),
    },
  });
});

export default router;
