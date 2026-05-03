import express from 'express';
import cors from 'cors';
import os from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import visitorsRouter from './routes/visitors.js';
import historyRouter  from './routes/history.js';
import fortuneRouter  from './routes/fortune.js';
import usersRouter    from './routes/users.js';
import adminRouter    from './routes/admin.js';
import contentRouter  from './routes/content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND  = join(__dirname, '../frontend');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── 로컬 IP 찾기 ──
function getLocalIP() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface || []) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return 'unknown';
}

// ── CORS ──
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'https://legendart.github.io',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
    ];
    // 로컬 네트워크 허용 (아이폰 접속용)
    if (!origin || allowed.includes(origin) ||
        /^http:\/\/(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\./.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ── 요청 로깅 ──
app.use((req, _res, next) => {
  const ts = new Date().toLocaleTimeString('ko-KR');
  console.log(`[${ts}] ${req.method} ${req.path} ${req.ip || ''}`);
  next();
});

// ── 정적 파일 (admin.html 서빙) ──
app.use('/admin', express.static(FRONTEND));
app.get('/admin', (_req, res) => res.sendFile(join(FRONTEND, 'admin.html')));
app.get('/admin/', (_req, res) => res.sendFile(join(FRONTEND, 'admin.html')));

// ── 라우터 ──
app.use('/api/visitors', visitorsRouter);
app.use('/api/history',  historyRouter);
app.use('/api/fortune',  fortuneRouter);
app.use('/api/users',    usersRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/content',  contentRouter);

// ── 헬스체크 ──
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), version: '1.0.0' });
});

// ── 404 ──
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not Found' }));

// ── 에러 핸들러 ──
app.use((err, _req, res, _next) => {
  console.error('❌', err.message);
  res.status(500).json({ ok: false, error: err.message });
});

// ── 서버 시작 ──
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n🚀 Javis 사주 백엔드 서버 시작!');
  console.log(`   로컬:   http://localhost:${PORT}`);
  console.log(`   Wi-Fi:  http://${ip}:${PORT}  ← 아이폰에서 이 주소 사용`);
  console.log('\n📡 API:');
  console.log(`   GET  /api/fortune?birth=YYYY-MM-DD&hour=N`);
  console.log(`   GET  /api/history?month=M&day=D`);
  console.log(`   POST /api/visitors/hit`);
  console.log(`   GET  /api/visitors/stats`);
  console.log(`   GET  /api/health\n`);
});
