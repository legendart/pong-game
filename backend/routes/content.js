// ══════════════════════════════════════════
// content.js - 모든 컨텐츠 데이터 DB 관리
// ══════════════════════════════════════════
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sqlite3   = require('sqlite3').verbose();
const DB_PATH   = join(__dirname, '../db/visitors.db');
const db        = new sqlite3.Database(DB_PATH);

const run = (s,p=[]) => new Promise((res,rej)=>db.run(s,p,function(e){e?rej(e):res(this);}));
const get = (s,p=[]) => new Promise((res,rej)=>db.get(s,p,(e,r)=>e?rej(e):res(r)));
const all = (s,p=[]) => new Promise((res,rej)=>db.all(s,p,(e,r)=>e?rej(e):res(r)));

// ── 테이블 초기화 ──
await run(`CREATE TABLE IF NOT EXISTS content_jokes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  setup      TEXT NOT NULL,
  punchline  TEXT NOT NULL,
  category   TEXT DEFAULT '일반',
  active     INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now','localtime'))
)`);

await run(`CREATE TABLE IF NOT EXISTS content_cheer (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  text     TEXT NOT NULL,
  category TEXT DEFAULT 'wisdom',
  source   TEXT DEFAULT '',
  active   INTEGER DEFAULT 1
)`);

await run(`CREATE TABLE IF NOT EXISTS content_cheer_parts (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  type     TEXT NOT NULL,  -- empathy|opening|action|closing|img_seed
  value    TEXT NOT NULL,
  active   INTEGER DEFAULT 1
)`);

await run(`CREATE TABLE IF NOT EXISTS content_food (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  age_group  TEXT NOT NULL,  -- teen|twenty|thirty|forty|fifty_plus
  name       TEXT NOT NULL,
  emoji      TEXT DEFAULT '',
  desc       TEXT DEFAULT '',
  is_bonus   INTEGER DEFAULT 0,
  element    TEXT DEFAULT '',  -- 오행 (목화토금수)
  active     INTEGER DEFAULT 1
)`);

await run(`CREATE TABLE IF NOT EXISTS content_saju (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  type     TEXT NOT NULL,  -- sipsin_fortune|week_msg|elem_food_reason|elem_color|elem_emoji
  key      TEXT NOT NULL,
  value    TEXT NOT NULL,
  active   INTEGER DEFAULT 1
)`);

await run(`CREATE TABLE IF NOT EXISTS content_zodiac (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  sign     TEXT NOT NULL,  -- 별자리 이름
  type     TEXT NOT NULL,  -- fortune|detail_high|detail_mid|detail_low|tip
  value    TEXT NOT NULL,
  active   INTEGER DEFAULT 1
)`);

// ── 시드 데이터 삽입 (최초 1회) ──
const jokeCnt = await get(`SELECT COUNT(*) as c FROM content_jokes`);
if (jokeCnt.c === 0) {
  await seedJokes();
}
const cheerCnt = await get(`SELECT COUNT(*) as c FROM content_cheer`);
if (cheerCnt.c === 0) {
  await seedCheer();
}
const foodCnt = await get(`SELECT COUNT(*) as c FROM content_food`);
if (foodCnt.c === 0) {
  await seedFood();
}
const sajuCnt = await get(`SELECT COUNT(*) as c FROM content_saju`);
if (sajuCnt.c === 0) {
  await seedSaju();
}
const zodiacCnt = await get(`SELECT COUNT(*) as c FROM content_zodiac`);
if (zodiacCnt.c === 0) {
  await seedZodiac();
}

// ══════════════════════════════════════════
// ── 시드 함수들 ──
// ══════════════════════════════════════════
async function seedJokes() {
  const jokes = [
    ['왜 소는 항상 침대에서 잘까요?','소파에 못 앉으니까요 🛋️','동물'],
    ['왜 개는 시계를 못 볼까요?','멍멍이니까요 ⏰','동물'],
    ['왜 고양이는 수학을 못할까요?','야옹이(이하) 밖에 모르니까요 🐱','동물'],
    ['왜 코끼리는 컴퓨터를 잘 할까요?','코(코드)를 잘 다루니까요 🐘','동물'],
    ['왜 원숭이는 바나나를 좋아할까요?','사과는 너무 비싸서요 🍌','동물'],
    ['왜 물고기는 노래를 못할까요?','항상 물속에서 불러서 버블버블이니까요 🐟','동물'],
    ['왜 펭귄은 항상 정장을 입었을까요?','면접이 항상 있어서요 🐧','동물'],
    ['왜 거북이는 천천히 걸을까요?','급할 게 없거든요 등껍질이 무거워서요 🐢','동물'],
    ['왜 뱀은 다리가 없을까요?','쓸데없이 많이 다니면 안 되니까요 🐍','동물'],
    ['왜 독수리는 안경을 안 쓸까요?','눈이 좋아서요 독수리눈 🦅','동물'],
    ['왜 짜장면은 검을까요?','부끄러움을 타서 얼굴이 검어졌어요 🍜','음식'],
    ['왜 냉면은 차가울까요?','냉면이 더우면 온면이니까요 🍜','음식'],
    ['왜 김치는 빨까요?','부끄러운 게 많아서요 🌶️','음식'],
    ['왜 라면은 꼬불꼬불할까요?','스트레이트는 심심하니까요 🍜','음식'],
    ['왜 피자는 둥글까요?','네모 상자에 넣으려고요 🍕','음식'],
    ['왜 아이스크림은 녹을까요?','더워서요 아이스크림도 사람이에요 🍦','음식'],
    ['왜 삼겹살은 세 겹일까요?','두 겹은 이겹살이니까요 🥓','음식'],
    ['왜 떡볶이는 매울까요?','떡이 심심해서 고추장을 불렀어요 🍢','음식'],
    ['왜 의사는 글씨를 못 쓸까요?','환자가 읽으면 안 되니까요 👨‍⚕️','직업'],
    ['왜 선생님은 칠판을 지울까요?','안 지우면 칠판이 꽉 찰까봐요 👨‍🏫','직업'],
    ['왜 경찰은 총을 갖고 다닐까요?','가방이 너무 무거우면 안 되니까요 👮','직업'],
    ['왜 요리사는 모자를 쓸까요?','머리카락이 국에 빠지면 안 되니까요 👨‍🍳','직업'],
    ['왜 비는 위에서 아래로 내릴까요?','아래에서 위로 오르면 비가 아니고 안개니까요 🌧️','날씨'],
    ['왜 눈은 하얄까요?','핑크 눈이면 이상하잖아요 🌨️','날씨'],
    ['왜 천둥은 번개 다음에 칠까요?','번개가 소리보다 빠르니까요 ⚡','날씨'],
    ['왜 수학은 어려울까요?','x가 어디 있는지 항상 찾아야 하니까요 📐','학교'],
    ['왜 영어는 힘들까요?','한국어가 아니라서요 📚','학교'],
    ['왜 체육은 뛰어야 할까요?','앉아서 하면 미술이니까요 🏃','학교'],
    ['왜 도서관은 조용할까요?','다들 자고 있어서요 📖','학교'],
    ['왜 숙제는 집에서 할까요?','학교에서 하면 수업이니까요 📝','학교'],
    ['왜 엘리베이터는 버튼이 많을까요?','계단이 몇 개인지 모르니까요 🛗','일상'],
    ['왜 거울은 왼쪽과 오른쪽이 반대일까요?','앞뒤를 바꾸면 더 이상하니까요 🪞','일상'],
    ['왜 신발은 두 개일까요?','발이 두 개라서요 👟','일상'],
    ['왜 젓가락은 두 개일까요?','하나면 꼬치니까요 🥢','일상'],
    ['왜 핸드폰은 충전해야 할까요?','안 충전하면 돌덩이니까요 📱','일상'],
    ['왜 컴퓨터는 마우스가 필요할까요?','고양이 없으니까요 🖱️','IT'],
    ['왜 와이파이는 비밀번호가 있을까요?','없으면 옆집이 다 써버리니까요 📶','IT'],
    ['왜 비밀번호는 잊어버릴까요?','기억나면 비밀이 아니니까요 🔐','IT'],
    ['왜 배터리는 항상 부족할까요?','충분하면 충전 안 하니까요 🔋','IT'],
    ['왜 유튜브는 광고가 나올까요?','공짜는 없다는 걸 알려주려고요 📺','IT'],
    ['왜 게임은 질까요?','이기면 게임이 끝나니까요 🎮','IT'],
    ['왜 봄은 꽃이 필까요?','여름에 피면 덥다고 할까봐요 🌸','계절'],
    ['왜 여름은 더울까요?','그게 여름의 직업이니까요 ☀️','계절'],
    ['왜 가을은 낙엽이 질까요?','나무가 옷 갈아입는 시간이에요 🍂','계절'],
    ['왜 겨울은 추울까요?','따뜻하면 가을이니까요 ❄️','계절'],
    ['왜 월요일은 싫을까요?','일요일이 너무 좋아서요 😩','일상'],
    ['왜 주말은 빨리 지날까요?','주중이 너무 길어서요 📅','일상'],
    ['왜 축구공은 둥글까요?','네모면 굴러가지 않으니까요 ⚽','스포츠'],
    ['왜 농구는 공을 던질까요?','발로 차면 축구니까요 🏀','스포츠'],
    ['왜 마라톤은 멀까요?','가까우면 단거리 달리기니까요 🏃','스포츠'],
    ['왜 볼링공은 무거울까요?','가벼우면 잘 굴러가지 않으니까요 🎳','스포츠'],
    ['왜 한국인은 나이를 물어볼까요?','존댓말을 써야 하나 봐야 하니까요 🎂','한국문화'],
    ['왜 한국 밥상엔 반찬이 많을까요?','밥만 먹으면 심심하니까요 🍱','한국문화'],
    ['왜 아빠는 아재개그를 할까요?','안 하면 아빠 자격이 없으니까요 😄','한국문화'],
    ['왜 설날엔 세배를 할까요?','돈을 받으려고요 💰','한국문화'],
    ['왜 치맥은 맛있을까요?','치킨과 맥주의 만남이니까요 🍗🍺','한국문화'],
    ['왜 노래방에서 노래할까요?','집에서 하면 민폐니까요 🎤','한국문화'],
    ['왜 찜질방은 더울까요?','안 더우면 찜질방이 아니니까요 🧖','한국문화'],
    ['고구마를 영어로 하면?','스위트 포테이토! 이거 달콤하죠? 🍠','언어유희'],
    ['불고기를 영어로 하면?','파이어 미트! 뜨겁겠다! 🔥','언어유희'],
    ['찜닭을 영어로 하면?','스팀 치킨! 사우나 다녀왔나요? 🐔','언어유희'],
    ['삼겹살을 영어로 하면?','쓰리 레이어드 포크! 정확한 묘사죠? 🥓','언어유희'],
    ['소주를 영어로 하면?','코리안 보드카! 무섭죠? 🍶','언어유희'],
    ['이발사가 왜 이사를 자주 할까요?','이발이발 해서요 ✂️','언어유희'],
    ['공부와 청소의 공통점은?','둘 다 하기 싫다는 거예요 😅','공통점'],
    ['월요일과 양말의 공통점은?','둘 다 싫다는 거예요 🧦','공통점'],
    ['다이어트와 숙제의 공통점은?','항상 내일부터 시작한다는 거예요 😅','공통점'],
    ['엄마와 구글의 공통점은?','뭐든지 다 안다는 거예요 🔍','공통점'],
    ['아빠와 리모컨의 공통점은?','소파에서 발견된다는 거예요 📺','공통점'],
    ['왜 방귀는 소리가 날까요?','소리 없이 나오면 더 무섭잖아요 💨','신체'],
    ['왜 손가락은 다섯 개일까요?','여섯 개면 장갑 만들기 힘드니까요 ✋','신체'],
    ['왜 눈은 두 개일까요?','하나면 외눈박이니까요 👁️','신체'],
    ['왜 하품은 전염될까요?','아직 과학적으로 연구 중이에요 하품 🥱','신체'],
    ['왜 로켓은 빠를까요?','느리면 폭죽이니까요 🚀','과학'],
    ['왜 자석은 붙을까요?','밀면 안 되니까요 🧲','과학'],
    ['왜 X레이는 뼈가 보일까요?','살이 투명하지 않아서요 🦴','과학'],
    ['왜 빵은 구울까요?','안 구우면 밀가루 덩어리니까요 🍞','음식'],
    ['왜 라면은 후루룩 먹을까요?','조용히 먹으면 분위기가 없어서요 🍜','음식'],
    ['왜 피자는 조각으로 자를까요?','한입에 먹기엔 너무 크니까요 🍕','음식'],
    ['왜 지하철은 땅속을 달릴까요?','지상은 자동차가 다 차지했으니까요 🚇','교통'],
    ['왜 택시는 비쌀까요?','싸면 버스니까요 🚕','교통'],
    ['왜 비행기는 하늘을 날까요?','땅에서 달리면 버스니까요 ✈️','교통'],
    ['왜 자전거는 두 바퀴일까요?','하나면 외발자전거니까요 🚲','교통'],
    ['왜 카드는 긁을까요?','밀면 안 결제되니까요 💳','경제'],
    ['왜 월급은 한 달에 한 번일까요?','매일 주면 회사가 망하니까요 💰','경제'],
    ['왜 세금은 내야 할까요?','안 내면 국가가 운영이 안 되니까요 📊','경제'],
    ['왜 검은 옷은 날씬해 보일까요?','거짓말을 잘 해서요 🖤','패션'],
    ['왜 흰 옷은 금방 더러워질까요?','솔직해서요 🤍','패션'],
    ['왜 양말은 짝이 맞지 않을까요?','세탁기가 한 짝씩 먹어서요 🧦','패션'],
    ['왜 크리스마스엔 선물을 줄까요?','산타가 배달하기 때문이에요 🎅','명절'],
    ['왜 설날엔 떡국을 먹을까요?','추석엔 송편 먹어야 하니까요 🍲','명절'],
    ['왜 빼빼로데이엔 빼빼로를 줄까요?','11월 11일이 빼빼로처럼 생겨서요 🍫','명절'],
    ['사주를 보러 갔더니 "당신은 곧 큰돈이 들어올 것입니다"라고 했어요. 그 다음날...','세금 고지서가 왔습니다 📮','사주운세'],
    ['운세에서 "오늘 귀인을 만납니다"라고 했는데...','거울 보고 혼자 "안녕하세요" 했습니다 🪞','사주운세'],
    ['오늘 운세에 "물을 조심하라"고 나왔어요. 그래서 아침에...','세수를 안 했습니다 지금 냄새가 조금... 😷','사주운세'],
    ['사주를 잘 보는 사람이 복권을 사지 않는 이유는?','이미 당첨번호를 알고 있어서 재미없대요 🎰','사주운세'],
    ['별자리 운세를 믿냐고요? 저는 전갈자리인데요 전갈자리 특징이 뭔 줄 아세요?','"전혀 믿지 않는다"고 나와 있어요 ♏','사주운세'],
    ['오늘의 행운 색은 파란색이라고 해서 파란 옷만 입고 나갔더니...','경찰로 오해받았습니다 👮','사주운세'],
    ['왜 수박씨는 뱉을까요?','삼키면 수박이 자라니까요 🌱','음식'],
    ['왜 껌은 씹을까요?','삼키면 큰일나니까요 😅','음식'],
    ['왜 사탕은 빨까요?','씹으면 금방 없어지니까요 🍭','음식'],
  ];
  for (const [setup, punchline, category] of jokes) {
    await run(`INSERT INTO content_jokes (setup, punchline, category) VALUES (?,?,?)`,
      [setup, punchline, category]);
  }
  console.log(`✅ 아재개그 ${jokes.length}개 시드 완료`);
}

async function seedCheer() {
  // CHEER_DATA
  const cheerData = [
    ['일본 속담이야. "七転び八起き(나나코로비야오키)" — 일곱 번 넘어져도 여덟 번 일어나면 돼.','journey','🇯🇵 일본 속담'],
    ['"転んでも立ち上がれ(코론데모 타치아가레)" — 넘어져도 다시 일어서면 돼. 그게 전부야.','journey','🇯🇵 일본'],
    ['"一期一会(이치고이치에)" — 지금 이 순간은 평생 한 번뿐이야. 소중히 살아봐.','peace','🇯🇵 일본 선불교'],
    ['"石の上にも三年(이시노우에니모 산넨)" — 돌 위에서도 3년이면 따뜻해진대. 조금만 더.','wisdom','🇯🇵 일본 속담'],
    ['"頑張れ!(간바레!)" — 일본 사람들이 진심으로 응원할 때 쓰는 말이야. 힘내!','fire','🇯🇵 일본'],
    ['"千里の道も一歩から(센리노미치모 잇포카라)" — 천 리 길도 한 걸음부터야.','journey','🇯🇵 일본 속담'],
    ['"不怕慢，就怕站(뿌파만 지우파잔)" — 느린 건 괜찮아. 멈추는 게 문제야.','journey','🇨🇳 중국 속담'],
    ['"千里之行，始于足下(천리지행 시어족하)" — 천 리 길도 한 걸음부터.','journey','🇨🇳 노자'],
    ['"加油!(자요우!)" — 직역하면 "기름 넣어!" 근데 힘내라는 뜻이야. 오늘도 연료 충전!','fire','🇨🇳 중국'],
    ['공자가 한 말이야. "배우고 때때로 익히면 기쁘지 아니한가." 배우는 과정 자체가 즐거운 거야.','wisdom','🇨🇳 공자'],
    ['"낙숫물이 댓돌을 뚫는다." — 작은 노력도 꾸준히 하면 결국 해내.','nature','🇰🇷 한국 속담'],
    ['"열 번 찍어 안 넘어가는 나무 없다." — 포기하지 말고 계속 도전해봐.','journey','🇰🇷 한국 속담'],
    ['"고생 끝에 낙이 온다." — 지금 힘든 시간이 좋은 날을 만들고 있어.','journey','🇰🇷 한국 속담'],
    ['"You miss 100% of the shots you don\'t take." — 도전 안 하면 100% 실패야. 일단 쏴봐!','sports','🇺🇸 Wayne Gretzky'],
    ['"Done is better than perfect." — 완벽하게 하려다 못 하는 것보다, 일단 끝내는 게 나아.','journey','🇺🇸 실리콘밸리 격언'],
    ['"Progress, not perfection." — 완벽함보다 발전이야. 어제보다 조금만 나아지면 충분해.','growth','🇺🇸 현대 격언'],
    ['"Every expert was once a beginner." — 모든 전문가도 처음엔 초보였어. 지금 시작하는 게 맞아.','wisdom','🇺🇸 격언'],
    ['"Believe you can and you\'re halfway there." — 할 수 있다고 믿는 순간 이미 반은 온 거야.','fire','🇺🇸 Theodore Roosevelt'],
    ['"Keep calm and carry on." — 침착하게, 계속해봐. 생각보다 잘 할 수 있어.','peace','🇬🇧 영국 격언'],
    ['"Every cloud has a silver lining." — 모든 먹구름에도 은빛 테두리가 있어.','nature','🇬🇧 영국 속담'],
    ['"Fortune favors the brave." — 행운은 용감한 자의 편이야. 한번 해봐!','fire','🇬🇧 라틴 격언'],
    ['"Ohne Fleiß kein Preis." — 노력 없이는 결실도 없어. 심플하지만 진리야.','growth','🇩🇪 독일 속담'],
    ['니체가 말했어. "나를 죽이지 못하는 것은 나를 더 강하게 만든다."','fire','🇩🇪 Nietzsche'],
    ['간디가 한 말이야. "네가 보고 싶은 변화가 되어라."','wisdom','🇮🇳 Gandhi'],
    ['마이클 조던이 말했어. "나는 9000번 이상 슛을 놓쳤어. 그게 내 성공 비결이야."','sports','🏅 Michael Jordan'],
    ['무하마드 알리가 말했어. "불가능은 사실이 아니야, 의견일 뿐이야."','fire','🏅 Muhammad Ali'],
    ['"Pain is temporary, glory is forever." — 고통은 잠시지만 영광은 영원해.','sports','🏅 스포츠 격언'],
    ['봄꽃도 겨울을 버텨야 피어나. 지금 힘든 시간이 봄을 준비하는 거야.','growth','🌸 자연의 지혜'],
    ['대나무는 4년 동안 땅속에서 자라고, 5년째에 6주 만에 27미터를 자라대.','nature','🌿 대나무의 지혜'],
    ['BTS도 말했잖아. "Love yourself." — 자기 자신을 사랑하는 게 제일 먼저야.','peace','🎵 BTS'],
    ['"You are enough." — 너는 지금 이대로도 충분해. 더 증명할 필요 없어.','peace','💫 현대 격언'],
    ['"Show up every day." — 매일 나타나는 것. 그게 전부야.','journey','💫 현대 격언'],
    ['마르쿠스 아우렐리우스가 말했어. "오늘 최선을 다했다면, 그것으로 충분해."','wisdom','🏛 Marcus Aurelius'],
    ['세네카 말이야. "미루는 동안 인생이 지나가. 지금 해봐."','journey','🏛 Seneca'],
    ['루미의 말이야. "어제는 지나갔고, 내일은 아직 오지 않았어. 지금 이 순간이 전부야."','peace','🌙 루미'],
    ['헬렌 켈러가 말했어. "혼자서는 조금 할 수 있어. 함께라면 많이 할 수 있어."','peace','🌙 Helen Keller'],
    ['마틴 루터 킹이 말했어. "지금 당장 날 수 없어도 달릴 수 있어."','journey','🌙 Martin Luther King'],
    ['아프리카 속담이야. "빨리 가려면 혼자 가고, 멀리 가려면 함께 가라."','journey','🌍 아프리카 속담'],
    ['터키 속담이야. "방울방울 모이면 호수가 돼. 작은 노력도 쌓여."','nature','🇹🇷 터키 속담'],
    ['손흥민 아버지가 아들에게 했다는 말이야. "즐기면서 해라."','sports','🇰🇷 Son Heung-min'],
  ];
  for (const [text, category, source] of cheerData) {
    await run(`INSERT INTO content_cheer (text, category, source) VALUES (?,?,?)`,
      [text, category, source]);
  }

  // EMPATHY / OPENING / ACTION / CLOSING / IMG_SEEDS
  const parts = [
    ...['힘든 거 알아.','쉽지 않다는 거 알아.','완벽하지 않아도 돼.','실수해도 괜찮아.',
       '느려도 괜찮아.','지금 네 속도가 맞는 속도야.','남이랑 비교하지 마.',
       '어제보다 조금만 나아지면 돼.','오늘도 고생 많았어.','넌 생각보다 훨씬 잘 하고 있어.',
       '포기하지만 않으면 언젠가 돼.','지금 잘 하고 있어.','너는 충분히 대단해.'].map(v=>['empathy',v]),
    ...['야,','있잖아,','솔직히 말하면,','진짜로,','오늘 한마디 하자면,',
       '내가 보기엔,','딱 한 가지만,','이거 알아?','참고로,','잠깐만,',
       '진심으로,','가만있어봐,','근데 말이야,'].map(v=>['opening',v]),
    ...['오늘 딱 한 가지만 해봐.','일단 시작해봐.','5분만 해봐, 그러면 계속하게 될 거야.',
       '숨 한 번 깊게 쉬고, 다시 해봐.','오늘 하루 버텨봐.','그냥 해봐, 생각하지 말고.',
       '오늘 하나만 잘 해도 충분해.','천천히 해도 돼. 멈추지만 마.',
       '포기하고 싶을 때가 바로 해야 할 때야.','오늘만 버텨봐.'].map(v=>['action',v]),
    ...['응원해! 💪','파이팅! 🔥','잘 될 거야! ✨','믿어! ⭐','화이팅! 💛',
       '넌 할 수 있어! 🌟','기대해! 🎯','좋은 하루 돼! 🌸','힘내! 🚀','최고야! 🏆'].map(v=>['closing',v]),
    ...['plant','seed','bloom','forest','valley','meadow','lake','waterfall','road','path',
       'trail','bridge','horizon','runner','athlete','climb','library','candle','scroll',
       'sprout','blossom','butterfly','sunrise','morning','rain','sunshine','ocean','beach',
       'moon','star','flame','spark','ember','torch','bonfire'].map(v=>['img_seed',v]),
  ];
  for (const [type, value] of parts) {
    await run(`INSERT INTO content_cheer_parts (type, value) VALUES (?,?)`, [type, value]);
  }
  console.log(`✅ 응원 데이터 시드 완료`);
}

async function seedFood() {
  const foods = [
    // teen
    ['teen','마라탕','🌶️','요즘 10대 최애! 얼얼하게 맵고 중독적인 맛',0,'화'],
    ['teen','떡볶이','🍢','국민 간식! 쫄깃한 떡에 달콤매콤한 소스',0,'화'],
    ['teen','두쫀쿠','🧇','SNS에서 핫한 두툼하고 쫄깃한 쿠키',0,'토'],
    ['teen','탕후루','🍡','새콤달콤 과일 탕후루, 요즘 트렌드!',0,'토'],
    ['teen','제육볶음','🥩','든든하게 배 채우는 매콤한 제육!',0,'화'],
    ['teen','치킨','🍗','언제나 옳은 치킨, 오늘도 치킨이지',0,'금'],
    ['teen','불닭볶음면','🍜','도전적인 불닭 챌린지, 해볼 만해?',0,'화'],
    ['teen','버거','🍔','두툼한 패티의 수제버거로 에너지 충전',0,'금'],
    ['teen','라볶이','🥢','라면+떡볶이 = 환상의 조합',0,'화'],
    ['teen','피자','🍕','치즈 가득! 친구들이랑 나눠 먹으면 최고',0,'토'],
    // twenty
    ['twenty','삼겹살','🥓','소주 한 잔과 함께하는 삼겹살 한 판',0,'금'],
    ['twenty','파스타','🍝','크리미하거나 알리오올리오, 집에서도 도전',0,'목'],
    ['twenty','초밥','🍣','한 입에 쏙! 신선한 초밥으로 기분 전환',0,'수'],
    ['twenty','비빔밥','🥗','알록달록 채소와 고추장의 완벽한 조화',0,'목'],
    ['twenty','낙지볶음','🦑','쫄깃한 낙지의 매콤함에 밥 한 공기 뚝딱',0,'화'],
    ['twenty','연어덮밥','🐟','신선한 연어에 아보카도까지, 포만감 최고',0,'수'],
    ['twenty','타코','🌮','바삭한 타코쉘에 가득 채운 맛있는 필링',0,'화'],
    ['twenty','샤브샤브','🥘','신선한 야채와 얇은 고기의 건강한 조합',0,'수'],
    // thirty
    ['thirty','갈비탕','🍲','진하게 우린 갈비탕으로 속 든든하게',0,'수'],
    ['thirty','된장찌개','🫕','구수한 된장찌개로 한국인의 집밥 감성',0,'수'],
    ['thirty','냉면','🍜','시원하고 담백한 냉면 한 그릇',0,'수'],
    ['thirty','보쌈','🥬','부드러운 보쌈에 신선한 배추쌈',0,'금'],
    ['thirty','순두부찌개','🫕','부드러운 순두부에 매콤한 국물',0,'수'],
    ['thirty','황태국','🍵','숙취에도, 피로할 때도 최고인 황태국',0,'수'],
    ['thirty','제육덮밥','🍚','든든한 제육덮밥에 계란후라이 올려서',0,'화'],
    // forty
    ['forty','삼계탕','🍗','원기 회복의 최강자, 삼계탕 한 뚝배기',0,'화'],
    ['forty','청국장','🫕','구수한 청국장 한 그릇으로 건강 챙기기',0,'수'],
    ['forty','나물비빔밥','🥗','각종 나물 가득 담긴 건강한 비빔밥',0,'목'],
    ['forty','생선구이','🐟','고등어나 갈치 구이로 단백질 보충',0,'금'],
    ['forty','두부요리','🫙','고단백 두부로 건강하게 영양 섭취',0,'금'],
    ['forty','미역국','🌿','철분과 요오드 가득한 미역국',0,'수'],
    // fifty_plus
    ['fifty_plus','전복죽','🦪','영양의 왕 전복으로 만든 귀한 죽',0,'수'],
    ['fifty_plus','꼬리곰탕','🍲','콜라겐 듬뿍 꼬리곰탕으로 관절 건강',0,'수'],
    ['fifty_plus','닭백숙','🐓','오랜 시간 정성껏 끓인 영양 닭백숙',0,'화'],
    ['fifty_plus','도토리묵','🌰','혈당 걱정 없는 건강한 도토리묵',0,'목'],
    ['fifty_plus','연두부','🫙','소화 잘 되는 부드러운 연두부',0,'금'],
    ['fifty_plus','잡채','🍜','색색의 채소와 당면이 어우러진 잡채',0,'목'],
    // 오행별 보너스
    ['all','시금치나물','🥬','간 건강에 좋은 녹색 채소의 대표',1,'목'],
    ['all','떡볶이','🌶️','화기 넘치는 날엔 매콤한 떡볶이',1,'화'],
    ['all','단호박죽','🎃','달콤한 단호박이 위장을 편안하게',1,'토'],
    ['all','두부조림','🫙','담백하고 깔끔한 두부조림',1,'금'],
    ['all','미역국','🌿','신장에 좋은 검은 해조류 미역',1,'수'],
  ];
  for (const [age_group, name, emoji, desc, is_bonus, element] of foods) {
    await run(`INSERT INTO content_food (age_group, name, emoji, desc, is_bonus, element) VALUES (?,?,?,?,?,?)`,
      [age_group, name, emoji, desc, is_bonus, element]);
  }
  console.log(`✅ 음식 데이터 시드 완료`);
}

async function seedSaju() {
  const sipsinFortune = {
    '비견': '오늘은 비견(比肩)의 기운입니다. 독립심과 자존감이 높아지는 날로, 나만의 프로젝트나 자기 개발에 집중하면 좋습니다.',
    '겁재': '오늘은 겁재(劫財)의 날입니다. 추진력이 강해지나 과욕은 금물. 재물 지출을 조심하고 에너지를 창의적 활동에 쏟으세요.',
    '식신': '오늘은 식신(食神)의 복이 가득한 날입니다. 창의력과 표현력이 극대화되며 식복(食福)이 열려 있습니다.',
    '상관': '오늘은 상관(傷官)의 기운으로 재능이 폭발하는 날입니다. 예술·창작·아이디어 발표에 최적이지만 권위자와의 충돌은 조심하세요.',
    '편재': '오늘은 편재(偏財)의 날로 활동성이 높아집니다. 사업적 기회와 예상치 못한 수입이 찾아올 수 있습니다.',
    '정재': '오늘은 정재(正財)의 안정된 재물운이 흐릅니다. 성실한 노력이 반드시 결과로 이어지는 날입니다.',
    '편관': '오늘은 편관(偏官)의 도전적 기운이 강합니다. 어려운 일도 정면돌파하면 뜻밖의 성과를 얻을 수 있지만 무리는 금물.',
    '정관': '오늘은 정관(正官)의 기운으로 명예와 신뢰가 높아지는 날입니다. 책임 있는 행동이 장기적으로 큰 보상을 가져옵니다.',
    '편인': '오늘은 편인(偏印)의 직관이 빛나는 날입니다. 학문·연구·영적인 탐구에 좋은 기운이 흐릅니다.',
    '정인': '오늘은 정인(正印)의 지혜로운 기운이 감돕니다. 학습·문서·시험에 최적의 날입니다.',
  };
  for (const [k,v] of Object.entries(sipsinFortune)) {
    await run(`INSERT INTO content_saju (type, key, value) VALUES (?,?,?)`, ['sipsin_fortune', k, v]);
  }

  const weekMsgs = {
    'high_0': '활기차고 긍정적인 에너지가 넘치는 날',
    'high_1': '주변의 지지와 도움이 강하게 느껴지는 날',
    'high_2': '결단력이 빛을 발하는 최고의 날',
    'mid_0': '평온하게 흘러가는 무난한 하루',
    'mid_1': '차분하게 내실을 다지기 좋은 날',
    'mid_2': '작은 노력이 쌓이는 안정적인 날',
    'low_0': '에너지를 비축하며 쉬어가는 날',
    'low_1': '신중함이 필요한 날, 충동적 결정은 금물',
    'low_2': '내면을 돌아보는 성찰의 시간',
  };
  for (const [k,v] of Object.entries(weekMsgs)) {
    await run(`INSERT INTO content_saju (type, key, value) VALUES (?,?,?)`, ['week_msg', k, v]);
  }
  console.log(`✅ 사주 데이터 시드 완료`);
}

async function seedZodiac() {
  const zf = {
    '양자리': ['오늘은 새로운 도전을 시작하기 최적의 날입니다. 용기 있는 첫 걸음이 큰 변화를 만들어냅니다.','활발한 에너지가 넘치는 하루입니다. 팀 활동과 협력에서 리더십을 발휘할 기회가 찾아옵니다.'],
    '황소자리': ['안정과 실리를 추구하는 날입니다. 재물 관련 결정은 신중하게, 좋은 기회가 있다면 망설이지 마세요.','감각적인 즐거움을 찾는 하루입니다. 맛있는 음식이나 좋은 음악으로 충전해보세요.'],
    '쌍둥이자리': ['다양한 아이디어가 샘솟는 하루입니다. 소통과 네트워킹에서 뜻밖의 기회를 잡을 수 있습니다.','호기심이 이끄는 대로 새로운 분야를 탐색해 보세요.'],
    '게자리': ['감정이 풍부해지는 하루입니다. 가까운 사람들과의 소통으로 마음의 안정을 찾으세요.','직관이 강해지는 날입니다. 내면의 목소리를 믿어 보세요.'],
    '사자자리': ['창의적인 에너지가 최고조인 날입니다. 자신의 재능을 마음껏 표현하고 주목받을 기회를 잡으세요.','리더십이 빛나는 하루입니다. 오늘이 최적의 타이밍입니다.'],
    '처녀자리': ['세심한 분석력이 돋보이는 날입니다. 미루어 두었던 작업을 정리하기 좋은 날입니다.','건강 관리에 신경 쓰기 좋은 하루입니다. 몸의 신호에 귀를 기울이세요.'],
    '천칭자리': ['인간관계에서 균형이 중요한 날입니다. 갈등이 있다면 화해와 타협의 적기입니다.','아름다운 것들에서 영감을 받고 창의력을 키워보세요.'],
    '전갈자리': ['깊은 통찰력이 발휘되는 날입니다. 숨겨진 진실을 발견하거나 중요한 정보를 얻을 기회가 생깁니다.','변화를 두려워하지 마세요. 오늘의 작은 변혁이 큰 성장을 가져옵니다.'],
    '사수자리': ['자유와 탐험을 향한 열망이 강해지는 날입니다. 새로운 배움이나 여행에 관련된 좋은 소식이 찾아올 수 있습니다.','낙관적인 에너지가 주변을 밝히는 하루입니다.'],
    '염소자리': ['목표를 향한 노력이 결실을 맺는 날입니다. 작은 성취도 놓치지 말고 스스로를 격려하세요.','장기 계획을 점검하고 다음 단계를 구체화해 보세요.'],
    '물병자리': ['혁신적인 아이디어가 떠오르는 날입니다. 독창적인 시각으로 문제를 접근하면 돌파구를 찾을 수 있습니다.','커뮤니티 활동이나 뜻 있는 사람들과의 교류에서 에너지를 얻으세요.'],
    '물고기자리': ['감수성과 직관이 극대화되는 날입니다. 예술·음악·명상 등 내면을 풍요롭게 하는 활동을 즐겨보세요.','타인에 대한 공감 능력이 높아지는 하루입니다.'],
  };
  for (const [sign, fortunes] of Object.entries(zf)) {
    for (const v of fortunes) {
      await run(`INSERT INTO content_zodiac (sign, type, value) VALUES (?,?,?)`, [sign, 'fortune', v]);
    }
  }

  const details = [
    ['high', '별들의 기운이 완벽하게 정렬된 날입니다. 오랫동안 기다려온 일이 드디어 결실을 맺을 수 있습니다. 자신감을 갖고 적극적으로 나아가세요.'],
    ['high', '우주의 에너지가 당신 편인 날입니다. 새로운 만남이나 기회를 두려워하지 말고 당당하게 받아들이세요.'],
    ['mid', '평화롭고 안정적인 에너지가 감돌고 있습니다. 큰 변화보다는 현재에 집중하고 내실을 다지는 것이 좋습니다.'],
    ['mid', '균형 잡힌 하루가 될 것입니다. 주변 사람들과의 관계도 원만하게 유지됩니다.'],
    ['low', '에너지가 낮은 날입니다. 무리한 도전보다는 재충전에 집중하세요. 휴식이 곧 더 큰 도약을 위한 준비입니다.'],
    ['low', '신중함이 요구되는 날입니다. 중요한 결정은 며칠 후로 미루고 오늘은 관찰과 준비의 시간으로 삼으세요.'],
  ];
  for (const [level, value] of details) {
    await run(`INSERT INTO content_zodiac (sign, type, value) VALUES (?,?,?)`, ['all', `detail_${level}`, value]);
  }
  console.log(`✅ 별자리 데이터 시드 완료`);
}

// ══════════════════════════════════════════
// ── 공개 API 엔드포인트 ──
// ══════════════════════════════════════════
const router = express.Router();

// GET /api/content/jokes?limit=1
router.get('/jokes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 20);
    const rows = await all(
      `SELECT id, setup, punchline, category FROM content_jokes WHERE active=1 ORDER BY RANDOM() LIMIT ?`,
      [limit]
    );
    res.json({ ok: true, jokes: rows });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/content/cheer
router.get('/cheer', async (_req, res) => {
  try {
    const [cheer, parts] = await Promise.all([
      all(`SELECT id, text, category, source FROM content_cheer WHERE active=1`),
      all(`SELECT id, type, value FROM content_cheer_parts WHERE active=1`),
    ]);
    const grouped = {};
    for (const p of parts) {
      if (!grouped[p.type]) grouped[p.type] = [];
      grouped[p.type].push(p.value);
    }
    res.json({ ok: true, cheer, parts: grouped });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/content/food
router.get('/food', async (_req, res) => {
  try {
    const rows = await all(`SELECT id, age_group, name, emoji, desc, is_bonus, element FROM content_food WHERE active=1`);
    res.json({ ok: true, food: rows });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/content/saju
router.get('/saju', async (_req, res) => {
  try {
    const rows = await all(`SELECT id, type, key, value FROM content_saju WHERE active=1`);
    res.json({ ok: true, saju: rows });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/content/zodiac
router.get('/zodiac', async (_req, res) => {
  try {
    const rows = await all(`SELECT id, sign, type, value FROM content_zodiac WHERE active=1`);
    res.json({ ok: true, zodiac: rows });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/content/all - 한 번에 전체 로드
router.get('/all', async (_req, res) => {
  try {
    const [jokes, cheer, cheerParts, food, saju, zodiac] = await Promise.all([
      all(`SELECT id, setup, punchline, category FROM content_jokes WHERE active=1`),
      all(`SELECT id, text, category, source FROM content_cheer WHERE active=1`),
      all(`SELECT id, type, value FROM content_cheer_parts WHERE active=1`),
      all(`SELECT id, age_group, name, emoji, desc, is_bonus, element FROM content_food WHERE active=1`),
      all(`SELECT id, type, key, value FROM content_saju WHERE active=1`),
      all(`SELECT id, sign, type, value FROM content_zodiac WHERE active=1`),
    ]);
    const parts = {};
    for (const p of cheerParts) {
      if (!parts[p.type]) parts[p.type] = [];
      parts[p.type].push(p.value);
    }
    res.json({ ok: true, jokes, cheer, cheerParts: parts, food, saju, zodiac });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

export { db };
export default router;
