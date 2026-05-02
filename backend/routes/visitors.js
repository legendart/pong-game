import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = join(__dirname, '../db/visitors.db');

// DB 초기화 (Promise 래퍼)
const db = new sqlite3.Database(DB_PATH);
const run  = (sql, params=[]) => new Promise((res,rej)=>db.run(sql,params,function(e){e?rej(e):res(this);}));
const get  = (sql, params=[]) => new Promise((res,rej)=>db.get(sql,params,(e,r)=>e?rej(e):res(r)));
const all  = (sql, params=[]) => new Promise((res,rej)=>db.all(sql,params,(e,r)=>e?rej(e):res(r)));

// 초기 테이블 생성
await run(`CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
)`);
await run(`CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
)`);
await run(`CREATE TABLE IF NOT EXISTS total_stats (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
)`);
await run(`INSERT OR IGNORE INTO total_stats (key, value) VALUES ('total', 0)`);

const router = express.Router();

// POST /api/visitors/hit
router.post('/hit', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').slice(0, 45);
    const ua = (req.headers['user-agent'] || '').slice(0, 200);

    await run(`INSERT INTO visits (date, ip, user_agent) VALUES (?, ?, ?)`, [today, ip, ua]);
    await run(`INSERT INTO daily_stats (date, count) VALUES (?, 1)
               ON CONFLICT(date) DO UPDATE SET count = count + 1`, [today]);
    await run(`UPDATE total_stats SET value = value + 1 WHERE key = 'total'`);

    const total   = await get(`SELECT value FROM total_stats WHERE key = 'total'`);
    const todayRow = await get(`SELECT count FROM daily_stats WHERE date = ?`, [today]);

    res.json({ ok: true, total: total?.value ?? 0, today: todayRow?.count ?? 0, date: today });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/visitors/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const total    = await get(`SELECT value FROM total_stats WHERE key = 'total'`);
    const todayRow = await get(`SELECT count FROM daily_stats WHERE date = ?`, [today]);
    const weekly   = await all(`SELECT date, count FROM daily_stats ORDER BY date DESC LIMIT 7`);
    const bestDay  = await get(`SELECT date, count FROM daily_stats ORDER BY count DESC LIMIT 1`);

    res.json({ ok: true, total: total?.value ?? 0, today: todayRow?.count ?? 0, weekly, bestDay: bestDay ?? null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
