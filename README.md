# Javis 사주풀이 🔮

## 프로젝트 구조

```
pong-game/
├── frontend/          ← GitHub Pages 배포 (정적 사이트)
│   ├── index.html     - HTML 구조만
│   ├── css/style.css  - 스타일시트
│   └── js/
│       ├── config.js  - API URL 설정
│       ├── api.js     - 백엔드 API 호출
│       ├── main.js    - 앱 진입점, render()
│       ├── saju.js    - 사주 계산 로직
│       ├── zodiac.js  - 별자리 데이터
│       ├── chart.js   - 캔버스 차트
│       ├── cheer.js   - 응원 메시지 시스템
│       ├── food.js    - 음식 추천
│       ├── humor.js   - 아재개그
│       ├── history.js - 오늘의 역사
│       └── visitor.js - 방문자 카운터
│
├── backend/           ← Node.js API 서버 (Mac에서 실행)
│   ├── server.js      - Express 서버
│   ├── package.json
│   ├── db/            - SQLite DB (자동 생성)
│   └── routes/
│       ├── fortune.js - 사주 계산 API
│       ├── history.js - Wikipedia 프록시 API
│       └── visitors.js - 방문자 카운터 DB API
│
└── index.html         ← 기존 단일 파일 (레거시)
```

## 백엔드 실행

```bash
cd backend
npm install
npm start
```

서버가 시작되면 Wi-Fi IP가 출력됩니다:
```
🚀 Javis 사주 백엔드 서버 시작!
   로컬:   http://localhost:3000
   Wi-Fi:  http://192.168.x.x:3000  ← 아이폰에서 이 주소 사용
```

## 프론트엔드 → 백엔드 연결

아이폰에서 GitHub Pages에 접속 후, 콘솔에서:
```js
setBackendURL('http://192.168.x.x:3000')
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/fortune?birth=YYYY-MM-DD&hour=N` | 사주 계산 |
| GET | `/api/history?month=M&day=D` | 오늘의 역사 |
| POST | `/api/visitors/hit` | 방문 기록 |
| GET | `/api/visitors/stats` | 방문 통계 |
