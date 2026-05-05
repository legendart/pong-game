import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
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

// User-Agent 파싱 함수
function parseUserAgent(ua) {
  const uaLower = ua.toLowerCase();
  let device_type = 'desktop';
  if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
    device_type = 'mobile';
  }
  let browser = 'Unknown';
  if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari';
  else if (uaLower.includes('edge')) browser = 'Edge';
  else if (uaLower.includes('opera')) browser = 'Opera';
  return { device_type, browser };
}

// 초기 테이블 생성
await run(`CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  device_id TEXT,
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

// 기존 테이블에 새 컬럼 추가 (호환성)
await run(`ALTER TABLE visits ADD COLUMN device_type TEXT`).catch(() => {});
await run(`ALTER TABLE visits ADD COLUMN browser TEXT`).catch(() => {});
await run(`ALTER TABLE visits ADD COLUMN device_id TEXT`).catch(() => {});

const router = express.Router();

// ── POST /api/visitors/hit ── 방문 기록
router.post('/hit', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').slice(0, 45);
    const ua = (req.headers['user-agent'] || '').slice(0, 200);
    const { device_type, browser } = parseUserAgent(ua);
    const device_id = req.body.deviceId || null;

    await run(`INSERT INTO visits (date, ip, user_agent, device_type, browser, device_id) VALUES (?, ?, ?, ?, ?, ?)`, [today, ip, ua, device_type, browser, device_id]);
    await run(`INSERT INTO daily_stats (date, count) VALUES (?, 1)
               ON CONFLICT(date) DO UPDATE SET count = count + 1`, [today]);
    await run(`UPDATE total_stats SET value = value + 1 WHERE key = 'total'`);

    const totalRow = await get(`SELECT value FROM total_stats WHERE key='total'`);
    const todayRow = await get(`SELECT count FROM daily_stats WHERE date=?`, [today]);
    const visitorRow = deviceId ? await get(`SELECT total_visits, today_visits FROM visitors WHERE device_id=?`, [deviceId]) : null;

    res.json({
      ok: true,
      total: totalRow?.value ?? 0,
      today: todayRow?.count ?? 0,
      myTotal: visitorRow?.total_visits ?? 1,
      myToday: visitorRow?.today_visits ?? 1,
      date: today,
    });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/visitors/stats ── 전체 통계
router.get('/stats', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    const [total, todayRow, weekly, bestDay, totalVisitors, deviceBreakdown, browserBreakdown] = await Promise.all([
      get(`SELECT value FROM total_stats WHERE key='total'`),
      get(`SELECT count FROM daily_stats WHERE date=?`, [today]),
      all(`SELECT date, count FROM daily_stats ORDER BY date DESC LIMIT 7`),
      get(`SELECT date, count FROM daily_stats ORDER BY count DESC LIMIT 1`),
      get(`SELECT COUNT(*) as c FROM visitors`),
      all(`SELECT device_type, COUNT(*) as c FROM visitors GROUP BY device_type ORDER BY c DESC`),
      all(`SELECT browser, COUNT(*) as c FROM visitors GROUP BY browser ORDER BY c DESC LIMIT 5`),
    ]);
    res.json({ ok:true, total:total?.value??0, today:todayRow?.count??0, weekly, bestDay, totalVisitors:totalVisitors?.c??0, deviceBreakdown, browserBreakdown });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/visitors/me/:deviceId ── 내 방문 정보
router.get('/me/:deviceId', async (req, res) => {
  try {
    const v = await get(`SELECT * FROM visitors WHERE device_id=?`, [req.params.deviceId]);
    if (!v) return res.json({ ok:true, visitor:null });
    const logs = await all(`SELECT * FROM visit_logs WHERE device_id=? ORDER BY visited_at DESC LIMIT 10`, [req.params.deviceId]);
    res.json({ ok:true, visitor:v, recentLogs:logs });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

export { db };
export default router;
