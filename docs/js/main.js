// ── main.js - 앱 진입점 ──
import { STEMS, BRANCHES, STEM_KR, BRANCH_KR, ANIMALS, ANIMAL_KR,
         STEM_ELEM, BRANCH_ELEM, ELEM_COLOR, ELEM_EMOJI,
         SIPSIN_NAMES, SIPSIN_MEANING, DAYS_KR,
         JEOLGI, JEOLGI_MONTHS, CHUNG_BRANCH, HAP_BRANCH,
         JIJANGAN_MAP, SIPSIN_FORTUNE, dayPillar } from './saju.js';
import { ZODIAC, ZF, Z_DETAIL_MSGS, Z_TIPS, WEEK_MSGS, loadZodiacContent } from './zodiac.js';
import { drawChart, renderLabels, openDetailModal, closeDetail } from './chart.js';
import { getCheerMsg, initCheerData } from './cheer.js';
import { getAgeGroup, renderFoodRecommendation, initFoodData } from './food.js';
import { renderHumor, revealPunchline, nextHumor, initHumorData } from './humor.js';
import { initVisitorCounter } from './visitor.js';
import { HAS_BACKEND } from './config.js';

let _sajuWeekData = [];
let _zWeekData = [];
let _currentTab = 'world';

// ── 사주 주간 카드 클릭 → 상세 모달 ──
function openSajuDetail(idx) {
  const d = _sajuWeekData[idx]; if (!d) return;
  const { dp, sipsin, hasHap, hasChung, isToday } = d;
  const anim = ANIMAL_KR[dp.b], animEmoji = ANIMALS[dp.b];
  const hapMsg = hasHap
    ? '<br><span style="color:#7edd9a">⚡ 일지합 — 귀인·협력 에너지 상승</span>'
    : hasChung
      ? '<br><span style="color:#e05c5c">🔥 일지충 — 변화·이동·긴장 주의</span>'
      : '';
  const dateLabel = isToday
    ? `오늘 (${DAYS_KR[d.date.getDay()]})`
    : `${d.date.getMonth()+1}월 ${d.date.getDate()}일 (${DAYS_KR[d.date.getDay()]})`;
  const bar = (v, color, label) =>
    `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:11px;color:var(--gold);">${label}</span>
        <span style="font-size:11px;color:${color};">${v}/5</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${(v/5)*100}%;background:${color};border-radius:99px;"></div>
      </div>
    </div>`;
  const barsHtml = bar(d.overall,'#c9a84c','종합운') + bar(d.love,'#7eb8f7','애정운') + bar(d.money,'#7edd9a','재물운') +
    `<div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px;margin-top:4px;">
      <div style="font-size:11px;color:var(--gold);margin-bottom:4px;">📐 십신 분석</div>
      <div style="font-size:13px;color:var(--gold-l);font-weight:600;">${sipsin}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">${SIPSIN_MEANING[sipsin]||''}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">지장간: ${JIJANGAN_MAP[dp.b]}</div>
    </div>`;
  openDetailModal(
    d.date, animEmoji,
    `${dateLabel}<br><span style="font-size:13px;font-family:'Noto Serif KR',serif;color:var(--gold-l);">${STEMS[dp.s]}${BRANCHES[dp.b]}일</span>`,
    `${animEmoji} ${anim}의 날 · ${STEM_ELEM[dp.s]} ${ELEM_EMOJI[STEM_ELEM[dp.s]]}${hapMsg}`,
    barsHtml,
    SIPSIN_FORTUNE[sipsin] || '오늘 하루도 좋은 기운이 흐릅니다.',
    [
      { e: ELEM_EMOJI[STEM_ELEM[dp.s]], l: '천간 오행', v: STEM_ELEM[dp.s] },
      { e: ELEM_EMOJI[BRANCH_ELEM[dp.b]], l: '지지 오행', v: BRANCH_ELEM[dp.b] },
      { e: hasHap ? '💚' : hasChung ? '🔴' : '⚪', l: hasHap ? '일지합' : hasChung ? '일지충' : '평온', v: hasHap ? '합(吉)' : hasChung ? '충(注意)' : '안정' },
    ]
  );
}

// ── 별자리 주간 카드 클릭 → 상세 모달 ──
function openZDetail(idx) {
  const d = _zWeekData[idx]; if (!d) return;
  const z = d.zodiac;
  const dateLabel = d.isToday
    ? `오늘 (${DAYS_KR[d.date.getDay()]})`
    : `${d.date.getMonth()+1}월 ${d.date.getDate()}일 (${DAYS_KR[d.date.getDay()]})`;
  const bar = (v, color, label) =>
    `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:11px;color:var(--gold);">${label}</span>
        <span style="font-size:11px;color:${color};">${v}/5</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${(v/5)*100}%;background:${color};border-radius:99px;"></div>
      </div>
    </div>`;
  const barsHtml = bar(d.overall,'#c9a84c','전체운') + bar(d.social,'#b57bee','대인운') + bar(d.career,'#7eb8f7','직업운');
  const si = d.tipIdx % Z_TIPS.length;
  const tips = [Z_TIPS[si], Z_TIPS[(si+1)%Z_TIPS.length], Z_TIPS[(si+2)%Z_TIPS.length]].filter(Boolean);
  openDetailModal(
    d.date, z.symbol,
    `${dateLabel}<br><span style="font-size:13px;color:var(--gold-l);">${z.name} ${z.symbol}</span>`,
    `원소: ${z.elem} · 지배성: ${z.ruling} · ${z.keyword}`,
    barsHtml, d.msg, tips
  );
}

// 전역 노출 (HTML onclick 속성에서 사용)
window.closeDetail = closeDetail;
window.revealPunchline = revealPunchline;
window.nextHumor = nextHumor;
window.switchTab = switchTab;
window.openSajuDetail = openSajuDetail;
window.openZDetail = openZDetail;

// ── 2. 유틸 함수 ──
// ══════════════════════════════════════════
function mkRand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
function todaySeed(birthMs) {
  const d = new Date();
  return (d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate()) * 31 + (birthMs % 9973);
}
function dateSeed(date, birthMs) {
  return (date.getFullYear()*10000 + (date.getMonth()+1)*100 + date.getDate()) * 31 + (birthMs % 9973);
}

// ── 카툰 SVG ──
function cartoonSVG(level, s=64) {
  const C = {
    high:{bg:'#1a1000',circle:'#c9a84c',face:'#ffe4a0',cheek:'#ffb347',eye:'#5c3200',mouth:'M-6,2 Q0,8 6,2'},
    mid:{bg:'#091422',circle:'#4a7eb5',face:'#b8d4f0',cheek:'#7eb8f7',eye:'#1a3a5c',mouth:'M-6,2 Q0,5 6,2'},
    low:{bg:'#110822',circle:'#6644aa',face:'#c8b4e8',cheek:'#9966cc',eye:'#2a1a4a',mouth:'M-6,4 Q0,1 6,4'},
  }[level]||{bg:'#091422',circle:'#4a7eb5',face:'#b8d4f0',cheek:'#7eb8f7',eye:'#1a3a5c',mouth:'M-6,2 Q0,5 6,2'};
  const cx=s/2, cy=s/2;
  const sparkles = level==='high'
    ? `<text x="${s*.1}" y="${s*.22}" font-size="${s*.18}" fill="#f0d080" opacity=".9">✦</text><text x="${s*.72}" y="${s*.18}" font-size="${s*.13}" fill="#f0d080" opacity=".7">✦</text>`
    : level==='low'
    ? `<text x="${s*.68}" y="${s*.2}" font-size="${s*.18}" fill="#b57bee" opacity=".7">☽</text>`
    : `<text x="${s*.72}" y="${s*.2}" font-size="${s*.13}" fill="#7eb8f7" opacity=".6">⚡</text>`;
  const eyesClosed = level==='low'
    ? `<ellipse cx="${cx-s*.13}" cy="${cy-s*.06}" rx="${s*.06}" ry="${s*.025}" fill="${C.eye}"/><ellipse cx="${cx+s*.13}" cy="${cy-s*.06}" rx="${s*.06}" ry="${s*.025}" fill="${C.eye}"/>`
    : `<circle cx="${cx-s*.13}" cy="${cy-s*.06}" r="${s*.06}" fill="${C.eye}"/><circle cx="${cx+s*.13}" cy="${cy-s*.06}" r="${s*.06}" fill="${C.eye}"/><circle cx="${cx-s*.11}" cy="${cy-s*.08}" r="${s*.02}" fill="white"/><circle cx="${cx+s*.15}" cy="${cy-s*.08}" r="${s*.02}" fill="white"/>`;
  const brows = level==='high'
    ? `<path d="M${cx-s*.21},${cy-s*.14} Q${cx-s*.13},${cy-s*.19} ${cx-s*.06},${cy-s*.15}" stroke="${C.eye}" stroke-width="${s*.025}" fill="none" stroke-linecap="round"/><path d="M${cx+s*.06},${cy-s*.15} Q${cx+s*.13},${cy-s*.19} ${cx+s*.21},${cy-s*.14}" stroke="${C.eye}" stroke-width="${s*.025}" fill="none" stroke-linecap="round"/>`
    : level==='low'
    ? `<path d="M${cx-s*.21},${cy-s*.13} Q${cx-s*.13},${cy-s*.11} ${cx-s*.06},${cy-s*.13}" stroke="${C.eye}" stroke-width="${s*.02}" fill="none" stroke-linecap="round"/><path d="M${cx+s*.06},${cy-s*.13} Q${cx+s*.13},${cy-s*.11} ${cx+s*.21},${cy-s*.13}" stroke="${C.eye}" stroke-width="${s*.02}" fill="none" stroke-linecap="round"/>` : '';
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${s}" height="${s}" rx="${s*.18}" fill="${C.bg}"/>
    <circle cx="${cx}" cy="${cy}" r="${s*.38}" fill="${C.circle}" opacity=".2"/>
    ${sparkles}
    <ellipse cx="${cx}" cy="${cy+s*.02}" rx="${s*.22}" ry="${s*.24}" fill="${C.face}"/>
    <circle cx="${cx-s*.13}" cy="${cy+s*.08}" r="${s*.07}" fill="${C.cheek}" opacity=".45"/>
    <circle cx="${cx+s*.13}" cy="${cy+s*.08}" r="${s*.07}" fill="${C.cheek}" opacity=".45"/>
    ${brows}${eyesClosed}
    <path d="M${cx+parseFloat(C.mouth.split('M')[1].split(',')[0])},${cy+s*.1+parseFloat(C.mouth.split('M')[1].split(',')[1].split(' ')[0])} Q${cx},${cy+s*.1+parseFloat(C.mouth.split('Q')[1].split(',')[1])} ${cx+parseFloat(C.mouth.split('Q')[1].split(' ')[1])},${cy+s*.1+parseFloat(C.mouth.split('Q')[1].split(' ')[2])}" stroke="${C.eye}" stroke-width="${s*.04}" fill="none" stroke-linecap="round"/>
  </svg>`;
}
function zodiacSVG(symbol, elem, s=56) {
  const col={'불':'#e05c5c','흙':'#c9a84c','공기':'#7eb8f7','물':'#6680cc'}[elem]||'#b57bee';
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${s}" height="${s}" rx="${s*.22}" fill="rgba(10,5,20,.9)"/>
    <circle cx="${s/2}" cy="${s/2}" r="${s*.42}" fill="${col}" opacity=".18"/>
    <circle cx="${s/2}" cy="${s/2}" r="${s*.42}" fill="none" stroke="${col}" stroke-width="${s*.025}" opacity=".5"/>
    <text x="${s/2}" y="${s*.66}" text-anchor="middle" font-size="${s*.44}" fill="${col}">${symbol}</text>
    <circle cx="${s*.78}" cy="${s*.22}" r="${s*.07}" fill="${col}" opacity=".6"/>
    <circle cx="${s*.2}" cy="${s*.78}" r="${s*.05}" fill="${col}" opacity=".4"/>
  </svg>`;
}

// ══════════════════════════════════════════
// ── 3. 사주 계산 (정확도 개선판) ──
// ══════════════════════════════════════════
function getSajuMonth(y, m, d) {
  const tbl = JEOLGI[y] || JEOLGI[2025];
  for (let i = 11; i >= 0; i--) {
    const jm = JEOLGI_MONTHS[i], jd = tbl[i];
    if (i === 11) { // 소한: 1월
      if (m === 1 && d >= jd) return 12;
    } else {
      if (m === jm && d >= jd) return i + 1;
    }
  }
  return (m === 1) ? 12 : 1;
}
function yearPillar(y)    { return {s:((y-4)%10+10)%10, b:((y-4)%12+12)%12}; }
function monthPillar(y,m,d){ const sm=getSajuMonth(y,m,d), ys=yearPillar(y).s; return {s:((ys%5)*2+sm+1)%10, b:(sm+1)%12}; }
function hourPillar(ds,h)  { const hb=Math.floor(((h+1)%24)/2); return {s:((ds%5)*2+hb)%10, b:hb}; }
function kstToTrueSolar(h) { return Math.max(0, h - 1); } // 진태양시 간략 보정 (KST -32분 ≈ -1시간)
function buildSaju(bd, inputHour) {
  const y=bd.getFullYear(), m=bd.getMonth()+1, d=bd.getDate();
  const yp=yearPillar(y), mp=monthPillar(y,m,d), dp=dayPillar(bd);
  if(parseInt(inputHour)===-1) {
    // 시간 모름: 시주는 ? 표시
    return [{label:'연주 (年柱)',...yp},{label:'월주 (月柱)',...mp},{label:'일주 (日柱)',...dp},{label:'시주 (時柱)',s:-1,b:-1}];
  }
  const th=kstToTrueSolar(inputHour);
  const hp=hourPillar(dp.s,th);
  return [{label:'연주 (年柱)',...yp},{label:'월주 (月柱)',...mp},{label:'일주 (日柱)',...dp},{label:'시주 (時柱)',...hp}];
}
function todaySaju() { const n=new Date(); return buildSaju(n,n.getHours()); }
function elemCount(pillars) {
  const c={'목':0,'화':0,'토':0,'금':0,'수':0};
  pillars.forEach(p=>{
    if(p.s!==-1) c[STEM_ELEM[p.s]]++;
    if(p.b!==-1) c[BRANCH_ELEM[p.b]]++;
  });
  return c;
}
function getSipsin(ds,ts) { return SIPSIN_NAMES[((ts-ds)+10)%10]; }
function checkChung(b1,b2){ return CHUNG_BRANCH.some(([a,b])=>(b1===a&&b2===b)||(b1===b&&b2===a)); }
function checkHap(b1,b2)  { return HAP_BRANCH.some(([a,b])=>(b1===a&&b2===b)||(b1===b&&b2===a)); }

// ── 별자리 ──
function getZodiac(bd) {
  const m=bd.getMonth()+1, d=bd.getDate();
  for (const z of ZODIAC) {
    const [fm,fd]=z.from,[tm,td]=z.to;
    if (fm>tm) { if((m===fm&&d>=fd)||(m===tm&&d<=td)) return z; }
    else { if((m===fm&&d>=fd)||(m>fm&&m<tm)||(m===tm&&d<=td)) return z; }
  }
  return ZODIAC[11];
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
// ══════════════════════════════════════════
function buildSajuWeekData(bd, hour) {
  const now=new Date(), birthPillars=buildSaju(bd,hour), birthDay=birthPillars[2];
  return Array.from({length:7},(_,i)=>{
    const d=new Date(now); d.setDate(now.getDate()+i);
    const dp=dayPillar(d);
    const ss=getSipsin(birthDay.s,dp.s);
    const hasHap=checkHap(birthDay.b,dp.b), hasChung=checkChung(birthDay.b,dp.b);
    const base={'비견':3.5,'겁재':3,'식신':4,'상관':3.5,'편재':4,'정재':4.5,'편관':3,'정관':4.5,'편인':3.5,'정인':4}[ss]||3.5;
    const r=mkRand(dateSeed(d,bd.getTime())*23);
    const overall=Math.min(5,Math.max(2,+(base+(r()-.5)*1.2+(hasHap?.3:0)+(hasChung?-.3:0)).toFixed(1)));
    const love=+(2.5+r()*2.5).toFixed(1), money=+(2.5+r()*2.5).toFixed(1);
    const level=overall>=4?'high':overall>=3?'mid':'low';
    return {date:d,dp,overall,love,money,level,sipsin:ss,hasHap,hasChung,birthDay,isToday:i===0};
  });
}

function buildZWeekData(bd) {
  const now=new Date(), z=getZodiac(bd);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(now); d.setDate(now.getDate()+i);
    const r=mkRand(dateSeed(d,bd.getTime())*31);
    const overall=+(2.5+r()*2.5).toFixed(1), social=+(2.5+r()*2.5).toFixed(1), career=+(2.5+r()*2.5).toFixed(1);
    const level=overall>=4?'high':overall>=3?'mid':'low';
    const msgs=Z_DETAIL_MSGS[level];
    const msg=msgs[Math.floor(r()*msgs.length)];
    const tipIdx=Math.floor(r()*Z_TIPS.length);
    return {date:d,overall,social,career,level,msg,tipIdx,zodiac:z,isToday:i===0};
  });
}

// ══════════════════════════════════════════
// ── 5. 공용 캔버스 차트 렌더 ──

// ── 6. 주간 카드 렌더 ──
// ══════════════════════════════════════════
function renderSajuWeekCards() {
  document.getElementById('saju-week-cards').innerHTML=_sajuWeekData.map((d,i)=>{
    const _wmsgs=WEEK_MSGS[d.level]||[];const msg=_wmsgs.length?_wmsgs[Math.floor(Math.random()*_wmsgs.length)]:'';
    const bar=v=>'█'.repeat(Math.round(v)).padEnd(5,'░');
    const isToday=d.isToday, bdr=isToday?'2px solid rgba(201,168,76,.6)':'1px solid '+({high:'rgba(201,168,76,.35)',mid:'rgba(150,150,180,.2)',low:'rgba(120,100,160,.25)'}[d.level]);
    const bg={high:'rgba(201,168,76,.15)',mid:'rgba(100,100,120,.12)',low:'rgba(80,60,120,.12)'}[d.level];
    const dateStr=isToday?`오늘 (${DAYS_KR[d.date.getDay()]})`:`${d.date.getMonth()+1}월 ${d.date.getDate()}일 (${DAYS_KR[d.date.getDay()]})`;
    return `<div onclick="openSajuDetail(${i})" style="background:${bg};border:${bdr};border-radius:14px;padding:12px 14px;display:flex;gap:12px;align-items:center;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
      <div style="flex-shrink:0;">${cartoonSVG(d.level,60)}</div>
      <div style="flex:1;min-width:0;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
          <div style="font-size:12px;font-weight:600;color:var(--gold-l);">${dateStr}${isToday?' 📍':''}</div>
          <div style="font-size:13px;font-weight:700;color:${d.level==='high'?'#f0d080':d.level==='mid'?'#aaa':'#9988cc'};">${d.overall}</div>
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;line-height:1.5;">${msg}</div>
        <div style="display:flex;gap:4px;font-size:9px;font-family:monospace;flex-wrap:wrap;">
          <span style="color:#c9a84c;">종합 ${bar(d.overall)}</span>
          <span style="color:#7eb8f7;">애정 ${bar(d.love)}</span>
          <span style="color:#7edd9a;">재물 ${bar(d.money)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderZWeekCards(zodiac) {
  document.getElementById('z-week-cards').innerHTML=_zWeekData.map((d,i)=>{
    const msgs=Z_DETAIL_MSGS[d.level];
    const msg=msgs[Math.floor(Math.random()*msgs.length)];
    const bar=v=>'█'.repeat(Math.round(v)).padEnd(5,'░');
    const isToday=d.isToday, bdr=isToday?'2px solid rgba(201,168,76,.6)':'1px solid '+({high:'rgba(201,168,76,.35)',mid:'rgba(150,150,180,.2)',low:'rgba(120,100,160,.25)'}[d.level]);
    const bg={high:'rgba(201,168,76,.15)',mid:'rgba(100,100,120,.12)',low:'rgba(80,60,120,.12)'}[d.level];
    const dateStr=isToday?`오늘 (${DAYS_KR[d.date.getDay()]})`:`${d.date.getMonth()+1}월 ${d.date.getDate()}일 (${DAYS_KR[d.date.getDay()]})`;
    return `<div onclick="openZDetail(${i})" style="background:${bg};border:${bdr};border-radius:14px;padding:12px 14px;display:flex;gap:12px;align-items:center;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
      <div style="flex-shrink:0;">${zodiacSVG(zodiac.symbol,zodiac.elem,60)}</div>
      <div style="flex:1;min-width:0;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
          <div style="font-size:12px;font-weight:600;color:var(--gold-l);">${dateStr}${isToday?' 📍':''}</div>
          <div style="font-size:13px;font-weight:700;color:${d.level==='high'?'#f0d080':d.level==='mid'?'#aaa':'#9988cc'};">${d.overall}</div>
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;line-height:1.5;">${msg}</div>
        <div style="display:flex;gap:4px;font-size:9px;font-family:monospace;flex-wrap:wrap;">
          <span style="color:#c9a84c;">전체 ${bar(d.overall)}</span>
          <span style="color:#b57bee;">대인 ${bar(d.social)}</span>
          <span style="color:#7eb8f7;">직업 ${bar(d.career)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════
// ── 7. 메인 render ──
// ══════════════════════════════════════════
async function render(user) {
  const {name,birth,hour}=user;
  const bd=new Date(birth), hb=parseInt(hour);
  const now=new Date();
  const today=todaySaju();
  const rand=mkRand(todaySeed(bd.getTime()));
  const fortune=makeFortune(today,rand);
  const elems=elemCount(today);
  const maxE=Math.max(...Object.values(elems));
  const zodiac=getZodiac(bd);

  // 날짜
  document.getElementById('date-badge').innerHTML=`📅 ${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${DAYS_KR[now.getDay()]}요일)`;

  // 응원 메시지 (매 접속마다 완전 랜덤)
  const cheer = getCheerMsg(bd, 0);
  document.getElementById('cheer-text').innerHTML = cheer.text;
  document.getElementById('cheer-source').textContent = cheer.src || '';
  const cheerImg = document.getElementById('cheer-img');
  if (cheerImg && cheer.img) {
    cheerImg.src = cheer.img;
    cheerImg.style.opacity = '0';
  }

  // 헤더/프로필
  document.getElementById('hdr-animal').textContent=fortune.animal;
  document.getElementById('p-avatar').textContent=fortune.animal;
  document.getElementById('p-name').textContent=name;
  document.getElementById('p-birth').textContent=`${bd.getFullYear()}년 ${bd.getMonth()+1}월 ${bd.getDate()}일생`;
  document.getElementById('banner-emoji').textContent=fortune.animal;
  document.getElementById('banner-text').textContent=fortune.animalName;

  // 4기둥
  document.getElementById('pillars').innerHTML=today.map(p=>{
    const unknown=p.s===-1;
    return `<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;transition:transform .2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
      <div style="font-size:10px;color:var(--gold);letter-spacing:.4px;margin-bottom:8px;">${p.label}</div>
      <span style="font-family:'Noto Serif KR',serif;font-size:${unknown?'20':'26'}px;font-weight:700;color:${unknown?'var(--text-dim)':'var(--gold-l)'};display:block;line-height:1;">${unknown?'?':''+STEMS[p.s]}</span>
      <span style="font-family:'Noto Serif KR',serif;font-size:${unknown?'16':'22'}px;color:var(--text);display:block;margin-top:3px;">${unknown?'?':''+BRANCHES[p.b]}</span>
      <div style="font-size:10px;color:var(--text-dim);margin-top:5px;">${unknown?'모름':STEM_KR[p.s]+BRANCH_KR[p.b]}</div>
    </div>`;}).join('');

  // 오행
  document.getElementById('elements').innerHTML=Object.entries(elems).map(([e,c])=>`
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="font-size:13px;width:36px;color:var(--text-dim);">${ELEM_EMOJI[e]} ${e}</div>
      <div style="flex:1;height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;"><div style="height:100%;width:${maxE?(c/maxE*100):0}%;background:${ELEM_COLOR[e]};border-radius:99px;transition:width 1s ease;"></div></div>
      <div style="font-size:12px;color:var(--text-dim);width:16px;text-align:right;">${c}</div>
    </div>`).join('');

  // 운세/점수/팁
  document.getElementById('fortune').innerHTML=fortune.text;
  document.getElementById('scores').innerHTML=fortune.scores.map(s=>`
    <div style="min-width:0;overflow:hidden;">
      <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px;letter-spacing:.5px;">${s.l}</div>
      <div style="font-size:13px;letter-spacing:1px;overflow:hidden;">${'⭐'.repeat(s.v)}${'☆'.repeat(5-s.v)}</div>
      <div style="font-size:18px;font-weight:700;color:var(--gold-l);margin-top:4px;">${s.v}<span style="font-size:11px;color:var(--text-dim);font-weight:400;">/5</span></div>
    </div>`).join('');
  document.getElementById('tips').innerHTML=fortune.tips.map(t=>`
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;">
      <span style="font-size:22px;display:block;margin-bottom:4px;">${t.e}</span>
      <div style="font-size:10px;color:var(--text-dim);">${t.l}</div>
      <div style="font-size:13px;color:var(--gold-l);font-weight:500;margin-top:3px;">${t.v}</div>
    </div>`).join('');

  // 음식 추천
  renderFoodRecommendation(bd, today, mkRand(todaySeed(bd.getTime())+1234));

  // 사주 주간 차트
  _sajuWeekData=buildSajuWeekData(bd,hb);
  renderLabels('saju-week-labels',_sajuWeekData,'openSajuDetail');
  drawChart('saju-week-chart',_sajuWeekData,
    [{vals:_sajuWeekData.map(d=>d.overall),color:'#c9a84c',fillAlpha:.15},
     {vals:_sajuWeekData.map(d=>d.love),color:'#7eb8f7',fillAlpha:.1},
     {vals:_sajuWeekData.map(d=>d.money),color:'#7edd9a',fillAlpha:.1}],
    openSajuDetail);
  renderSajuWeekCards();

  // 별자리 오늘
  const zRand=mkRand(todaySeed(bd.getTime())+7777);
  document.getElementById('z-symbol').textContent=zodiac.symbol;
  document.getElementById('z-name').textContent=zodiac.name+' '+zodiac.symbol;
  document.getElementById('z-period').textContent='📅 '+zodiac.period;
  document.getElementById('z-elem').textContent='원소: '+zodiac.elem+' · 지배성: '+zodiac.ruling+' · '+zodiac.keyword;
  const zTexts=ZF[zodiac.name]||ZF['사수자리'];
  document.getElementById('z-fortune').innerHTML=zTexts[Math.floor(zRand()*zTexts.length)];
  const zs=Math.floor(zRand()*2)+3, zl=Math.floor(zRand()*2)+3, zm=Math.floor(zRand()*2)+3;
  document.getElementById('z-scores').innerHTML=[{l:'전체운',v:zs},{l:'대인운',v:zl},{l:'직업운',v:zm}].map(s=>`
    <div style="min-width:0;overflow:hidden;">
      <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px;letter-spacing:.5px;">${s.l}</div>
      <div style="font-size:13px;letter-spacing:1px;">${'⭐'.repeat(s.v)}${'☆'.repeat(5-s.v)}</div>
      <div style="font-size:18px;font-weight:700;color:var(--gold-l);margin-top:4px;">${s.v}<span style="font-size:11px;color:var(--text-dim);font-weight:400;">/5</span></div>
    </div>`).join('');
  document.getElementById('z-tip').innerHTML=
    `🌟 <b style="color:var(--gold-l)">${zodiac.name}</b>의 핵심 에너지: <b style="color:var(--gold-l)">${zodiac.keyword}</b><br>`+
    `🪐 지배 행성 <b style="color:var(--gold-l)">${zodiac.ruling}</b>의 기운이 오늘 특히 강합니다.<br>`+
    `💫 원소 <b style="color:var(--gold-l)">${zodiac.elem}</b>의 특성을 살려 오늘 하루를 보내보세요.`;

  // 별자리 주간 차트
  _zWeekData=buildZWeekData(bd);
  renderLabels('z-week-labels',_zWeekData,'openZDetail');
  drawChart('z-week-chart',_zWeekData,
    [{vals:_zWeekData.map(d=>d.overall),color:'#c9a84c',fillAlpha:.15},
     {vals:_zWeekData.map(d=>d.social),color:'#b57bee',fillAlpha:.1},
     {vals:_zWeekData.map(d=>d.career),color:'#7eb8f7',fillAlpha:.1}],
    openZDetail);
  renderZWeekCards(zodiac);

  document.getElementById('modal').classList.add('hide');
  document.getElementById('app').style.display='block';

  // 유머
  const humorSeed=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate()+bd.getTime()%541;
  renderHumor(humorSeed);

  // 방문자 카운터
  initVisitorCounter();

  // 역사 이벤트 비동기 로딩
  fetchHistory();
}

// ══════════════════════════════════════════
// ── 8. 오늘의 역사 ──
// ══════════════════════════════════════════
function switchTab(tab) {
  _currentTab = tab;
  const wBtn=document.getElementById('tab-world');
  const kBtn=document.getElementById('tab-korea');
  const wEl=document.getElementById('history-world');
  const kEl=document.getElementById('history-korea');
  const on='flex:1;padding:8px;border-radius:10px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;cursor:pointer;border:1px solid var(--gold);background:rgba(201,168,76,.2);color:var(--gold-l);';
  const off='flex:1;padding:8px;border-radius:10px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text-dim);';
  if(tab==='world'){
    wBtn.setAttribute('style',on); kBtn.setAttribute('style',off);
    wEl.style.display='flex'; kEl.style.display='none';
  } else {
    kBtn.setAttribute('style',on); wBtn.setAttribute('style',off);
    kEl.style.display='flex'; wEl.style.display='none';
  }
}

function historyCardHTML(item) {
  const imgHTML=item.img
    ?`<img src="${item.img}" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:12px 12px 0 0;display:block;" onerror="this.style.display='none'">`
    :'';
  const linkHTML=item.url
    ?`<a href="${item.url}" target="_blank" rel="noopener" style="font-size:11px;color:var(--gold);text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-top:10px;">🔗 자세히 보기</a>`
    :'';
  return `<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    ${imgHTML}<div style="padding:14px;">
    <div style="display:inline-block;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);border-radius:8px;padding:3px 10px;font-size:11px;color:var(--gold);margin-bottom:10px;font-weight:600;">${item.year}</div>
    <div style="font-family:'Noto Serif KR',serif;font-size:14px;line-height:1.9;color:var(--text);">${item.text}</div>
    ${linkHTML}</div></div>`;
}

// fetch with timeout helper
function fetchTimeout(url, opts={}, ms=8000) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), ms);
  return fetch(url, {...opts, signal:controller.signal})
    .finally(()=>clearTimeout(timer));
}

async function fetchHistory() {
  const now=new Date();
  const m=now.getMonth()+1, d=now.getDate();
  const label=document.getElementById('history-date-label');
  if(label) label.textContent=`${m}월 ${d}일`;

  document.getElementById('history-loading').style.display='block';
  document.getElementById('history-error').style.display='none';
  document.getElementById('history-world').style.display='none';
  document.getElementById('history-korea').style.display='none';

  try {
    // ── 세계 이벤트: 영문 Wikipedia ──
    let worldItems=[];
    let koTitleMap={};  // 스코프 상위로 (Korea fallback에서도 사용)
    try {
      const res = await fetchTimeout(
        `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${m}/${d}`,
        {headers:{'Accept':'application/json'}}, 8000);
      if(res.ok) {
        const data=await res.json();
        const events=(data.events||[])
          .sort((a,b)=>(b.pages||[]).some(p=>p.thumbnail)-(a.pages||[]).some(p=>p.thumbnail))
          .slice(0,8);

        // 배치 langlinks → 한국어 제목
        const titles=events.map(ev=>(ev.pages||[])[0]?.title||'').filter(Boolean);
        koTitleMap={};
        if(titles.length) {
          try {
            const lr=await fetchTimeout(
              `https://en.wikipedia.org/w/api.php?action=query&titles=${titles.map(encodeURIComponent).join('|')}&prop=langlinks&lllang=ko&format=json&origin=*`,
              {}, 6000);
            if(lr.ok){
              const ld=await lr.json();
              Object.values(ld.query?.pages||{}).forEach(p=>{
                const kt=p.langlinks?.[0]?.['*'];
                if(p.title&&kt) koTitleMap[p.title]=kt;
              });
            }
          } catch(e){}
        }

        // 한국어 요약 병렬 수집
        const koMap={};
        await Promise.allSettled(Object.entries(koTitleMap).map(async([et,kt])=>{
          try {
            const sr=await fetchTimeout(
              `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kt)}`,
              {}, 6000);
            if(sr.ok){
              const sd=await sr.json();
              const txt=sd.extract||'';
              koMap[et]={text:txt.length>220?txt.slice(0,220)+'…':txt, url:sd.content_urls?.mobile?.page||sd.content_urls?.desktop?.page||''};
            }
          } catch(e){}
        }));

        worldItems=events.map(ev=>{
          const page=(ev.pages||[])[0]||{};
          const et=page.title||'';
          const ko=koMap[et];
          const yr=ev.year<0?`기원전 ${Math.abs(ev.year)}년`:`${ev.year}년`;
          return {
            year:yr,
            text:ko?.text||ev.text||'',
            img:page.thumbnail?.source||'',
            url:ko?.url||page.content_urls?.mobile?.page||page.content_urls?.desktop?.page||''
          };
        });
      }
    } catch(e){ console.warn('world fetch error:',e); }

    // ── 한국 이벤트: 한국어 Wikipedia → 없으면 영문에서 Korea 필터 ──
    let koreaItems=[];
    try {
      const kr=await fetchTimeout(
        `https://ko.wikipedia.org/api/rest_v1/feed/onthisday/events/${m}/${d}`,
        {headers:{'Accept':'application/json'}}, 8000);
      if(kr.ok){
        const kd=await kr.json();
        koreaItems=(kd.events||[])
          .sort((a,b)=>(b.pages||[]).some(p=>p.thumbnail)-(a.pages||[]).some(p=>p.thumbnail))
          .slice(0,7)
          .map(ev=>{
            const page=(ev.pages||[])[0]||{};
            return {
              year:ev.year<0?`기원전 ${Math.abs(ev.year)}년`:`${ev.year}년`,
              text:ev.text||'', img:page.thumbnail?.source||'',
              url:page.content_urls?.mobile?.page||''
            };
          });
      }
    } catch(e){ console.warn('korea fetch error:',e); }

    // 한국 이벤트 없으면 영문 Wikipedia에서 Korea/Korean 관련 필터
    if(!koreaItems.length && worldItems.length) {
      try {
        const res2=await fetchTimeout(
          `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${m}/${d}`,
          {headers:{'Accept':'application/json'}}, 8000);
        if(res2.ok){
          const d2=await res2.json();
          const koRelated=(d2.events||[])
            .filter(ev=>{
              const t=(ev.text||'').toLowerCase();
              const cats=(ev.pages||[]).flatMap(p=>(p.categories||[]).map(c=>c.titles?.canonical||''));
              return t.includes('korea')||t.includes('korean')||
                cats.some(c=>c.toLowerCase().includes('korea'));
            }).slice(0,6);

          // 한국어 요약 가져오기 시도
          await Promise.allSettled(koRelated.map(async(ev)=>{
            const page=(ev.pages||[])[0]||{};
            const et=page.title||'';
            const kt=koTitleMap?.[et];
            let text=ev.text||'', url='';
            if(kt){
              try{
                const sr=await fetchTimeout(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kt)}`,{},5000);
                if(sr.ok){const sd=await sr.json();text=sd.extract||text;url=sd.content_urls?.mobile?.page||'';}
              }catch(e){}
            }
            koreaItems.push({
              year:ev.year<0?`기원전 ${Math.abs(ev.year)}년`:`${ev.year}년`,
              text,img:page.thumbnail?.source||'',url
            });
          }));
        }
      } catch(e){}
    }

    // 렌더링
    document.getElementById('history-world').innerHTML=worldItems.length
      ?worldItems.map(historyCardHTML).join('')
      :'<div style="text-align:center;color:var(--text-dim);padding:30px;">이 날의 세계 이벤트가 없습니다</div>';

    document.getElementById('history-korea').innerHTML=koreaItems.length
      ?koreaItems.map(historyCardHTML).join('')
      :'<div style="text-align:center;color:var(--text-dim);padding:30px;">이 날의 한국 이벤트가 없습니다</div>';

    document.getElementById('history-loading').style.display='none';
    switchTab(_currentTab);

  } catch(err) {
    console.error('fetchHistory error:',err);
    document.getElementById('history-loading').style.display='none';
    document.getElementById('history-error').style.display='block';
  }
}

// ── 시작 ──
const DEFAULT_USER={name:'이경민',birth:'2009-01-19',hour:'8'};

async function saveAndRender() {
  const name=(document.getElementById('i-name').value||'').trim()||'이경민';
  const birth=document.getElementById('i-birth').value;
  const hour=document.getElementById('i-hour').value;
  if(!birth){alert('생년월일을 입력해주세요 🙏');return;}
  const user={name,birth,hour};
  try{localStorage.setItem('saju_user',JSON.stringify(user));}catch(e){}
  await render(user);
}
function reset() {
  try{localStorage.removeItem('saju_user');}catch(e){}
  document.getElementById('modal').classList.remove('hide');
  document.getElementById('app').style.display='none';
}
window.saveAndRender = saveAndRender;
window.reset = reset;

(async function(){
  if (HAS_BACKEND) {
    await Promise.all([initCheerData(), initFoodData(), initHumorData()]);
    loadZodiacContent().catch(()=>{});
  }
  try{
    const s=localStorage.getItem('saju_user');
    if(s){await render(JSON.parse(s));return;}
  }catch(e){}
  await render(DEFAULT_USER);
})();
