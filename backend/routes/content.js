import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = join(__dirname, '../db/visitors.db');
const db = new sqlite3.Database(DB_PATH);

const run = (sql, p=[]) => new Promise((res,rej) => db.run(sql,p,function(e){e?rej(e):res(this);}));
const get = (sql, p=[]) => new Promise((res,rej) => db.get(sql,p,(e,r)=>e?rej(e):res(r)));
const all = (sql, p=[]) => new Promise((res,rej) => db.all(sql,p,(e,r)=>e?rej(e):res(r)));

// 컨텐츠 테이블 초기화
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

const router = express.Router();

// 인증 미들웨어 (admin 토큰 필요)
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== 'admin1234') { // 간단한 체크, 실제로는 DB에서 검증
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

// GET /api/content/zodiac
router.get('/zodiac', async (req, res) => {
  try {
    const zodiacs = await all(`SELECT * FROM zodiac ORDER BY id`);
    res.json({ ok: true, data: zodiacs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/content/cheer
router.get('/cheer', async (req, res) => {
  try {
    const messages = await all(`SELECT * FROM cheer_messages ORDER BY id`);
    res.json({ ok: true, data: messages });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/content/food
router.get('/food', async (req, res) => {
  try {
    const foods = await all(`SELECT * FROM food_recommendations ORDER BY id`);
    res.json({ ok: true, data: foods });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/content/humor
router.get('/humor', async (req, res) => {
  try {
    const jokes = await all(`SELECT * FROM humor_jokes ORDER BY id`);
    res.json({ ok: true, data: jokes });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/content/saju
router.get('/saju', async (req, res) => {
  try {
    const constants = await all(`SELECT * FROM saju_constants ORDER BY key_name`);
    res.json({ ok: true, data: constants });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/content/fortune
router.get('/fortune', async (req, res) => {
  try {
    const templates = await all(`SELECT * FROM fortune_templates ORDER BY id`);
    res.json({ ok: true, data: templates });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Admin CRUD endpoints
router.post('/zodiac', requireAdmin, async (req, res) => {
  try {
    const { name, symbol, period, elem, ruling, keyword, from_month, from_day, to_month, to_day, fortune, detail } = req.body;
    const result = await run(`INSERT INTO zodiac (name, symbol, period, elem, ruling, keyword, from_month, from_day, to_month, to_day, fortune, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, symbol, period, elem, ruling, keyword, from_month, from_day, to_month, to_day, fortune, detail]);
    res.json({ ok: true, id: result.lastID });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 비슷하게 다른 테이블도 CRUD 추가 (생략, 필요시 확장)

export default router;