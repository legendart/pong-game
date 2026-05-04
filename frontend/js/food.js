// ── 음식 추천 모듈 ──
import { STEM_ELEM, BRANCH_ELEM } from './saju.js';
import { API_BASE, HAS_BACKEND } from './config.js';

// ── 음식 추천 데이터 (나이대별 + 오행별) ──
// ══════════════════════════════════════════
const FOOD_DB = {
  // 나이대별 기본 음식 풀
  teen: { // 10대
    label: '10대 🧑‍🎤',
    base: [
      {name:'마라탕',emoji:'🌶️',desc:'요즘 10대 최애! 얼얼하게 맵고 중독적인 맛'},
      {name:'떡볶이',emoji:'🍢',desc:'국민 간식! 쫄깃한 떡에 달콤매콤한 소스'},
      {name:'두쫀쿠',emoji:'🧇',desc:'SNS에서 핫한 두툼하고 쫄깃한 쿠키'},
      {name:'탕후루',emoji:'🍡',desc:'새콤달콤 과일 탕후루, 요즘 트렌드!'},
      {name:'제육볶음',emoji:'🥩',desc:'든든하게 배 채우는 매콤한 제육!'},
      {name:'치킨',emoji:'🍗',desc:'언제나 옳은 치킨, 오늘도 치킨이지'},
      {name:'불닭볶음면',emoji:'🍜',desc:'도전적인 불닭 챌린지, 해볼 만해?'},
      {name:'버거',emoji:'🍔',desc:'두툼한 패티의 수제버거로 에너지 충전'},
      {name:'와플',emoji:'🧇',desc:'바삭하고 달콤한 와플에 아이스크림 올려서'},
      {name:'라볶이',emoji:'🥢',desc:'라면+떡볶이 = 환상의 조합'},
      {name:'피자',emoji:'🍕',desc:'치즈 가득! 친구들이랑 나눠 먹으면 최고'},
      {name:'스팸마요덮밥',emoji:'🍚',desc:'간단하지만 맛있는 스팸마요 덮밥'},
    ],
    elem: {목:'채소가 듬뿍 들어간 음식',화:'매콤한 음식',토:'달콤한 음식',금:'담백한 음식',수:'시원한 음식'}
  },
  twenty: { // 20대
    label: '20대 🧑',
    base: [
      {name:'마라탕',emoji:'🌶️',desc:'마라향 중독, 한 번 먹으면 계속 생각나'},
      {name:'삼겹살',emoji:'🥓',desc:'소주 한 잔과 함께하는 삼겹살 한 판'},
      {name:'파스타',emoji:'🍝',desc:'크리미하거나 알리오올리오, 집에서도 도전'},
      {name:'아보카도토스트',emoji:'🥑',desc:'건강하고 트렌디한 브런치 메뉴'},
      {name:'초밥',emoji:'🍣',desc:'한 입에 쏙! 신선한 초밥으로 기분 전환'},
      {name:'비빔밥',emoji:'🥗',desc:'알록달록 채소와 고추장의 완벽한 조화'},
      {name:'낙지볶음',emoji:'🦑',desc:'쫄깃한 낙지의 매콤함에 밥 한 공기 뚝딱'},
      {name:'부대찌개',emoji:'🫕',desc:'든든하고 깊은 맛의 부대찌개 한 냄비'},
      {name:'갈비찜',emoji:'🍖',desc:'부드럽게 조린 갈비찜, 오늘은 특식!'},
      {name:'샤브샤브',emoji:'🥘',desc:'신선한 야채와 얇은 고기의 건강한 조합'},
      {name:'타코',emoji:'🌮',desc:'바삭한 타코쉘에 가득 채운 맛있는 필링'},
      {name:'연어덮밥',emoji:'🐟',desc:'신선한 연어에 아보카도까지, 포만감 최고'},
    ],
    elem: {목:'샐러드나 쌈 요리',화:'매운 음식이나 찌개',토:'달달한 디저트나 떡',금:'담백한 생선요리',수:'국이나 찌개류'}
  },
  thirty: { // 30대
    label: '30대 🧑‍💼',
    base: [
      {name:'갈비탕',emoji:'🍲',desc:'진하게 우린 갈비탕으로 속 든든하게'},
      {name:'삼겹살구이',emoji:'🥓',desc:'두툼한 삼겹살에 쌈채소 듬뿍'},
      {name:'된장찌개',emoji:'🫕',desc:'구수한 된장찌개로 한국인의 집밥 감성'},
      {name:'냉면',emoji:'🍜',desc:'시원하고 담백한 냉면 한 그릇'},
      {name:'추어탕',emoji:'🐟',desc:'미꾸라지 가득 담긴 보양 추어탕'},
      {name:'보쌈',emoji:'🥬',desc:'부드러운 보쌈에 신선한 배추쌈'},
      {name:'낙지볶음',emoji:'🦑',desc:'스트레스 날려버릴 매콤한 낙지볶음'},
      {name:'제육덮밥',emoji:'🍚',desc:'든든한 제육덮밥에 계란후라이 올려서'},
      {name:'순두부찌개',emoji:'🫕',desc:'부드러운 순두부에 매콤한 국물'},
      {name:'스테이크',emoji:'🥩',desc:'오늘은 나를 위한 특별한 스테이크'},
      {name:'해물파전',emoji:'🥞',desc:'바삭한 파전에 막걸리 한 잔'},
      {name:'황태국',emoji:'🍵',desc:'숙취에도, 피로할 때도 최고인 황태국'},
    ],
    elem: {목:'나물이나 채소 위주 식단',화:'매운 탕이나 찌개',토:'영양밥이나 비빔밥',금:'담백한 생선이나 두부요리',수:'국밥이나 탕류'}
  },
  forty: { // 40대
    label: '40대 🧑‍👧',
    base: [
      {name:'삼계탕',emoji:'🍗',desc:'원기 회복의 최강자, 삼계탕 한 뚝배기'},
      {name:'갈비탕',emoji:'🍲',desc:'진하게 끓인 갈비탕으로 기력 보충'},
      {name:'청국장',emoji:'🫕',desc:'구수한 청국장 한 그릇으로 건강 챙기기'},
      {name:'나물비빔밥',emoji:'🥗',desc:'각종 나물 가득 담긴 건강한 비빔밥'},
      {name:'생선구이',emoji:'🐟',desc:'고등어나 갈치 구이로 단백질 보충'},
      {name:'소갈비',emoji:'🍖',desc:'오늘은 제대로 된 소갈비 한 접시'},
      {name:'순대국밥',emoji:'🍵',desc:'국밥 한 그릇으로 속 든든하게'},
      {name:'두부요리',emoji:'🫙',desc:'고단백 두부로 건강하게 영양 섭취'},
      {name:'참치회덮밥',emoji:'🐟',desc:'신선한 참치회에 밥 한 공기'},
      {name:'곰탕',emoji:'🍲',desc:'오랜 시간 끓인 진한 곰탕 한 그릇'},
      {name:'미역국',emoji:'🌿',desc:'철분과 요오드 가득한 미역국'},
      {name:'우거지해장국',emoji:'🫕',desc:'개운하게 속 풀어주는 우거지 해장국'},
    ],
    elem: {목:'채소 위주의 건강식',화:'적당히 매운 보양식',토:'영양 가득한 단 음식',금:'담백한 고단백 식사',수:'국물 요리나 탕류'}
  },
  fifty_plus: { // 50대+
    label: '50대 이상 🧓',
    base: [
      {name:'삼계탕',emoji:'🍗',desc:'최고의 보양식, 삼계탕으로 원기 충전'},
      {name:'갈비탕',emoji:'🍲',desc:'무릎에도 좋은 콜라겐 가득 갈비탕'},
      {name:'된장국',emoji:'🫕',desc:'발효식품의 왕, 구수한 된장국'},
      {name:'나물무침',emoji:'🥗',desc:'각종 미네랄 가득한 제철 나물'},
      {name:'생선찜',emoji:'🐟',desc:'부드럽고 담백한 생선찜으로 단백질 보충'},
      {name:'꼬리곰탕',emoji:'🍲',desc:'콜라겐 듬뿍 꼬리곰탕으로 관절 건강'},
      {name:'전복죽',emoji:'🦪',desc:'영양의 왕 전복으로 만든 귀한 죽'},
      {name:'도토리묵',emoji:'🌰',desc:'혈당 걱정 없는 건강한 도토리묵'},
      {name:'잡채',emoji:'🍜',desc:'색색의 채소와 당면이 어우러진 잡채'},
      {name:'홍합탕',emoji:'🦪',desc:'시원하고 깔끔한 홍합탕으로 해장'},
      {name:'연두부',emoji:'🫙',desc:'소화 잘 되는 부드러운 연두부'},
      {name:'닭백숙',emoji:'🐓',desc:'오랜 시간 정성껏 끓인 영양 닭백숙'},
    ],
    elem: {목:'소화 잘 되는 채소식',화:'몸을 따뜻하게 하는 음식',토:'달달하고 부드러운 음식',금:'자극 없는 담백한 음식',수:'수분 많은 국물 음식'}
  }
};

// 오행별 추천 이유
const ELEM_FOOD_REASON = {
  목:'오늘은 목(木)의 기운이 강한 날이에요. 신맛과 녹색 음식이 간과 담에 좋습니다.',
  화:'오늘은 화(火)의 기운이 넘치는 날이에요. 활동적인 에너지를 위해 따뜻하고 매운 음식이 어울려요.',
  토:'오늘은 토(土)의 기운이 중심을 잡는 날이에요. 달콤하고 부드러운 음식이 비장과 위를 도와줍니다.',
  금:'오늘은 금(金)의 기운이 빛나는 날이에요. 담백하고 흰 음식이 폐와 대장 건강에 좋아요.',
  수:'오늘은 수(水)의 기운이 깊은 날이에요. 짭짤하거나 검은 음식이 신장과 방광 건강을 도와줍니다.',
};

// 오행별 특별 추가 음식
const ELEM_BONUS_FOOD = {
  목: [{name:'시금치나물',emoji:'🥬',desc:'간 건강에 좋은 녹색 채소의 대표'},{name:'오이무침',emoji:'🥒',desc:'시원하고 신선한 오이의 신맛이 딱!'}],
  화: [{name:'떡볶이',emoji:'🌶️',desc:'화기 넘치는 날엔 매콤한 떡볶이'},{name:'닭갈비',emoji:'🍗',desc:'활기찬 날 어울리는 매콤 닭갈비'}],
  토: [{name:'단호박죽',emoji:'🎃',desc:'달콤한 단호박이 위장을 편안하게'},{name:'고구마',emoji:'🍠',desc:'따뜻하고 달콤한 고구마로 든든하게'}],
  금: [{name:'두부조림',emoji:'🫙',desc:'담백하고 깔끔한 두부조림'},{name:'흰살생선',emoji:'🐟',desc:'폐 건강에 좋은 담백한 흰살생선'}],
  수: [{name:'미역국',emoji:'🌿',desc:'신장에 좋은 검은 해조류 미역'},{name:'검은콩밥',emoji:'🍚',desc:'혈액 순환을 돕는 검은콩이 가득'}],
};

function getAgeGroup(birthDate) {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  if (age < 20) return 'teen';
  if (age < 30) return 'twenty';
  if (age < 40) return 'thirty';
  if (age < 50) return 'forty';
  return 'fifty_plus';
}

function renderFoodRecommendation(bd, todayPillars, rand) {
  const ageGroup = getAgeGroup(bd);
  const foodData = getFoodData();
  const db = foodData[ageGroup] || FOOD_DB[ageGroup];
  
  // 오늘 오행 중 가장 강한 것
  const elems = elemCount(todayPillars);
  const topElem = Object.entries(elems).sort((a,b)=>b[1]-a[1])[0][0];
  
  // 나이대 기본 음식에서 4개 + 오행 특별 1개
  const shuffled = [...db.base].sort(()=>rand()-.5);
  const picked = shuffled.slice(0,4);
  const bonus = ELEM_BONUS_FOOD[topElem];
  const bonusItem = bonus[Math.floor(rand()*bonus.length)];
  picked.splice(Math.floor(rand()*5), 0, {...bonusItem, isBonus:true});
  
  // 렌더링
  document.getElementById('food-age-badge').innerHTML = 
    `<span style="font-size:14px;">${db.label.split(' ')[1]}</span> ${db.label.split(' ')[0]} 추천 메뉴`;
  
  document.getElementById('food-reason').innerHTML =
    `${ELEM_FOOD_REASON[topElem]} <b style="color:var(--gold);">${db.elem[topElem]}</b>이 특히 좋아요.`;
  
  document.getElementById('food-list').innerHTML = picked.map(f => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;
      background:${f.isBonus?'rgba(201,168,76,.1)':'rgba(255,255,255,.03)'};
      border:1px solid ${f.isBonus?'rgba(201,168,76,.3)':'var(--border)'};
      border-radius:14px;">
      <span style="font-size:28px;flex-shrink:0;">${f.emoji}</span>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="font-size:14px;font-weight:600;color:${f.isBonus?'var(--gold-l)':'var(--text)'};">${f.name}</span>
          ${f.isBonus?`<span style="font-size:9px;color:var(--gold);background:rgba(201,168,76,.15);border-radius:4px;padding:1px 5px;">오행 추천</span>`:''}
        </div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.4;">${f.desc}</div>
      </div>
    </div>`).join('');

  // 오늘의 음식 팁
  const tips = [
    `오늘은 ${topElem} 기운의 날! 규칙적인 식사 시간을 지키면 더욱 좋아요. ⏰`,
    `식사 전 물 한 잔으로 소화를 준비하고, 천천히 씹어 먹으면 영양 흡수가 2배! 💧`,
    `오늘 추천 음식을 먹을 때 감사한 마음을 담으면 몸도 마음도 더 건강해져요. 🙏`,
    `가능하면 제철 재료로 만든 음식을 드세요. 계절의 기운을 그대로 담았거든요. 🌿`,
  ];
  document.getElementById('food-tip').innerHTML = 
    `💡 ${tips[Math.floor(rand()*tips.length)]}`;
}

let FOOD_CACHE = null;
const AGE_GROUP_LABELS = {
  teen:'10대 🧑‍🎤',
  twenty:'20대 🧑',
  thirty:'30대 🧑‍💼',
  forty:'40대 🧑‍👧',
  fifty_plus:'50대 이상 🧓',
};

async function initFoodData() {
  if (!HAS_BACKEND) return;
  try {
    const res = await fetch(`${API_BASE}/api/content/food`);
    if (!res.ok) throw new Error('Failed to load food data');
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length) FOOD_CACHE = json.data;
  } catch (e) {
    console.warn('Food content load failed:', e);
  }
}

function normalizeFoodRows(rows) {
  return rows.reduce((acc, item) => {
    const ageGroup = item.age_group || 'teen';
    if (!acc[ageGroup]) {
      acc[ageGroup] = { label: AGE_GROUP_LABELS[ageGroup] || ageGroup, base: [], elem: {} };
    }
    acc[ageGroup].base.push({ name: item.name, emoji: item.emoji || '🍽️', desc: item.desc || '' });
    if (item.elem_type) {
      acc[ageGroup].elem[item.elem_type] = acc[ageGroup].elem[item.elem_type] || item.elem_type;
    }
    return acc;
  }, {});
}

function getFoodData() {
  if (!FOOD_CACHE) return FOOD_DB;
  const normalized = normalizeFoodRows(FOOD_CACHE);
  return { ...FOOD_DB, ...normalized };
}

// ══════════════════════════════════════════
// ── 오늘의 유머 데이터 ──

export { FOOD_DB, ELEM_FOOD_REASON, ELEM_BONUS_FOOD, getAgeGroup, renderFoodRecommendation, initFoodData };
