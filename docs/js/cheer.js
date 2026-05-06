import { API_BASE, HAS_BACKEND } from './config.js';

// ── 전 세계 응원 메시지 시스템 ──

// ── 응원 메시지 풀 ──
// ══════════════════════════════════════════
// ── 전 세계 응원 시스템 v2 (5만개+ 조합 / 매번 완전 랜덤) ──
// ══════════════════════════════════════════

// 이미지 카테고리 → picsum seed 풀
const IMG_SEEDS = {
  nature:  ['plant','seed','bloom','forest','valley','meadow','lake','waterfall','misty','dawn','dusk','cloud','snowpeak','greenhill','leaves','roots','moss','fern','pine','oak'],
  journey: ['road','path','trail','bridge','horizon','crossroads','steps','door','gate','map','compass','voyage','wanderer','explore','distance','direction','walk','forward','start','goal'],
  sports:  ['runner','athlete','climb','leap','swim','cycle','strength','team','victory','champion','training','field','court','track','medal','sweat','push','sprint','endure','rise'],
  wisdom:  ['library','candle','scroll','ink','quill','lantern','hourglass','scales','mirror','prism','telescope','compass2','anchor','lighthouse','key','arch','pillar','stone','sage','elder'],
  growth:  ['sprout','blossom','butterfly','cocoon','sunrise','morning','rain','sunshine','garden','soil','harvest','season','renewal','rebirth','cycle','flow','river','tide','wave','peak'],
  peace:   ['ocean','beach','pebble','sand','breath','still','fog','moon','star','sky','cloud2','soft','gentle','quiet','calm','rest','sleep','dream','float','glow'],
  fire:    ['flame','spark','ember','torch','bonfire','forge','fuel','heat','blaze','ignite','glow2','shine','bright','bold','energy','pulse','power','surge','drive','passion'],
};

let CHEER_CACHE = null;

async function initCheerData() {
  if (!HAS_BACKEND) return;
  try {
    const res = await fetch(`${API_BASE}/api/content/cheer`);
    if (!res.ok) throw new Error('Failed to load cheer data');
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length) CHEER_CACHE = json.data;
  } catch (e) {
    console.warn('Cheer data load failed:', e);
  }
}

// 전 세계 명언 + 응원 데이터 (카테고리별)
const CHEER_DATA = [
  // ── 🇯🇵 일본 ──
  {t:'일본 속담이야. "七転び八起き(나나코로비야오키)" — 일곱 번 넘어져도 여덟 번 일어나면 돼.',c:'journey',src:'🇯🇵 일본 속담'},
  {t:'"転んでも立ち上がれ(코론데모 타치아가레)" — 넘어져도 다시 일어서면 돼. 그게 전부야.',c:'journey',src:'🇯🇵 일본'},
  {t:'"一期一会(이치고이치에)" — 지금 이 순간은 평생 한 번뿐이야. 소중히 살아봐.',c:'peace',src:'🇯🇵 일본 선불교'},
  {t:'"石の上にも三年(이시노우에니모 산넨)" — 돌 위에서도 3년이면 따뜻해진대. 조금만 더.',c:'wisdom',src:'🇯🇵 일본 속담'},
  {t:'"頑張れ!(간바레!)" — 일본 사람들이 진심으로 응원할 때 쓰는 말이야. 힘내!',c:'fire',src:'🇯🇵 일본'},
  {t:'"花より団子(하나요리 당고)" 말고, 오늘은 꽃도 한번 봐봐. 지금 이 순간도 아름다워.',c:'growth',src:'🇯🇵 일본'},
  {t:'일본 검도에서는 이렇게 말해. "一本(입폰)" — 한 번의 진심 어린 시도가 전부야.',c:'sports',src:'🇯🇵 일본 검도'},
  {t:'"千里の道も一歩から(센리노미치모 잇포카라)" — 천 리 길도 한 걸음부터야.',c:'journey',src:'🇯🇵 일본 속담'},
  // ── 🇨🇳 중국 ──
  {t:'"不怕慢，就怕站(뿌파만 지우파잔)" — 느린 건 괜찮아. 멈추는 게 문제야.',c:'journey',src:'🇨🇳 중국 속담'},
  {t:'"千里之行，始于足下(천리지행 시어족하)" — 천 리 길도 한 걸음부터.',c:'journey',src:'🇨🇳 노자'},
  {t:'"加油!(자요우!)" — 직역하면 "기름 넣어!" 근데 힘내라는 뜻이야. 오늘도 연료 충전!',c:'fire',src:'🇨🇳 중국'},
  {t:'"吃苦(츠쿠)" — 쓴 것을 먹는다는 뜻인데, 힘든 걸 견뎌내는 능력이야. 넌 이미 잘 하고 있어.',c:'wisdom',src:'🇨🇳 중국 문화'},
  {t:'공자가 한 말이야. "배우고 때때로 익히면 기쁘지 아니한가." 배우는 과정 자체가 즐거운 거야.',c:'wisdom',src:'🇨🇳 공자'},
  {t:'공자 말씀이야. "아는 것이 좋아하는 것만 못하고, 좋아하는 것이 즐기는 것만 못하다." 즐겨봐!',c:'wisdom',src:'🇨🇳 공자'},
  {t:'"百尺竿头，更进一步" — 이미 100척 장대 끝에 올랐어도 한 발 더 나아갈 수 있어.',c:'growth',src:'🇨🇳 중국 선불교'},
  {t:'노자가 말했어. "知人者智，自知者明(남을 아는 건 지혜, 나를 아는 건 밝음)." 오늘 스스로를 한번 바라봐.',c:'peace',src:'🇨🇳 노자'},
  // ── 🇰🇷 한국 ──
  {t:'"낙숫물이 댓돌을 뚫는다." — 작은 노력도 꾸준히 하면 결국 해내.',c:'nature',src:'🇰🇷 한국 속담'},
  {t:'"호랑이에게 물려가도 정신만 차리면 살아남아." 어떤 상황에서도 정신 똑바로!',c:'wisdom',src:'🇰🇷 한국 속담'},
  {t:'"열 번 찍어 안 넘어가는 나무 없다." — 포기하지 말고 계속 도전해봐.',c:'journey',src:'🇰🇷 한국 속담'},
  {t:'"콩 심은 데 콩 나고, 팥 심은 데 팥 난다." — 오늘 하는 노력이 나중에 결과로 돌아와.',c:'growth',src:'🇰🇷 한국 속담'},
  {t:'"가는 말이 고와야 오는 말이 곱다." — 오늘 좋은 말 한 마디 건네봐. 돌아와.',c:'peace',src:'🇰🇷 한국 속담'},
  {t:'"고생 끝에 낙이 온다." — 지금 힘든 시간이 좋은 날을 만들고 있어.',c:'journey',src:'🇰🇷 한국 속담'},
  {t:'"될성부른 나무는 떡잎부터 알아본다." — 지금 네가 보여주는 작은 노력이 이미 대단해.',c:'growth',src:'🇰🇷 한국 속담'},
  // ── 🇺🇸 미국 ──
  {t:'"You miss 100% of the shots you don\'t take." — 도전 안 하면 100% 실패야. 일단 쏴봐!',c:'sports',src:'🇺🇸 Wayne Gretzky'},
  {t:'"Fake it till you make it." — 될 때까지 된 척해봐. 신기하게 그게 진짜가 돼.',c:'fire',src:'🇺🇸 미국 격언'},
  {t:'"Done is better than perfect." — 완벽하게 하려다 못 하는 것보다, 일단 끝내는 게 나아.',c:'journey',src:'🇺🇸 실리콘밸리 격언'},
  {t:'"Progress, not perfection." — 완벽함보다 발전이야. 어제보다 조금만 나아지면 충분해.',c:'growth',src:'🇺🇸 현대 격언'},
  {t:'"Start where you are. Use what you have. Do what you can." — 지금 있는 곳에서, 있는 걸로, 할 수 있는 것부터.',c:'journey',src:'🇺🇸 Arthur Ashe'},
  {t:'"Every expert was once a beginner." — 모든 전문가도 처음엔 초보였어. 지금 시작하는 게 맞아.',c:'wisdom',src:'🇺🇸 격언'},
  {t:'"It\'s not about how hard you fall. It\'s about how fast you get up." — 넘어지는 게 문제가 아니야.',c:'sports',src:'🇺🇸 권투 격언'},
  {t:'"The only way to do great work is to love what you do." — 하는 일을 사랑하면 저절로 잘 하게 돼.',c:'fire',src:'🇺🇸 Steve Jobs'},
  {t:'"Believe you can and you\'re halfway there." — 할 수 있다고 믿는 순간 이미 반은 온 거야.',c:'fire',src:'🇺🇸 Theodore Roosevelt'},
  {t:'"You are braver than you believe, stronger than you seem." — 넌 스스로 생각하는 것보다 용감하고 강해.',c:'peace',src:'🇺🇸 Winnie the Pooh'},
  {t:'"In the middle of every difficulty lies opportunity." — 모든 어려움 속에 기회가 있어.',c:'wisdom',src:'🇺🇸 Albert Einstein'},
  {t:'"It always seems impossible until it\'s done." — 모든 일은 하기 전엔 불가능해 보여. 근데 해보면 돼.',c:'journey',src:'🇿🇦 Nelson Mandela'},
  // ── 🇬🇧 영국 ──
  {t:'"Keep calm and carry on." — 침착하게, 계속해봐. 생각보다 잘 할 수 있어.',c:'peace',src:'🇬🇧 영국 격언'},
  {t:'"Every cloud has a silver lining." — 모든 먹구름에도 은빛 테두리가 있어. 힘든 일에도 좋은 면이 있어.',c:'nature',src:'🇬🇧 영국 속담'},
  {t:'"It\'s not over till it\'s over." — 끝날 때까지 끝난 게 아니야.',c:'sports',src:'🇬🇧 영국 격언'},
  {t:'"Fortune favors the brave." — 행운은 용감한 자의 편이야. 한번 해봐!',c:'fire',src:'🇬🇧 라틴 격언'},
  {t:'셰익스피어가 말했어. "All the world\'s a stage." — 이 세상이 무대야. 오늘 네 무대에서 빛내봐.',c:'wisdom',src:'🇬🇧 Shakespeare'},
  // ── 🇩🇪 독일 ──
  {t:'"Ohne Fleiß kein Preis." — 노력 없이는 결실도 없어. 심플하지만 진리야.',c:'growth',src:'🇩🇪 독일 속담'},
  {t:'"Aller Anfang ist schwer." — 모든 시작은 어려워. 근데 시작했다는 게 이미 대단한 거야.',c:'journey',src:'🇩🇪 독일 속담'},
  {t:'"Übung macht den Meister." — 연습이 달인을 만들어. 지금 하는 반복이 쌓이고 있어.',c:'sports',src:'🇩🇪 독일 속담'},
  {t:'니체가 말했어. "나를 죽이지 못하는 것은 나를 더 강하게 만든다." 지금 힘든 것도 결국엔 강하게 해줘.',c:'fire',src:'🇩🇪 Nietzsche'},
  {t:'괴테가 말했어. "지금 할 수 있다고 생각하는 것을 바로 시작해라." 꿈만 꾸지 말고 오늘 시작해봐.',c:'journey',src:'🇩🇪 Goethe'},
  // ── 🇫🇷 프랑스 ──
  {t:'"Petit à petit, l\'oiseau fait son nid." — 조금씩 조금씩, 새도 둥지를 짓잖아. 서두르지 마.',c:'growth',src:'🇫🇷 프랑스 속담'},
  {t:'"C\'est la vie." — 이게 인생이야. 너무 힘들게 생각하지 마. 그냥 살아봐.',c:'peace',src:'🇫🇷 프랑스 표현'},
  {t:'"Tout vient à point à qui sait attendre." — 기다릴 줄 아는 사람에게 때가 오기 마련이야.',c:'peace',src:'🇫🇷 프랑스 속담'},
  {t:'생텍쥐페리가 말했어. "완벽함이란 더 이상 더할 게 없을 때가 아니라 뺄 게 없을 때야." 단순하게 살아봐.',c:'wisdom',src:'🇫🇷 Saint-Exupéry'},
  // ── 🇮🇹 이탈리아 ──
  {t:'"Chi va piano va sano e va lontano." — 천천히 가는 사람이 건강하게 멀리 가. 서두르지 마.',c:'journey',src:'🇮🇹 이탈리아 속담'},
  {t:'"La dolce vita." — 달콤한 삶. 오늘 작은 즐거움 하나 찾아봐.',c:'peace',src:'🇮🇹 이탈리아 표현'},
  // ── 🌍 아프리카 ──
  {t:'아프리카 속담이야. "빨리 가려면 혼자 가고, 멀리 가려면 함께 가라." 주변 사람들이 소중해.',c:'journey',src:'🌍 아프리카 속담'},
  {t:'스와힐리어 속담이야. "Haraka haraka haina baraka." — 급히 서두르면 복이 없어. 천천히 꾸준히.',c:'nature',src:'🌍 스와힐리 속담'},
  {t:'아프리카 속담이야. "나무가 굵어지는 건 하룻밤 사이가 아니야." 지금 네가 자라고 있어.',c:'growth',src:'🌍 아프리카 속담'},
  {t:'우분투 철학이야. "나는 우리가 있기에 존재한다." 너 혼자가 아니야.',c:'peace',src:'🌍 아프리카 우분투'},
  // ── 🇮🇳 인도 ──
  {t:'간디가 한 말이야. "네가 보고 싶은 변화가 되어라." 세상을 바꾸고 싶으면 내가 먼저 바뀌면 돼.',c:'wisdom',src:'🇮🇳 Gandhi'},
  {t:'인도 속담이야. "하루 한 시간의 노력이 10년을 바꾼다." 오늘 한 시간만 집중해봐.',c:'growth',src:'🇮🇳 인도 속담'},
  {t:'산스크리트 격언이야. "Vasudhaiva Kutumbakam" — 온 세상이 한 가족이야. 너 혼자가 아니야.',c:'peace',src:'🇮🇳 산스크리트'},
  {t:'타고르가 말했어. "믿음은 새벽을 맞이하는 새처럼, 아직 어둠 속에서 빛을 노래하는 것이야."',c:'nature',src:'🇮🇳 Tagore'},
  // ── 🇹🇷 터키/중동 ──
  {t:'터키 속담이야. "Damlaya damlaya göl olur." — 방울방울 모이면 호수가 돼. 작은 노력도 쌓여.',c:'nature',src:'🇹🇷 터키 속담'},
  {t:'아랍 속담이야. "인내는 기쁨의 열쇠야." 지금 힘든 시간도 기쁨으로 가는 길이야.',c:'peace',src:'🌙 아랍 속담'},
  {t:'페르시아 시인 루미가 말했어. "상처 입은 곳에 빛이 들어와." 힘든 경험이 빛을 만들어.',c:'wisdom',src:'🌙 루미'},
  {t:'루미의 말이야. "어제는 지나갔고, 내일은 아직 오지 않았어. 지금 이 순간이 전부야."',c:'peace',src:'🌙 루미'},
  // ── 🧘 철학 ──
  {t:'마르쿠스 아우렐리우스가 말했어. "오늘 최선을 다했다면, 그것으로 충분해."',c:'wisdom',src:'🏛 Marcus Aurelius'},
  {t:'에픽테토스가 말했어. "통제할 수 없는 건 신경 쓰지 마. 통제할 수 있는 것에 집중해."',c:'wisdom',src:'🏛 Epictetus'},
  {t:'소크라테스가 말했어. "나는 내가 모른다는 것을 안다." 모르는 걸 인정하는 게 지혜의 시작이야.',c:'wisdom',src:'🏛 Socrates'},
  {t:'아리스토텔레스 말이야. "탁월함은 행동이 아니라 습관이야." 오늘의 습관이 미래를 만들어.',c:'wisdom',src:'🏛 Aristotle'},
  {t:'세네카가 말했어. "우리는 생각에서 어둠을 겪는다, 실제에서는 그렇지 않은데." 너무 걱정하지 마.',c:'peace',src:'🏛 Seneca'},
  {t:'세네카 말이야. "Dum differtur vita transcurrit." — 미루는 동안 인생이 지나가. 지금 해봐.',c:'journey',src:'🏛 Seneca'},
  // ── 🏅 스포츠 ──
  {t:'마이클 조던이 말했어. "나는 9000번 이상 슛을 놓쳤어. 그게 내 성공 비결이야."',c:'sports',src:'🏅 Michael Jordan'},
  {t:'세리나 윌리엄스가 말했어. "챔피언은 우승했을 때 만들어지는 게 아니야. 힘들 때 일어서면서 만들어져."',c:'sports',src:'🏅 Serena Williams'},
  {t:'무하마드 알리가 말했어. "불가능은 사실이 아니야, 의견일 뿐이야."',c:'fire',src:'🏅 Muhammad Ali'},
  {t:'무하마드 알리 말이야. "나는 힘들기 때문에 훈련하는 게 아니야. 챔피언이기 때문이야."',c:'sports',src:'🏅 Muhammad Ali'},
  {t:'"Pain is temporary, glory is forever." — 고통은 잠시지만 영광은 영원해.',c:'sports',src:'🏅 스포츠 격언'},
  {t:'손흥민 아버지가 아들에게 했다는 말이야. "즐기면서 해라." 지금 하는 일, 즐기고 있어?',c:'sports',src:'🇰🇷 Son Heung-min'},
  {t:'코비 브라이언트가 말했어. "새벽 4시의 LA는 어떤 모습일지 알아? 나는 알아." 그 새벽이 지금을 만들어.',c:'fire',src:'🏅 Kobe Bryant'},
  {t:'"Champions are made in the moments they want to quit." — 포기하고 싶은 그 순간에 챔피언이 만들어져.',c:'sports',src:'🏅 스포츠 격언'},
  // ── 🌸 자연/삶 ──
  {t:'봄꽃도 겨울을 버텨야 피어나. 지금 힘든 시간이 봄을 준비하는 거야.',c:'growth',src:'🌸 자연의 지혜'},
  {t:'대나무는 4년 동안 땅속에서 자라고, 5년째에 6주 만에 27미터를 자라대. 보이지 않아도 자라고 있어.',c:'nature',src:'🌿 대나무의 지혜'},
  {t:'씨앗은 땅속에서 조용히 자라. 지금 아무것도 안 보여도 준비되고 있는 거야.',c:'growth',src:'🌱 씨앗의 지혜'},
  {t:'나비가 되려면 애벌레 시절을 지나야 해. 지금 네가 있는 단계가 맞는 단계야.',c:'growth',src:'🦋 변화의 지혜'},
  {t:'강은 돌아가도 결국 바다에 닿아. 지금 우회하는 것처럼 느껴도 가고 있는 거야.',c:'nature',src:'🌊 강의 지혜'},
  {t:'산은 한걸음씩 올라야 정상에 닿아. 크게 보지 말고 지금 발 앞의 한 걸음만 봐.',c:'journey',src:'⛰ 산의 지혜'},
  // ── 💫 현대 ──
  {t:'BTS도 말했잖아. "Love yourself." — 자기 자신을 사랑하는 게 제일 먼저야.',c:'peace',src:'🎵 BTS'},
  {t:'"You are enough." — 너는 지금 이대로도 충분해. 더 증명할 필요 없어.',c:'peace',src:'💫 현대 격언'},
  {t:'"Show up every day." — 매일 나타나는 것. 그게 전부야. 오늘도 나타난 거 잘했어.',c:'journey',src:'💫 현대 격언'},
  {t:'"Your vibe attracts your tribe." — 네 에너지가 비슷한 사람들을 끌어당겨. 좋은 에너지 내봐.',c:'fire',src:'💫 현대 격언'},
  {t:'"Comparison is the thief of joy." — 비교는 기쁨을 빼앗아가. 남이랑 비교하지 마.',c:'wisdom',src:'💫 Theodore Roosevelt'},
  {t:'"Be the energy you want to attract." — 원하는 에너지가 되어봐. 그게 끌어당겨.',c:'fire',src:'💫 현대 격언'},
  {t:'"The best time to plant a tree was 20 years ago. The second best time is now." — 지금 시작해.',c:'growth',src:'💫 중국 격언'},
  {t:'"You don\'t have to be great to start, but you have to start to be great." — 시작해야 위대해져.',c:'journey',src:'💫 Zig Ziglar'},
  {t:'"Hard work beats talent when talent doesn\'t work hard." — 노력은 재능을 이겨. 꾸준히 해봐.',c:'sports',src:'💫 Tim Notke'},
  {t:'"Your only limit is your mind." — 네 한계는 네 생각이야. 생각을 바꿔봐.',c:'fire',src:'💫 현대 격언'},
  // ── 🌙 저녁/밤 ──
  {t:'헬렌 켈러가 말했어. "혼자서는 조금 할 수 있어. 함께라면 많이 할 수 있어."',c:'peace',src:'🌙 Helen Keller'},
  {t:'넬슨 만델라가 말했어. "나는 항상 나 자신에게 이렇게 말해. 나는 할 수 있다."',c:'fire',src:'🌙 Nelson Mandela'},
  {t:'마틴 루터 킹이 말했어. "지금 당장 날 수 없어도 달릴 수 있어. 달릴 수 없으면 걸어. 걸을 수 없으면 기어서라도."',c:'journey',src:'🌙 Martin Luther King'},
  {t:'테레사 수녀가 말했어. "오늘 할 수 있는 선한 일을 내일로 미루지 마."',c:'wisdom',src:'🌙 Mother Teresa'},
  {t:'오프라 윈프리가 말했어. "나는 운이 아니라 기회를 믿어. 기회는 준비된 사람에게 와."',c:'growth',src:'🌙 Oprah Winfrey'},
];

// 공감 문장 (확장)
const EMPATHY = [
  '힘든 거 알아.','쉽지 않다는 거 알아.','완벽하지 않아도 돼.','실수해도 괜찮아.',
  '느려도 괜찮아.','모르는 게 있어도 괜찮아.','지금 네 속도가 맞는 속도야.',
  '남이랑 비교하지 마.','어제보다 조금만 나아지면 돼.','오늘도 고생 많았어.',
  '넌 생각보다 훨씬 잘 하고 있어.','지금 당장 결과가 안 보여도 괜찮아.',
  '포기하지만 않으면 언젠가 돼.','그냥 네 페이스대로 가면 돼.','지쳐있지? 그래도 괜찮아.',
  '완벽한 사람은 없어.','틀려도 괜찮아, 그게 배우는 거야.','지금 잘 하고 있어.',
  '너는 충분히 대단해.','아무도 처음부터 잘 하진 않아.',
];
// 오프닝 (확장)
const OPENING = [
  '야,','있잖아,','솔직히 말하면,','진짜로,','오늘 한마디 하자면,',
  '내가 보기엔,','딱 한 가지만,','잠깐 들어봐.','이거 알아?','참고로,',
  '오늘의 한마디야.','잠깐,','솔직히,','어이,','사실은,',
  '잠깐만,','진심으로,','가만있어봐,','근데 말이야,','있잖아 있잖아,',
];
// 액션 (확장)
const ACTION = [
  '오늘 딱 한 가지만 해봐.','일단 시작해봐.','5분만 해봐, 그러면 계속하게 될 거야.',
  '지금 당장 할 수 있는 제일 작은 것부터 해.','숨 한 번 깊게 쉬고, 다시 해봐.',
  '오늘 하루 버텨봐.','그냥 해봐, 생각하지 말고.','오늘 하나만 잘 해도 충분해.',
  '완벽하게 하려 하지 말고 일단 해봐.','틀려도 돼, 그게 배우는 거야.',
  '천천히 해도 돼. 멈추지만 마.','오늘 조금만 더 해봐.','한 걸음만 더 내딛어봐.',
  '지금 이 순간에 집중해봐.','걱정은 나중에 해. 지금은 그냥 해봐.',
  '작게 시작해봐. 크게 끝낼 수 있어.','포기하고 싶을 때가 바로 해야 할 때야.',
  '오늘만 버텨봐.','그냥 한번 해봐.','지금 바로 해봐.',
];
// 마무리 (확장)
const CLOSING = [
  '응원해! 💪','파이팅! 🔥','잘 될 거야! ✨','믿어! ⭐','화이팅! 💛',
  '넌 할 수 있어! 🌟','기대해! 🎯','오늘도 잘 할 거야! 🌈','좋은 하루 돼! 🌸',
  '힘내! 🚀','잘 하고 있어! 👍','그게 맞아! 💯','최고야! 🏆',
  '자랑스러워! 🎉','대단해! 🌠','',  '','','',''
];

// 이미지 선택 함수 (카테고리 + 랜덤 seed)
function getCheerImage(category, r) {
  const seeds = IMG_SEEDS[category] || IMG_SEEDS.nature;
  const seed = seeds[Math.floor(r() * seeds.length)];
  return `https://picsum.photos/seed/${seed}/480/200`;
}

// 템플릿 정의
const CTEMPLATES = [
  (d,r)=>({text:d.t, img:getCheerImage(d.c,r), src:d.src}),
  (d,r)=>({text:`${pick(r,EMPATHY)} ${d.t}`, img:getCheerImage(d.c,r), src:d.src}),
  (d,r)=>({text:`${pick(r,OPENING)} ${d.t}`, img:getCheerImage(d.c,r), src:d.src}),
  (d,r)=>{const c=pick(r,CLOSING);return{text:c?`${d.t} ${c}`:d.t, img:getCheerImage(d.c,r), src:d.src};},
  (d,r)=>{const c=pick(r,CLOSING);return{text:c?`${pick(r,OPENING)} ${d.t} ${c}`:`${pick(r,OPENING)} ${d.t}`, img:getCheerImage(d.c,r), src:d.src};},
  (d,r)=>{const c=pick(r,CLOSING);return{text:c?`${pick(r,EMPATHY)} ${d.t} ${c}`:`${pick(r,EMPATHY)} ${d.t}`, img:getCheerImage(d.c,r), src:d.src};},
  (d,r)=>({text:`${pick(r,EMPATHY)} ${pick(r,ACTION)}`, img:getCheerImage('journey',r), src:'💡 오늘의 액션'}),
  (d,r)=>{const c=pick(r,CLOSING);const txt=`${pick(r,EMPATHY)} ${pick(r,ACTION)}`;return{text:c?`${txt} ${c}`:txt, img:getCheerImage('journey',r), src:'💡 오늘의 액션'};},
];

function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

function getCheerMsg(bd, seed) {
  const items = CHEER_CACHE || CHEER_DATA;
  let s = (seed && Number.isFinite(seed)) ? seed >>> 0 : (Math.floor(Math.random() * 4294967295)) >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const item = items[Math.floor(r() * items.length)] || CHEER_DATA[0];
  const tmpl = CTEMPLATES[Math.floor(r() * CTEMPLATES.length)];
  return tmpl(item, r);
}






// ══════════════════════════════════════════
// ── 2. 유틸 함수 ──

export { CTEMPLATES, IMG_SEEDS, getCheerMsg, getCheerImage, initCheerData };
