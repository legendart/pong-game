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

// 테이블 초기화
await run(`CREATE TABLE IF NOT EXISTS users (
  device_id  TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  birth      TEXT NOT NULL,
  hour       INTEGER DEFAULT -1,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
)`);

const router = express.Router();

// ── GET /api/users/:deviceId ── 사용자 조회
router.get('/:deviceId', async (req, res) => {
  try {
    const user = await get(
      `SELECT device_id, name, birth, hour, created_at, updated_at
       FROM users WHERE device_id = ?`,
      [req.params.deviceId]
    );
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── POST /api/users ── 사용자 저장 (생성 or 업데이트)
router.post('/', async (req, res) => {
  try {
    const { deviceId, name, birth, hour } = req.body;
    if (!deviceId || !name || !birth) {
      return res.status(400).json({ ok: false, error: 'deviceId, name, birth required' });
    }
    const h = (hour === undefined || hour === null) ? -1 : parseInt(hour);

    await run(`
      INSERT INTO users (device_id, name, birth, hour)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(device_id) DO UPDATE SET
        name       = excluded.name,
        birth      = excluded.birth,
        hour       = excluded.hour,
        updated_at = datetime('now','localtime')
    `, [deviceId, name.trim(), birth, h]);

    const user = await get(`SELECT * FROM users WHERE device_id = ?`, [deviceId]);
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── DELETE /api/users/:deviceId ── 사용자 삭제
router.delete('/:deviceId', async (req, res) => {
  try {
    await run(`DELETE FROM users WHERE device_id = ?`, [req.params.deviceId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── GET /api/users ── 전체 사용자 수 (통계용)
router.get('/', async (_req, res) => {
  try {
    const row = await get(`SELECT COUNT(*) as count FROM users`);
    res.json({ ok: true, count: row?.count ?? 0 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
