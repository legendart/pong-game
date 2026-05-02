import express from 'express';

const router = express.Router();

// GET /api/history?month=5&day=1
router.get('/', async (req, res) => {
  const { month, day } = req.query;
  if (!month || !day) return res.status(400).json({ ok: false, error: 'month, day required' });

  try {
    const [engRes, koRes] = await Promise.allSettled([
      fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
        { headers: { Accept: 'application/json' } }),
      fetch(`https://ko.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
        { headers: { Accept: 'application/json' } }),
    ]);

    // 영문 이벤트 처리
    let worldEvents = [];
    if (engRes.status === 'fulfilled' && engRes.value.ok) {
      const data = await engRes.value.json();
      const sorted = (data.events || [])
        .sort((a, b) => (b.pages || []).some(p => p.thumbnail) - (a.pages || []).some(p => p.thumbnail))
        .slice(0, 8);

      // langlinks 배치 조회
      const titles = sorted.map(ev => (ev.pages || [])[0]?.title || '').filter(Boolean);
      let koTitleMap = {};
      if (titles.length) {
        try {
          const lr = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${titles.map(encodeURIComponent).join('|')}&prop=langlinks&lllang=ko&format=json&origin=*`
          );
          const ld = await lr.json();
          Object.values(ld.query?.pages || {}).forEach(p => {
            const kt = p.langlinks?.[0]?.['*'];
            if (p.title && kt) koTitleMap[p.title] = kt;
          });
        } catch {}
      }

      // 한국어 요약 병렬 수집
      const koMap = {};
      await Promise.allSettled(Object.entries(koTitleMap).map(async ([et, kt]) => {
        try {
          const sr = await fetch(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kt)}`);
          if (sr.ok) {
            const sd = await sr.json();
            const txt = sd.extract || '';
            koMap[et] = {
              text: txt.length > 220 ? txt.slice(0, 220) + '…' : txt,
              url: sd.content_urls?.mobile?.page || sd.content_urls?.desktop?.page || '',
            };
          }
        } catch {}
      }));

      worldEvents = sorted.map(ev => {
        const page = (ev.pages || [])[0] || {};
        const et = page.title || '';
        const ko = koMap[et];
        return {
          year: ev.year < 0 ? `기원전 ${Math.abs(ev.year)}년` : `${ev.year}년`,
          text: ko?.text || ev.text || '',
          img: page.thumbnail?.source || '',
          url: ko?.url || page.content_urls?.mobile?.page || '',
        };
      });
    }

    // 한국어 이벤트 처리
    let koreaEvents = [];
    if (koRes.status === 'fulfilled' && koRes.value.ok) {
      const data = await koRes.value.json();
      koreaEvents = (data.events || [])
        .sort((a, b) => (b.pages || []).some(p => p.thumbnail) - (a.pages || []).some(p => p.thumbnail))
        .slice(0, 7)
        .map(ev => {
          const page = (ev.pages || [])[0] || {};
          return {
            year: ev.year < 0 ? `기원전 ${Math.abs(ev.year)}년` : `${ev.year}년`,
            text: ev.text || '',
            img: page.thumbnail?.source || '',
            url: page.content_urls?.mobile?.page || '',
          };
        });
    }

    res.json({ ok: true, world: worldEvents, korea: koreaEvents });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
