// ── 별자리 모듈 ──
import { API_BASE, HAS_BACKEND } from './config.js';

// 12 별자리 정적 데이터
export const ZODIAC = [
  { name:'양자리',   symbol:'♈', from:[3,21], to:[4,19],  period:'3/21 ~ 4/19',  elem:'불', ruling:'화성',   keyword:'용기·도전' },
  { name:'황소자리', symbol:'♉', from:[4,20], to:[5,20],  period:'4/20 ~ 5/20',  elem:'흙', ruling:'금성',   keyword:'안정·인내' },
  { name:'쌍둥이자리',symbol:'♊',from:[5,21], to:[6,21],  period:'5/21 ~ 6/21',  elem:'공기',ruling:'수성',  keyword:'소통·적응' },
  { name:'게자리',   symbol:'♋', from:[6,22], to:[7,22],  period:'6/22 ~ 7/22',  elem:'물', ruling:'달',     keyword:'감성·공감' },
  { name:'사자자리', symbol:'♌', from:[7,23], to:[8,22],  period:'7/23 ~ 8/22',  elem:'불', ruling:'태양',   keyword:'창조·리더십' },
  { name:'처녀자리', symbol:'♍', from:[8,23], to:[9,22],  period:'8/23 ~ 9/22',  elem:'흙', ruling:'수성',   keyword:'분석·완벽' },
  { name:'천칭자리', symbol:'♎', from:[9,23], to:[10,22], period:'9/23 ~ 10/22', elem:'공기',ruling:'금성',  keyword:'균형·조화' },
  { name:'전갈자리', symbol:'♏', from:[10,23],to:[11,21], period:'10/23 ~ 11/21',elem:'물', ruling:'명왕성', keyword:'변환·직관' },
  { name:'사수자리', symbol:'♐', from:[11,22],to:[12,21], period:'11/22 ~ 12/21',elem:'불', ruling:'목성',   keyword:'자유·탐구' },
  { name:'염소자리', symbol:'♑', from:[12,22],to:[1,19],  period:'12/22 ~ 1/19', elem:'흙', ruling:'토성',   keyword:'인내·목표' },
  { name:'물병자리', symbol:'♒', from:[1,20], to:[2,18],  period:'1/20 ~ 2/18',  elem:'공기',ruling:'천왕성',keyword:'혁신·독창' },
  { name:'물고기자리',symbol:'♓',from:[2,19], to:[3,20],  period:'2/19 ~ 3/20',  elem:'물', ruling:'해왕성', keyword:'직관·공감' },
];

// 콘텐츠 데이터 (백엔드 API로 채워지며, 폴백 데이터 내장)
export let ZF = {
  '양자리':   ['오늘은 새로운 도전을 시작하기 최적의 날입니다. 용기 있는 첫 걸음이 큰 변화를 만들어냅니다.','활발한 에너지가 넘치는 하루입니다. 팀 활동과 협력에서 리더십을 발휘할 기회가 찾아옵니다.'],
  '황소자리': ['안정과 실리를 추구하는 날입니다. 재물 관련 결정은 신중하게, 좋은 기회가 있다면 망설이지 마세요.','감각적인 즐거움을 찾는 하루입니다. 맛있는 음식이나 좋은 음악으로 충전해보세요.'],
  '쌍둥이자리':['다양한 아이디어가 샘솟는 하루입니다. 소통과 네트워킹에서 뜻밖의 기회를 잡을 수 있습니다.','변화를 두려워하지 마세요. 새로운 정보가 중요한 결정에 도움을 줍니다.'],
  '게자리':   ['감성이 풍부한 하루입니다. 가족이나 소중한 사람들과의 시간이 마음을 채워줄 것입니다.','직감을 믿어보세요. 오늘은 마음의 소리를 따르는 것이 최선입니다.'],
  '사자자리': ['창의적인 에너지가 넘칩니다. 자신감을 갖고 앞으로 나아가세요. 주목받을 하루입니다.','열정적인 하루입니다. 중요한 발표나 표현이 필요한 자리에서 빛을 발합니다.'],
  '처녀자리': ['세밀한 분석이 빛을 발하는 날입니다. 꼼꼼한 검토가 좋은 결과로 이어집니다.','건강과 루틴에 집중하기 좋은 날입니다. 작은 개선들이 큰 변화를 만듭니다.'],
  '천칭자리': ['균형과 조화를 찾는 하루입니다. 대인관계에서 원만한 해결책이 보입니다.','아름다움과 예술에서 영감을 얻는 날입니다. 중요한 결정은 신중하게 저울질하세요.'],
  '전갈자리': ['깊은 통찰력이 발휘되는 날입니다. 숨겨진 진실이 드러나고 새로운 가능성이 열립니다.','집중력이 높아지는 하루입니다. 오래된 문제의 해결책을 찾을 수 있습니다.'],
  '사수자리': ['자유롭고 탐구적인 에너지가 넘칩니다. 새로운 배움과 여행에서 행운이 따릅니다.','낙관적인 하루입니다. 큰 그림을 그리고 미래를 계획하기 좋은 날입니다.'],
  '염소자리': ['목표를 향한 꾸준한 노력이 결실을 맺는 날입니다. 책임감이 신뢰를 만들어냅니다.','실용적인 접근이 효과를 발휘합니다. 장기적인 계획을 점검하기 좋은 날입니다.'],
  '물병자리': ['독창적인 아이디어가 주목받는 날입니다. 혁신적인 생각으로 새로운 길을 열어보세요.','사회적 연결과 협력에서 시너지가 납니다. 뜻밖의 만남이 새 기회를 가져옵니다.'],
  '물고기자리':['직관과 감성이 빛나는 날입니다. 예술이나 창의적 활동에서 특별한 영감을 얻습니다.','꿈과 현실의 경계에서 아름다운 것들을 발견하세요. 공감 능력이 인연을 이어줍니다.'],
};

export let Z_DETAIL_MSGS = {
  high: [
    '오늘은 별의 기운이 최고조에 달합니다. 도전하면 반드시 좋은 결과가 따라옵니다.',
    '행운의 기운이 가득한 날입니다. 중요한 일들이 술술 풀릴 것입니다.',
    '하늘이 돕는 날입니다. 새로운 시작과 도전에 최적의 타이밍입니다.',
    '에너지가 넘치는 하루입니다. 오늘의 노력이 큰 성과로 돌아옵니다.',
  ],
  mid: [
    '평온하고 안정적인 하루가 예상됩니다. 꾸준함이 답입니다.',
    '적당한 활동과 휴식의 균형을 맞추기 좋은 날입니다.',
    '무리하지 않고 차분하게 임하면 좋은 결과를 얻을 수 있습니다.',
    '오늘은 준비와 계획의 날입니다. 내일을 위한 씨앗을 심어보세요.',
  ],
  low: [
    '오늘은 에너지를 비축하는 날입니다. 무리한 도전보다 내실을 다지세요.',
    '차분히 내면을 들여다보는 시간을 가져보세요. 쉬어가는 것도 성장입니다.',
    '작은 것에 집중하고 감사하는 마음을 가지면 하루가 달라집니다.',
    '오늘의 어려움은 내일의 도약을 위한 준비입니다. 포기하지 마세요.',
  ],
};

export let Z_TIPS = [
  { e:'🎨', l:'행운의 색', v:'금색' },
  { e:'🔢', l:'행운 숫자', v:'7' },
  { e:'🌸', l:'행운의 꽃', v:'장미' },
  { e:'🧭', l:'행운 방향', v:'동쪽' },
  { e:'💎', l:'행운의 돌', v:'수정' },
  { e:'🕐', l:'행운 시간', v:'오전 10시' },
  { e:'🌈', l:'행운의 색', v:'하늘색' },
  { e:'🔢', l:'행운 숫자', v:'3' },
];

export let WEEK_MSGS = {
  high: [
    '최상의 기운이 흐르는 날! 적극적으로 나서보세요.',
    '하늘이 돕는 날입니다. 중요한 결정을 내리기 좋습니다.',
    '에너지가 넘치는 하루! 새로운 도전을 시작하세요.',
  ],
  mid: [
    '평온하고 안정적인 하루가 될 것 같습니다.',
    '무리하지 않고 꾸준히 나아가는 것이 최선입니다.',
    '오늘은 계획을 점검하고 정비하는 날로 활용하세요.',
  ],
  low: [
    '에너지를 충전하는 날입니다. 휴식을 취하세요.',
    '무리한 도전보다 내실을 다지는 것이 좋겠습니다.',
    '잠시 멈추고 자신을 돌아보는 시간을 가져보세요.',
  ],
};

// 별자리 판별 (sync)
export function getZodiac(bd) {
  const m = bd.getMonth() + 1, d = bd.getDate();
  for (const z of ZODIAC) {
    const [fm, fd] = z.from, [tm, td] = z.to;
    if (fm > tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td)) return z;
    } else {
      if ((m === fm && d >= fd) || (m > fm && m < tm) || (m === tm && d <= td)) return z;
    }
  }
  return ZODIAC[0];
}

// 백엔드 콘텐츠 로드 (호출 시 ZF, Z_DETAIL_MSGS, Z_TIPS, WEEK_MSGS를 채움)
export async function loadZodiacContent() {
  if (!HAS_BACKEND) return false;
  try {
    const res = await fetch(`${API_BASE}/api/content/all`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const d = await res.json();
    if (!d.ok) return false;

    if (d.zodiac?.length) {
      const newZF = {};
      const newDetail = { high: [], mid: [], low: [] };
      const newTips = [];
      d.zodiac.forEach(z => {
        if (z.type === 'fortune') {
          if (!newZF[z.sign]) newZF[z.sign] = [];
          newZF[z.sign].push(z.value);
        } else if (z.type.startsWith('detail_')) {
          const lvl = z.type.replace('detail_', '');
          if (!newDetail[lvl]) newDetail[lvl] = [];
          newDetail[lvl].push(z.value);
        } else if (z.type === 'tip') {
          try { newTips.push(JSON.parse(z.value)); } catch {}
        }
      });
      if (Object.keys(newZF).length)  ZF = { ...ZF, ...newZF };
      if (newDetail.high.length)      Z_DETAIL_MSGS = newDetail;
      if (newTips.length)             Z_TIPS = newTips;
    }

    if (d.saju?.length) {
      const newWeek = { high: [], mid: [], low: [] };
      d.saju.forEach(s => {
        if (s.type === 'week_msg') {
          const [lvl] = s.key.split('_');
          if (!newWeek[lvl]) newWeek[lvl] = [];
          newWeek[lvl].push(s.value);
        }
      });
      if (newWeek.high.length) WEEK_MSGS = newWeek;
    }

    return true;
  } catch (e) {
    console.warn('[Zodiac] 콘텐츠 로드 실패, 폴백 사용:', e.message);
    return false;
  }
}
