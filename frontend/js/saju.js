// ── 사주 계산 (프론트엔드 폴백용) ──
// 백엔드가 있을 때는 api.js의 fetchFortune() 사용
// 백엔드 없을 때는 이 모듈에서 직접 계산

const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_KR   = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCH_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
export const ANIMALS   = ['🐭','🐮','🐯','🐰','🐉','🐍','🐴','🐑','🐵','🐔','🐶','🐷'];
export const ANIMAL_KR = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
export const STEM_ELEM   = ['목','목','화','화','토','토','금','금','수','수'];
export const BRANCH_ELEM = ['수','토','목','목','토','화','화','토','금','금','토','수'];
export const ELEM_COLOR  = {목:'#4caf7d',화:'#e05c5c',토:'#c9a84c',금:'#a0c4e8',수:'#6680cc'};
export const ELEM_EMOJI  = {목:'🌿',화:'🔥',토:'🌍',금:'⚡',수:'💧'};
export const SIPSIN_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
export const SIPSIN_MEANING = {
  비견:'자아·독립심·경쟁',겁재:'추진력·과감함',식신:'표현·창의·식복',
  상관:'재능·자유·반항',편재:'사업·활동·임기응변',정재:'성실·안정·재물',
  편관:'도전·권위·극복',정관:'명예·책임·규범',편인:'직관·학문·변화',정인:'학습·인내·지혜',
};
export const DAYS_KR = ['일','월','화','수','목','금','토'];
export const CHUNG_BRANCH = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
export const HAP_BRANCH   = [[0,11],[1,10],[2,9],[3,8],[4,7],[5,6]];
export { STEMS, BRANCHES, STEM_KR, BRANCH_KR };

// 지장간 (각 지지에 숨겨진 천간)
export const JIJANGAN_MAP = [
  '壬, 癸',      // 子
  '己, 癸, 辛',  // 丑
  '戊, 丙, 甲',  // 寅
  '甲, 乙',      // 卯
  '乙, 癸, 戊',  // 辰
  '戊, 庚, 丙',  // 巳
  '丙, 己, 丁',  // 午
  '丁, 乙, 己',  // 未
  '戊, 壬, 庚',  // 申
  '庚, 辛',      // 酉
  '辛, 丁, 戊',  // 戌
  '甲, 壬',      // 亥
];

// 십신별 운세 문구
export const SIPSIN_FORTUNE = {
  비견: '자신감과 독립심이 강한 날입니다. 주체적으로 결정하고 추진하면 좋은 결과를 얻을 수 있어요. 경쟁보다는 협력의 자세로 임하세요.',
  겁재: '강한 의지와 추진력으로 장애물을 돌파하는 날입니다. 다소 급한 면이 있으니 신중하게 판단하고 행동하세요.',
  식신: '창의력과 표현력이 빛나는 날입니다. 재능을 마음껏 발휘하고 즐기세요. 식복이 있으니 맛있는 식사도 좋습니다.',
  상관: '뛰어난 재능과 자유로운 사고가 발휘되는 날입니다. 틀에 얽매이지 않는 아이디어로 주변을 놀라게 하세요.',
  편재: '활동적이고 사교적인 에너지가 넘치는 날입니다. 사람 만남과 새로운 기회에 적극적으로 뛰어들어 보세요.',
  정재: '성실함과 꼼꼼함이 빛을 발하는 날입니다. 안정적인 재물 운이 따르며, 계획대로 착실히 진행하면 좋습니다.',
  편관: '강한 도전 정신으로 권위와 장벽을 넘는 날입니다. 리더십을 발휘하되 주변과의 마찰에 주의하세요.',
  정관: '명예롭고 책임감 있는 행동이 빛나는 날입니다. 규범과 원칙을 지키면 신뢰와 인정을 받을 수 있습니다.',
  편인: '직관과 영감이 살아나는 날입니다. 학문적 탐구와 창의적 사고에 집중하면 뜻밖의 깨달음을 얻을 수 있어요.',
  정인: '인내와 지혜로 차근차근 나아가는 날입니다. 학습과 정신적 성장에 집중하면 장기적으로 큰 힘이 됩니다.',
};

export const JEOLGI = {
  2020:[4,5,4,5,5,6,7,7,8,7,7,6],2021:[3,5,4,5,5,7,7,7,8,7,7,5],
  2022:[4,6,5,5,6,6,7,8,8,7,7,5],2023:[4,6,5,6,6,7,7,8,8,8,8,6],
  2024:[4,5,4,5,5,6,6,7,8,7,7,6],2025:[3,5,5,5,5,7,7,7,8,7,7,5],
  2026:[4,6,5,5,6,7,7,8,8,7,7,6],2027:[4,6,5,6,6,7,7,8,8,8,7,5],
  2028:[4,5,4,5,5,6,7,7,7,7,7,6],
};
export const JEOLGI_MONTHS = [2,3,4,5,6,7,8,9,10,11,12,1];

function getSajuMonth(y,m,d) {
  const tbl = JEOLGI[y] || JEOLGI[2025];
  for (let i=11;i>=0;i--) {
    const jm=JEOLGI_MONTHS[i],jd=tbl[i];
    if (i===11){if(m===1&&d>=jd)return 12;}
    else{if(m===jm&&d>=jd)return i+1;}
  }
  return m===1?12:1;
}

export function yearPillar(y){return{s:((y-4)%10+10)%10,b:((y-4)%12+12)%12};}
export function monthPillar(y,m,d){const sm=getSajuMonth(y,m,d),ys=yearPillar(y).s;return{s:((ys%5)*2+sm+1)%10,b:(sm+1)%12};}
export function dayPillar(date){const diff=Math.floor((date-new Date('1900-01-31T00:00:00Z'))/86400000);return{s:((diff%10)+10)%10,b:((diff%12)+12)%12};}
export function hourPillar(ds,h){if(h<0)return{s:-1,b:-1};const hb=Math.floor(((h+1)%24)/2);return{s:((ds%5)*2+hb)%10,b:hb};}

export function buildSaju(birthDate, inputHour) {
  const y=birthDate.getFullYear(),m=birthDate.getMonth()+1,d=birthDate.getDate();
  const yp=yearPillar(y),mp=monthPillar(y,m,d),dp=dayPillar(birthDate),hp=hourPillar(dp.s,inputHour);
  return [
    {label:'연주 (年柱)',...yp},
    {label:'월주 (月柱)',...mp},
    {label:'일주 (日柱)',...dp},
    {label:'시주 (時柱)',...hp},
  ];
}

export function todaySaju(){const n=new Date();return buildSaju(n,n.getHours());}

export function elemCount(pillars){
  const c={목:0,화:0,토:0,금:0,수:0};
  pillars.forEach(p=>{if(p.s>=0)c[STEM_ELEM[p.s]]++;if(p.b>=0)c[BRANCH_ELEM[p.b]]++;});
  return c;
}

export function getSipsin(ds,ts){return SIPSIN_NAMES[((ts-ds)+10)%10];}
export function checkChung(b1,b2){return[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]].some(([a,b])=>(b1===a&&b2===b)||(b1===b&&b2===a));}
export function checkHap(b1,b2){return[[0,11],[1,10],[2,9],[3,8],[4,7],[5,6]].some(([a,b])=>(b1===a&&b2===b)||(b1===b&&b2===a));}
