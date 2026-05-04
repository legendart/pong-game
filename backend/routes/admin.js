import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sqlite3   = require('sqlite3').verbose();
const DB_PATH   = join(__dirname, '../db/visitors.db');
const db        = new sqlite3.Database(DB_PATH);

const run = (s,p=[]) => new Promise((res,rej)=>db.run(s,p,function(e){e?rej(e):res(this);}));
const get = (s,p=[]) => new Promise((res,rej)=>db.get(s,p,(e,r)=>e?rej(e):res(r)));
const all = (s,p=[]) => new Promise((res,rej)=>db.all(s,p,(e,r)=>e?rej(e):res(r)));

// admin_config 테이블 (비밀번호, 설정 저장)
await run(`CREATE TABLE IF NOT EXISTS admin_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`);
// 기본 비밀번호: admin1234 (첫 실행 시만)
await run(`INSERT OR IGNORE INTO admin_config (key,value) VALUES ('password','admin1234')`);
await run(`INSERT OR IGNORE INTO admin_config (key,value) VALUES ('site_title','Javis 사주')`);
await run(`INSERT OR IGNORE INTO admin_config (key,value) VALUES ('maintenance','false')`);

// fortune_logs 테이블 (사주 조회 기록)
await run(`CREATE TABLE IF NOT EXISTS fortune_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT,
  name       TEXT,
  birth      TEXT,
  queried_at TEXT DEFAULT (datetime('now','localtime'))
)`);

const router = express.Router();

// ── 인증 미들웨어 ──
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token) return res.status(401).json({ ok:false, error:'Unauthorized' });
  get(`SELECT value FROM admin_config WHERE key='password'`).then(row => {
    if (row?.value === token) next();
    else res.status(403).json({ ok:false, error:'Invalid token' });
  }).catch(() => res.status(500).json({ ok:false, error:'DB error' }));
}

// ── POST /api/admin/login ──
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ ok:false, error:'password required' });
  const row = await get(`SELECT value FROM admin_config WHERE key='password'`);
  if (row?.value === password) {
    res.json({ ok:true, token: password });
  } else {
    res.status(403).json({ ok:false, error:'비밀번호가 틀렸습니다' });
  }
});

// ── GET /api/admin/dashboard ── 대시보드 요약
router.get('/dashboard', requireAuth, async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);

    const [totalVisits, todayVisits, yesterdayVisits,
           totalUsers, newUsersToday, totalFortune] = await Promise.all([
      get(`SELECT value FROM total_stats WHERE key='total'`),
      get(`SELECT count FROM daily_stats WHERE date=?`, [today]),
      get(`SELECT count FROM daily_stats WHERE date=?`, [yesterday]),
      get(`SELECT COUNT(*) as c FROM users`),
      get(`SELECT COUNT(*) as c FROM users WHERE date(created_at)=?`, [today]),
      get(`SELECT COUNT(*) as c FROM fortune_logs`),
    ]);

    // 주간 방문 트렌드
    const weeklyTrend = await all(
      `SELECT date, count FROM daily_stats ORDER BY date DESC LIMIT 14`
    );

    // 최근 신규 사용자
    const recentUsers = await all(
      `SELECT name, birth, created_at FROM users ORDER BY created_at DESC LIMIT 5`
    );

    // 서버 정보
    const serverInfo = {
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      platform: os.platform(),
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      freeMemMB: Math.round(os.freemem()/1024/1024),
      totalMemMB: Math.round(os.totalmem()/1024/1024),
    };

    res.json({
      ok: true,
      stats: {
        totalVisits:   totalVisits?.value ?? 0,
        todayVisits:   todayVisits?.count ?? 0,
        yesterdayVisits: yesterdayVisits?.count ?? 0,
        totalUsers:    totalUsers?.c ?? 0,
        newUsersToday: newUsersToday?.c ?? 0,
        totalFortune:  totalFortune?.c ?? 0,
      },
      weeklyTrend,
      recentUsers,
      serverInfo,
    });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/visitors ── 방문자 상세
router.get('/visitors', requireAuth, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit  || 30);
    const offset = parseInt(req.query.offset || 0);
    const date   = req.query.date; // 특정 날짜 필터

    const whereClause = date ? `WHERE date=?` : '';
    const params = date ? [date] : [];

    const [rows, total, dailySummary, hourly] = await Promise.all([
      all(`SELECT * FROM visits ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM visits ${whereClause}`, params),
      all(`SELECT date, count FROM daily_stats ORDER BY date DESC LIMIT 30`),
      all(`SELECT strftime('%H',created_at) as hour, COUNT(*) as c
           FROM visits WHERE date=date('now','localtime')
           GROUP BY hour ORDER BY hour`),
    ]);

    res.json({ ok:true, rows, total:total?.c??0, dailySummary, hourly });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/users ── 사용자 목록
router.get('/users', requireAuth, async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit  || 50);
    const offset  = parseInt(req.query.offset || 0);
    const search  = req.query.search || '';

    const whereClause = search ? `WHERE name LIKE ? OR birth LIKE ?` : '';
    const params = search ? [`%${search}%`, `%${search}%`] : [];

    const [rows, total] = await Promise.all([
      all(`SELECT device_id, name, birth, hour, created_at, updated_at
           FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM users ${whereClause}`, params),
    ]);

    // 나이 계산
    const enriched = rows.map(u => {
      const age = u.birth
        ? new Date().getFullYear() - parseInt(u.birth.slice(0,4))
        : null;
      return { ...u, age };
    });

    res.json({ ok:true, rows:enriched, total:total?.c??0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── DELETE /api/admin/users/:deviceId ── 사용자 강제 삭제
router.delete('/users/:deviceId', requireAuth, async (req, res) => {
  try {
    await run(`DELETE FROM users WHERE device_id=?`, [req.params.deviceId]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── DELETE /api/admin/visitors ── 방문 기록 일괄 삭제
router.delete('/visitors', requireAuth, async (req, res) => {
  try {
    const { before } = req.body; // 특정 날짜 이전 삭제
    if (before) {
      await run(`DELETE FROM visits WHERE date<?`, [before]);
      await run(`DELETE FROM daily_stats WHERE date<?`, [before]);
    } else {
      await run(`DELETE FROM visits`);
      await run(`DELETE FROM daily_stats`);
      await run(`UPDATE total_stats SET value=0 WHERE key='total'`);
    }
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/fortune-logs ── 사주 조회 로그
router.get('/fortune-logs', requireAuth, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit || 50);
    const offset = parseInt(req.query.offset || 0);
    const [rows, total] = await Promise.all([
      all(`SELECT fl.*, u.name as user_name
           FROM fortune_logs fl
           LEFT JOIN users u ON fl.device_id=u.device_id
           ORDER BY fl.queried_at DESC LIMIT ? OFFSET ?`, [limit, offset]),
      get(`SELECT COUNT(*) as c FROM fortune_logs`),
    ]);
    res.json({ ok:true, rows, total:total?.c??0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/config ── 설정 조회
router.get('/config', requireAuth, async (_req, res) => {
  try {
    const rows = await all(`SELECT key, value FROM admin_config WHERE key != 'password'`);
    const config = Object.fromEntries(rows.map(r=>[r.key,r.value]));
    res.json({ ok:true, config });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── POST /api/admin/config ── 설정 변경
router.post('/config', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value===undefined) return res.status(400).json({ ok:false, error:'key, value required' });
    await run(`INSERT OR REPLACE INTO admin_config (key,value) VALUES (?,?)`, [key, value]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── POST /api/admin/change-password ── 비밀번호 변경
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ ok:false, error:'비밀번호는 6자 이상이어야 합니다' });
    await run(`UPDATE admin_config SET value=? WHERE key='password'`, [newPassword]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/export/users ── 사용자 CSV 내보내기
router.get('/export/users', requireAuth, async (_req, res) => {
  try {
    const rows = await all(`SELECT name, birth, hour, created_at FROM users ORDER BY created_at DESC`);
    const csv = ['이름,생년월일,태어난시,등록일',
      ...rows.map(r=>`${r.name},${r.birth},${r.hour===-1?'모름':r.hour+'시'},${r.created_at}`)
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send('\uFEFF' + csv); // BOM for Excel
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});


// ── GET /api/admin/visitor-list ── 방문객별 목록
router.get('/visitor-list', requireAuth, async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit  || 50);
    const offset  = parseInt(req.query.offset || 0);
    const search  = req.query.search || '';
    const device  = req.query.device || '';  // mobile/desktop/tablet
    const method  = req.query.method || '';  // 접속 방법 필터

    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND (v.name LIKE ? OR v.ip LIKE ? OR v.browser LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    if (device) { where += ' AND v.device_type=?'; params.push(device); }
    if (method) { where += ' AND v.access_method=?'; params.push(method); }

    const [rows, total] = await Promise.all([
      all(`SELECT v.*, u.name as user_name, u.birth, u.hour
           FROM visitors v LEFT JOIN users u ON v.device_id=u.device_id
           ${where} ORDER BY v.last_seen DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM visitors v ${where}`, params),
    ]);

    res.json({ ok:true, rows, total:total?.c??0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/visitor-detail/:deviceId ── 방문객 상세 + 로그
router.get('/visitor-detail/:deviceId', requireAuth, async (req, res) => {
  try {
    const did = req.params.deviceId;
    const [visitor, user, logs, dailyStats] = await Promise.all([
      get(`SELECT * FROM visitors WHERE device_id=?`, [did]),
      get(`SELECT * FROM users WHERE device_id=?`, [did]),
      all(`SELECT * FROM visit_logs WHERE device_id=? ORDER BY visited_at DESC LIMIT 100`, [did]),
      all(`SELECT date, COUNT(*) as c FROM visit_logs WHERE device_id=? GROUP BY date ORDER BY date DESC LIMIT 30`, [did]),
    ]);
    if (!visitor) return res.status(404).json({ ok:false, error:'Visitor not found' });
    res.json({ ok:true, visitor, user:user||null, logs, dailyStats });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── DELETE /api/admin/visitor/:deviceId ── 방문객 완전 삭제
router.delete('/visitor/:deviceId', requireAuth, async (req, res) => {
  try {
    const did = req.params.deviceId;
    await run(`DELETE FROM visit_logs WHERE device_id=?`, [did]);
    await run(`DELETE FROM visitors WHERE device_id=?`, [did]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/visitor-stats ── 방문객 통계 요약
router.get('/visitor-stats', requireAuth, async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    const [total, activeToday, deviceBreakdown, methodBreakdown, browserBreakdown, osBreakdown, newToday] = await Promise.all([
      get(`SELECT COUNT(*) as c FROM visitors`),
      get(`SELECT COUNT(*) as c FROM visitors WHERE last_date=?`, [today]),
      all(`SELECT device_type, COUNT(*) as c FROM visitors GROUP BY device_type ORDER BY c DESC`),
      all(`SELECT access_method, COUNT(*) as c FROM visitors GROUP BY access_method ORDER BY c DESC LIMIT 8`),
      all(`SELECT browser, COUNT(*) as c FROM visitors GROUP BY browser ORDER BY c DESC LIMIT 6`),
      all(`SELECT os, COUNT(*) as c FROM visitors GROUP BY os ORDER BY c DESC LIMIT 6`),
      get(`SELECT COUNT(*) as c FROM visitors WHERE date(first_seen)=?`, [today]),
    ]);
    res.json({ ok:true, total:total?.c??0, activeToday:activeToday?.c??0, newToday:newToday?.c??0, deviceBreakdown, methodBreakdown, browserBreakdown, osBreakdown });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ── GET /api/admin/export/visitors ── 방문객 CSV
router.get('/export/visitors', requireAuth, async (_req, res) => {
  try {
    const rows = await all(`SELECT v.device_id, u.name, v.device_type, v.browser, v.os, v.access_method, v.ip, v.total_visits, v.first_seen, v.last_seen
      FROM visitors v LEFT JOIN users u ON v.device_id=u.device_id ORDER BY v.last_seen DESC`);
    const csv = ['디바이스ID,이름,기기,브라우저,OS,접속방법,IP,총방문,최초방문,최근방문',
      ...rows.map(r=>`${r.device_id},${r.name||''},${r.device_type},${r.browser},${r.os},${r.access_method},${r.ip},${r.total_visits},${r.first_seen},${r.last_seen}`)
    ].join('\n');
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="visitors.csv"');
    res.send('\uFEFF' + csv);
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});


// ══════════════════════════════════════════
// ── 컨텐츠 관리 CRUD API ──
// ══════════════════════════════════════════

// ─ 아재개그 ─
router.get('/content/jokes', requireAuth, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit  || 20);
    const offset = parseInt(req.query.offset || 0);
    const search = req.query.search || '';
    const where  = search ? `WHERE setup LIKE ? OR punchline LIKE ?` : '';
    const params = search ? [`%${search}%`,`%${search}%`] : [];
    const [rows, total] = await Promise.all([
      all(`SELECT * FROM content_jokes ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM content_jokes ${where}`, params),
    ]);
    res.json({ ok:true, rows, total:total?.c||0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.post('/content/jokes', requireAuth, async (req, res) => {
  try {
    const { setup, punchline, category='일반' } = req.body;
    if (!setup || !punchline) return res.status(400).json({ ok:false, error:'setup, punchline required' });
    const r = await run(`INSERT INTO content_jokes (setup, punchline, category) VALUES (?,?,?)`, [setup, punchline, category]);
    res.json({ ok:true, id:r.lastID });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.put('/content/jokes/:id', requireAuth, async (req, res) => {
  try {
    const { setup, punchline, category, active } = req.body;
    const fields = [], vals = [];
    if (setup !== undefined)    { fields.push('setup=?');     vals.push(setup); }
    if (punchline !== undefined){ fields.push('punchline=?'); vals.push(punchline); }
    if (category !== undefined) { fields.push('category=?'); vals.push(category); }
    if (active !== undefined)   { fields.push('active=?');   vals.push(active); }
    if (!fields.length) return res.status(400).json({ ok:false, error:'no fields' });
    await run(`UPDATE content_jokes SET ${fields.join(',')} WHERE id=?`, [...vals, req.params.id]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.delete('/content/jokes/:id', requireAuth, async (req, res) => {
  try { await run(`DELETE FROM content_jokes WHERE id=?`, [req.params.id]); res.json({ ok:true }); }
  catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ─ 응원 메시지 ─
router.get('/content/cheer', requireAuth, async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit  || 20);
    const offset   = parseInt(req.query.offset || 0);
    const category = req.query.category || '';
    const where    = category ? `WHERE category=?` : '';
    const params   = category ? [category] : [];
    const [rows, total] = await Promise.all([
      all(`SELECT * FROM content_cheer ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM content_cheer ${where}`, params),
    ]);
    res.json({ ok:true, rows, total:total?.c||0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.post('/content/cheer', requireAuth, async (req, res) => {
  try {
    const { text, category='wisdom', source='' } = req.body;
    if (!text) return res.status(400).json({ ok:false, error:'text required' });
    const r = await run(`INSERT INTO content_cheer (text, category, source) VALUES (?,?,?)`, [text, category, source]);
    res.json({ ok:true, id:r.lastID });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.put('/content/cheer/:id', requireAuth, async (req, res) => {
  try {
    const { text, category, source, active } = req.body;
    const fields=[], vals=[];
    if (text     !== undefined){ fields.push('text=?');     vals.push(text); }
    if (category !== undefined){ fields.push('category=?'); vals.push(category); }
    if (source   !== undefined){ fields.push('source=?');   vals.push(source); }
    if (active   !== undefined){ fields.push('active=?');   vals.push(active); }
    if (!fields.length) return res.status(400).json({ ok:false, error:'no fields' });
    await run(`UPDATE content_cheer SET ${fields.join(',')} WHERE id=?`, [...vals, req.params.id]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.delete('/content/cheer/:id', requireAuth, async (req, res) => {
  try { await run(`DELETE FROM content_cheer WHERE id=?`, [req.params.id]); res.json({ ok:true }); }
  catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ─ 음식 ─
router.get('/content/food', requireAuth, async (req, res) => {
  try {
    const limit     = parseInt(req.query.limit  || 30);
    const offset    = parseInt(req.query.offset || 0);
    const age_group = req.query.age_group || '';
    const where     = age_group ? `WHERE age_group=?` : '';
    const params    = age_group ? [age_group] : [];
    const [rows, total] = await Promise.all([
      all(`SELECT * FROM content_food ${where} ORDER BY age_group, id LIMIT ? OFFSET ?`, [...params, limit, offset]),
      get(`SELECT COUNT(*) as c FROM content_food ${where}`, params),
    ]);
    res.json({ ok:true, rows, total:total?.c||0 });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.post('/content/food', requireAuth, async (req, res) => {
  try {
    const { emoji='', name, age_group, desc='', is_bonus=0, element='' } = req.body;
    if (!name || !age_group) return res.status(400).json({ ok:false, error:'name, age_group required' });
    const r = await run(`INSERT INTO content_food (emoji,name,age_group,desc,is_bonus,element) VALUES (?,?,?,?,?,?)`,
      [emoji, name, age_group, desc, is_bonus, element]);
    res.json({ ok:true, id:r.lastID });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.put('/content/food/:id', requireAuth, async (req, res) => {
  try {
    const { emoji, name, age_group, desc, active } = req.body;
    const fields=[], vals=[];
    if (emoji     !== undefined){ fields.push('emoji=?');     vals.push(emoji); }
    if (name      !== undefined){ fields.push('name=?');      vals.push(name); }
    if (age_group !== undefined){ fields.push('age_group=?'); vals.push(age_group); }
    if (desc      !== undefined){ fields.push('desc=?');      vals.push(desc); }
    if (active    !== undefined){ fields.push('active=?');    vals.push(active); }
    if (!fields.length) return res.status(400).json({ ok:false, error:'no fields' });
    await run(`UPDATE content_food SET ${fields.join(',')} WHERE id=?`, [...vals, req.params.id]);
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

router.delete('/content/food/:id', requireAuth, async (req, res) => {
  try { await run(`DELETE FROM content_food WHERE id=?`, [req.params.id]); res.json({ ok:true }); }
  catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

export { db }; // fortune route에서 로그 기록용
export default router;
