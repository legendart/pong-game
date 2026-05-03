import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db/visitors.db');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(DB_PATH);

const run = (sql, p=[]) => new Promise((res,rej) => db.run(sql,p,function(e){e?rej(e):res(this);}));

// Zodiac data from zodiac.js
const ZODIAC_DATA = [
  {name:'양자리', symbol:'♈', period:'3/21–4/19', elem:'불', ruling:'화성', keyword:'도전·열정', from:[3,21], to:[4,19]},
  {name:'황소자리', symbol:'♉', period:'4/20–5/20', elem:'흙', ruling:'금성', keyword:'안정·인내', from:[4,20], to:[5,20]},
  {name:'쌍둥이자리', symbol:'♊', period:'5/21–6/21', elem:'공기', ruling:'수성', keyword:'소통·호기심', from:[5,21], to:[6,21]},
  {name:'게자리', symbol:'♋', period:'6/22–7/22', elem:'물', ruling:'달', keyword:'감정·보호', from:[6,22], to:[7,22]},
  {name:'사자자리', symbol:'♌', period:'7/23–8/22', elem:'불', ruling:'태양', keyword:'리더십·창의', from:[7,23], to:[8,22]},
  {name:'처녀자리', symbol:'♍', period:'8/23–9/22', elem:'흙', ruling:'수성', keyword:'완벽·실용', from:[8,23], to:[9,22]},
  {name:'천칭자리', symbol:'♎', period:'9/23–10/22', elem:'공기', ruling:'금성', keyword:'균형·화합', from:[9,23], to:[10,22]},
  {name:'전갈자리', symbol:'♏', period:'10/23–11/21', elem:'물', ruling:'명왕성', keyword:'변화·깊이', from:[10,23], to:[11,21]},
  {name:'사수자리', symbol:'♐', period:'11/22–12/21', elem:'불', ruling:'목성', keyword:'모험·자유', from:[11,22], to:[12,21]},
  {name:'염소자리', symbol:'♑', period:'12/22–1/19', elem:'흙', ruling:'토성', keyword:'책임·야망', from:[12,22], to:[1,19]},
  {name:'물병자리', symbol:'♒', period:'1/20–2/18', elem:'공기', ruling:'천왕성', keyword:'혁신·독립', from:[1,20], to:[2,18]},
  {name:'물고기자리', symbol:'♓', period:'2/19–3/20', elem:'물', ruling:'해왕성', keyword:'공감·영감', from:[2,19], to:[3,20]}
];

// Cheer messages from cheer.js (sample, full list too long)
const CHEER_DATA = [
  {text:'행복은 선택이다. 오늘 하루를 행복하게 만들어라.', category:'wisdom', source:'철학'},
  {text:'작은 성공들이 큰 꿈을 이룬다. 한 걸음씩 나아가자!', category:'growth', source:'동기부여'},
  // ... add more
];

// Food data from food.js
const FOOD_DB = {
  teen: [
    {name:'마라탕', emoji:'🌶️', desc:'요즘 10대 최애! 얼얼하게 맵고 중독적인 맛'},
    // ...
  ],
  // ...
};

// Humor from humor.js
const AJAE_JOKES = [
  {category:'Animals', setup:'왜 코끼리는 핸드폰을 안 써?', punchline:'귀가 너무 커서!'},
  // ...
];

// Saju constants
const SAJU_CONSTANTS = [
  {key_name:'STEMS', value:'["갑","을","병","정","무","기","경","신","임","계"]'},
  // ...
];

// Fortune templates
const FORTUNE_TEMPLATES = [
  {template_type:'daily', content:'오늘은 {color}을 입으면 행운이 찾아올 거예요!'},
  // ...
];

async function migrate() {
  console.log('Starting content migration...');

  // Create tables
  await run(`CREATE TABLE IF NOT EXISTS zodiac (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    symbol TEXT,
    period TEXT,
    elem TEXT,
    ruling TEXT,
    keyword TEXT,
    from_month INTEGER,
    from_day INTEGER,
    to_month INTEGER,
    to_day INTEGER,
    fortune TEXT,
    detail TEXT
  )`);
  await run(`CREATE TABLE IF NOT EXISTS cheer_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    category TEXT,
    source TEXT
  )`);
  await run(`CREATE TABLE IF NOT EXISTS food_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    age_group TEXT NOT NULL,
    elem_type TEXT,
    name TEXT,
    emoji TEXT,
    desc TEXT
  )`);
  await run(`CREATE TABLE IF NOT EXISTS humor_jokes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    setup TEXT,
    punchline TEXT
  )`);
  await run(`CREATE TABLE IF NOT EXISTS saju_constants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS fortune_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_type TEXT NOT NULL,
    content TEXT NOT NULL
  )`);

  // Insert data...
  for (const z of ZODIAC_DATA) {
    await run(`INSERT OR IGNORE INTO zodiac (name, symbol, period, elem, ruling, keyword, from_month, from_day, to_month, to_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [z.name, z.symbol, z.period, z.elem, z.ruling, z.keyword, z.from[0], z.from[1], z.to[0], z.to[1]]);
  }

  // Insert cheer
  for (const c of CHEER_DATA) {
    await run(`INSERT OR IGNORE INTO cheer_messages (text, category, source) VALUES (?, ?, ?)`,
      [c.text, c.category, c.source]);
  }

  // Insert food
  for (const [age, foods] of Object.entries(FOOD_DB)) {
    for (const f of foods) {
      await run(`INSERT OR IGNORE INTO food_recommendations (age_group, name, emoji, desc) VALUES (?, ?, ?, ?)`,
        [age, f.name, f.emoji, f.desc]);
    }
  }

  // Insert humor
  for (const j of AJAE_JOKES) {
    await run(`INSERT OR IGNORE INTO humor_jokes (category, setup, punchline) VALUES (?, ?, ?)`,
      [j.category, j.setup, j.punchline]);
  }

  // Insert saju
  for (const s of SAJU_CONSTANTS) {
    await run(`INSERT OR IGNORE INTO saju_constants (key_name, value) VALUES (?, ?)`,
      [s.key_name, s.value]);
  }

  // Insert fortune
  for (const f of FORTUNE_TEMPLATES) {
    await run(`INSERT OR IGNORE INTO fortune_templates (template_type, content) VALUES (?, ?)`,
      [f.template_type, f.content]);
  }

  console.log('Migration complete!');
  db.close();
}

migrate().catch(console.error);