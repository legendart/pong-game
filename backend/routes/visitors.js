import { createRequire } from 'module';
import { join, dirname } from 'path';
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

// ── DB 초기화 ──
await run(`CREATE TABLE IF NOT EXISTS visitors (
  device_id       TEXT PRIMARY KEY,
  first_seen      TEXT DEFAULT (datetime('now','localtime')),
  last_seen       TEXT DEFAULT (datetime('now','localtime')),
  total_visits    INTEGER DEFAULT 0,
  today_visits    INTEGER DEFAULT 0,
  last_date       TEXT DEFAULT '',
  ip              TEXT DEFAULT '',
  device_type     TEXT DEFAULT '',
  browser         TEXT DEFAULT '',
  os              TEXT DEFAULT '',
  access_method   TEXT DEFAULT '',
  screen          TEXT DEFAULT '',
  user_agent      TEXT DEFAULT '',
  referrer        TEXT DEFAULT '',
  name            TEXT DEFAULT '',
  birth           TEXT DEFAULT '',
  hour            INTEGER DEFAULT -1,
  timezone        TEXT DEFAULT '',
  language        TEXT DEFAULT ''
)`);

await run(`CREATE TABLE IF NOT EXISTS visit_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     TEXT NOT NULL,
  visited_at    TEXT DEFAULT (datetime('now','localtime')),
  date          TEXT NOT NULL,
  ip            TEXT DEFAULT '',
  device_type   TEXT DEFAULT '',
  browser       TEXT DEFAULT '',
  os            TEXT DEFAULT '',
  access_method TEXT DEFAULT '',
  referrer      TEXT DEFAULT '',
  page_path     TEXT DEFAULT '',
  duration_sec  INTEGER DEFAULT 0,
  FOREIGN KEY(device_id) REFERENCES visitors(device_id)
)`);

// 기존 호환 테이블
await run(`CREATE TABLE IF NOT EXISTS daily_stats (date TEXT PRIMARY KEY, count INTEGER DEFAULT 0)`);
await run(`CREATE TABLE IF NOT EXISTS total_stats  (key  TEXT PRIMARY KEY, value INTEGER DEFAULT 0)`);
await run(`INSERT OR IGNORE INTO total_stats (key,value) VALUES ('total',0)`);
await run(`CREATE INDEX IF NOT EXISTS idx_visit_logs_device ON visit_logs(device_id)`);
await run(`CREATE INDEX IF NOT EXISTS idx_visit_logs_date   ON visit_logs(date)`);

// ── UA 파서 ──
function parseUA(ua='') {
  let device='desktop', browser='기타', os='기타';
  if (/iPhone|iPad|iPod/i.test(ua))          { device='mobile'; os='iOS'; }
  else if (/Android/i.test(ua))              { device='mobile'; os='Android'; }
  else if (/Windows/i.test(ua))              { os='Windows'; }
  else if (/Mac OS X/i.test(ua))             { os='macOS'; }
  else if (/Linux/i.test(ua))               { os='Linux'; }
  if (/Tablet|iPad/i.test(ua))              device='tablet';

  if (/SamsungBrowser/i.test(ua))           browser='삼성';
  else if (/KAKAOTALK/i.test(ua))           browser='카카오톡';
  else if (/NAVER/i.test(ua))               browser='네이버';
  else if (/CriOS/i.test(ua))              browser='Chrome(iOS)';
  else if (/FxiOS/i.test(ua))              browser='Firefox(iOS)';
  else if (/EdgA|EdgiOS/i.test(ua))        browser='Edge';
  else if (/Chrome/i.test(ua) && !/Chromium|OPR|Edge/i.test(ua)) browser='Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser='Safari';
  else if (/Firefox/i.test(ua))            browser='Firefox';
  else if (/OPR|Opera/i.test(ua))          browser='Opera';
  else if (/Edge|Edg/i.test(ua))           browser='Edge';

  return { device, browser, os };
}

function parseAccessMethod(referrer='', origin='', pagePath='/') {
  if (origin.includes('github.io'))         return 'GitHub Pages';
  if (referrer.includes('github.io'))       return 'GitHub Pages';
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return '로컬';
  if (/192\.168\.|10\.|172\./.test(origin)) return 'Wi-Fi (내부망)';
  if (referrer.includes('google'))          return '구글 검색';
  if (referrer.includes('naver'))           return '네이버 검색';
  if (referrer.includes('kakao'))           return '카카오';
  if (referrer.includes('instagram'))       return '인스타그램';
  if (referrer)                             return '외부 링크';
  return '직접 접속';
}

const router = express.Router();

// ── POST /api/visitors/hit ── 방문 기록
router.post('/hit', async (req, res) => {
  try {
    const {
      deviceId, referrer='', origin='', pagePath='/',
      screen='', timezone='', language='', durationSec=0,
    } = req.body;

    const ip  = (req.headers['x-forwarded-for']||req.socket.remoteAddress||'').slice(0,45);
    const ua  = (req.headers['user-agent']||'').slice(0,300);
    const { device, browser, os } = parseUA(ua);
    const accessMethod = parseAccessMethod(referrer, origin, pagePath);
    const today = new Date().toISOString().slice(0,10);
    const now   = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }).replace(/\. /g,'-').replace('.','-').slice(0,16);

    // visitors 테이블 upsert
    if (deviceId) {
      const existing = await get(`SELECT total_visits, last_date, today_visits FROM visitors WHERE device_id=?`, [deviceId]);
      if (existing) {
        const isNewDay = existing.last_date !== today;
        await run(`UPDATE visitors SET
          last_seen=datetime('now','localtime'),
          total_visits=total_visits+1,
          today_visits=CASE WHEN last_date!=? THEN 1 ELSE today_visits+1 END,
          last_date=?,
          ip=?, device_type=?, browser=?, os=?, access_method=?,
          screen=?, user_agent=?, referrer=?, timezone=?, language=?
          WHERE device_id=?`,
          [today, today, ip, device, browser, os, accessMethod,
           screen, ua, referrer, timezone, language, deviceId]);
      } else {
        await run(`INSERT INTO visitors
          (device_id, ip, device_type, browser, os, access_method,
           screen, user_agent, referrer, timezone, language,
           total_visits, today_visits, last_date)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1,?)`,
          [deviceId, ip, device, browser, os, accessMethod,
           screen, ua, referrer, timezone, language, today]);
      }
      // visit_logs 기록
      await run(`INSERT INTO visit_logs
        (device_id, date, ip, device_type, browser, os, access_method, referrer, page_path, duration_sec)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [deviceId, today, ip, device, browser, os, accessMethod, referrer, pagePath, durationSec]);
    }

    // 전체 통계 업데이트
    await run(`INSERT INTO daily_stats (date,count) VALUES (?,1)
               ON CONFLICT(date) DO UPDATE SET count=count+1`, [today]);
    await run(`UPDATE total_stats SET value=value+1 WHERE key='total'`);

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
