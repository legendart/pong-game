// ── 별자리 모듈 ──
import { API_BASE, HAS_BACKEND } from './config.js';

const ZODIAC_DEFAULT = [
  {name:'양자리', symbol:'♈', period:'3/21–4/19', elem:'불', ruling:'화성', keyword:'도전·열정', from_month:3, from_day:21, to_month:4, to_day:19},
  {name:'황소자리', symbol:'♉', period:'4/20–5/20', elem:'흙', ruling:'금성', keyword:'안정·인내', from_month:4, from_day:20, to_month:5, to_day:20},
  {name:'쌍둥이자리', symbol:'♊', period:'5/21–6/21', elem:'공기', ruling:'수성', keyword:'소통·호기심', from_month:5, from_day:21, to_month:6, to_day:21},
  {name:'게자리', symbol:'♋', period:'6/22–7/22', elem:'물', ruling:'달', keyword:'감정·보호', from_month:6, from_day:22, to_month:7, to_day:22},
  {name:'사자자리', symbol:'♌', period:'7/23–8/22', elem:'불', ruling:'태양', keyword:'리더십·창의', from_month:7, from_day:23, to_month:8, to_day:22},
  {name:'처녀자리', symbol:'♍', period:'8/23–9/22', elem:'흙', ruling:'수성', keyword:'완벽·실용', from_month:8, from_day:23, to_month:9, to_day:22},
  {name:'천칭자리', symbol:'♎', period:'9/23–10/22', elem:'공기', ruling:'금성', keyword:'균형·화합', from_month:9, from_day:23, to_month:10, to_day:22},
  {name:'전갈자리', symbol:'♏', period:'10/23–11/21', elem:'물', ruling:'명왕성', keyword:'변화·깊이', from_month:10, from_day:23, to_month:11, to_day:21},
  {name:'사수자리', symbol:'♐', period:'11/22–12/21', elem:'불', ruling:'목성', keyword:'모험·자유', from_month:11, from_day:22, to_month:12, to_day:21},
  {name:'염소자리', symbol:'♑', period:'12/22–1/19', elem:'흙', ruling:'토성', keyword:'책임·야망', from_month:12, from_day:22, to_month:1, to_day:19},
  {name:'물병자리', symbol:'♒', period:'1/20–2/18', elem:'공기', ruling:'천왕성', keyword:'혁신·독립', from_month:1, from_day:20, to_month:2, to_day:18},
  {name:'물고기자리', symbol:'♓', period:'2/19–3/20', elem:'물', ruling:'해왕성', keyword:'공감·영감', from_month:2, from_day:19, to_month:3, to_day:20},
];

let ZODIAC_CACHE = null;

async function loadZodiacData() {
  if (!HAS_BACKEND) return ZODIAC_DEFAULT;
  if (ZODIAC_CACHE) return ZODIAC_CACHE;
  try {
    const res = await fetch(`${API_BASE}/api/content/zodiac`);
    if (!res.ok) throw new Error('Failed to load zodiac data');
    const data = await res.json();
    ZODIAC_CACHE = Array.isArray(data.data) && data.data.length ? data.data : ZODIAC_DEFAULT;
    return ZODIAC_CACHE;
  } catch (e) {
    console.warn('Failed to load zodiac from API:', e);
    return ZODIAC_DEFAULT;
  }
}

async function getZodiac(bd) {
  const zodiacData = await loadZodiacData();
  const m = bd.getMonth() + 1, d = bd.getDate();
  for (const z of zodiacData) {
    const fm = z.from_month, fd = z.from_day, tm = z.to_month, td = z.to_day;
    if (fm > tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td)) return z;
    } else {
      if ((m === fm && d >= fd) || (m > fm && m < tm) || (m === tm && d <= td)) return z;
    }
  }
  return zodiacData[0] || ZODIAC_DEFAULT[0];
}

const ZF = {
  '양자리': ['오늘의 에너지가 강합니다. 자신감을 가지고 한 걸음 나아가세요.', '도전과 모험의 날, 새 목표에 집중해보세요.', '직감이 빛나는 날입니다. 믿고 움직이면 좋은 결과가 옵니다.'],
  '황소자리': ['안정과 인내가 필요한 날입니다. 차분하게 조금씩 나아가세요.', '작은 성취가 큰 믿음으로 이어집니다. 오늘은 꾸준함이 이깁니다.', '감정이 편안해지는 날입니다. 주변 사람과 따뜻하게 지내보세요.'],
  '쌍둥이자리': ['소통이 빛나는 날입니다. 새로운 인연이 생길 수 있어요.', '호기심을 따라가면 뜻밖의 기회가 보일 수 있습니다.', '빠른 판단보다는 경청이 오늘의 키워드입니다.'],
  '게자리': ['감성이 풍부한 날입니다. 마음을 편안히 두고 안정을 찾아보세요.', '가족과 가까운 사람에게 작은 관심을 건네보면 좋습니다.', '내면의 소리를 듣는 것이 오늘의 행운을 불러옵니다.'],
  '사자자리': ['리더십이 빛나는 날입니다. 자신 있게 큰 그림을 그려보세요.', '창의적인 표현이 좋은 반응을 만듭니다. 자신을 보여주세요.', '열정이 돋보이는 날입니다. 지금 이 순간에 중심을 잡으세요.'],
  '처녀자리': ['세부적인 계획이 오늘의 강점입니다. 꼼꼼하게 준비하세요.', '실용적인 선택이 큰 도움이 됩니다. 깊게 생각해보세요.', '작은 완성들이 쌓이면 큰 성과가 됩니다. 오늘은 정리를 해보세요.'],
  '천칭자리': ['균형과 조화가 중요한 날입니다. 쉬운 선택보다 올바른 선택을 해보세요.', '대인 관계에서 타협이 좋은 결과를 만듭니다.', '아름다움과 멋을 가까이하면 마음이 한결 편안해집니다.'],
  '전갈자리': ['강한 집중력이 필요한 날입니다. 깊이 있는 생각이 기회를 만듭니다.', '변화가 찾아오는 순간입니다. 유연하게 기다리세요.', '감정의 파도가 클 수 있지만, 내면의 진실을 지키면 됩니다.'],
  '사수자리': ['모험과 자유를 갈망하는 날입니다. 새로운 시도를 두려워하지 마세요.', '넓은 시야가 당신에게 도움이 됩니다. 멀리 있는 것을 생각해보세요.', '긍정적인 태도가 오늘의 행운을 불러옵니다.'],
  '염소자리': ['책임감 있는 선택이 빛나는 날입니다. 차분히 나아가세요.', '꾸준함이 성과를 가져옵니다. 작은 목표를 하나씩 달성해보세요.', '현실적이고 신중한 판단이 오늘을 지켜줍니다.'],
  '물병자리': ['혁신적인 생각이 돋보이는 날입니다. 독창성을 믿어보세요.', '자유로운 발상이 오늘의 기회를 만듭니다. 틀을 벗어나보세요.', '공동체의 힘이 더해지는 날입니다. 함께하면 더 멀리 갑니다.'],
  '물고기자리': ['감수성이 풍부한 날입니다. 직감과 영감을 믿어보세요.', '공감이 깊어지는 시간입니다. 주변 사람과 마음을 나눠보세요.', '창의적인 표현이 오늘의 안정감을 만들어줍니다.'],
};

const Z_DETAIL_MSGS = {
  high: ['에너지가 넘치는 날입니다. 자신 있게 움직이면 좋은 결과가 옵니다.', '오늘은 무언가를 시작하기에 좋은 기운이 흐릅니다.', '자신의 열정을 믿고 대담하게 행동해보세요.'],
  mid: ['평온한 흐름의 하루입니다. 무리하지 않고 조금씩 나아가세요.', '중용의 태도가 오늘의 균형을 잡아줍니다.', '일상 속에서 작은 성취를 찾으면 기분이 좋아집니다.'],
  low: ['잠시 쉬어가는 것이 필요합니다. 재충전을 위해 여유를 가지세요.', '과도한 부담을 덜어내는 것이 오늘을 편안하게 만듭니다.', 'ゆっくり 호흡하며 마음을 가다듬으면 금방 좋아질 거예요.'],
};

const Z_TIPS = ['가벼운 스트레칭을 하세요.', '차분한 마음으로 계획을 다시 정리해보세요.', '자신에게 솔직해지는 시간을 가져보세요.'];

export { ZODIAC_DEFAULT as ZODIAC, ZF, Z_DETAIL_MSGS, Z_TIPS, getZodiac, loadZodiacData };

