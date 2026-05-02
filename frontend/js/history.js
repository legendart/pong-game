// ── 역사 모듈 ──
import { fetchHistory as apiFetchHistory, HAS_BACKEND } from './api.js';

let _currentTab = 'world';

export function switchTab(tab) {
  _currentTab = tab;
  const wBtn = document.getElementById('tab-world');
  const kBtn = document.getElementById('tab-korea');
  const wEl  = document.getElementById('history-world');
  const kEl  = document.getElementById('history-korea');
  const on  = 'flex:1;padding:8px;border-radius:10px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;cursor:pointer;border:1px solid var(--gold);background:rgba(201,168,76,.2);color:var(--gold-l);';
  const off = 'flex:1;padding:8px;border-radius:10px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text-dim);';
  if (tab === 'world') {
    wBtn?.setAttribute('style', on); kBtn?.setAttribute('style', off);
    if (wEl) wEl.style.display = 'flex';
    if (kEl) kEl.style.display = 'none';
  } else {
    kBtn?.setAttribute('style', on); wBtn?.setAttribute('style', off);
    if (kEl) kEl.style.display = 'flex';
    if (wEl) wEl.style.display = 'none';
  }
}

function historyCardHTML(item) {
  const imgHTML = item.img
    ? `<img src="${item.img}" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:12px 12px 0 0;display:block;" onerror="this.style.display='none'">`
    : '';
  const linkHTML = item.url
    ? `<a href="${item.url}" target="_blank" rel="noopener" style="font-size:11px;color:var(--gold);text-decoration:none;margin-top:10px;display:inline-flex;align-items:center;gap:4px;">🔗 자세히 보기</a>`
    : '';
  return `<div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
    ${imgHTML}<div style="padding:14px;">
    <div style="display:inline-block;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);border-radius:8px;padding:3px 10px;font-size:11px;color:var(--gold);margin-bottom:10px;font-weight:600;">${item.year}</div>
    <div style="font-family:'Noto Serif KR',serif;font-size:14px;line-height:1.9;color:var(--text);">${item.text}</div>
    ${linkHTML}</div></div>`;
}

async function fetchHistoryFallback(month, day) {
  // 백엔드 없을 때 직접 Wikipedia 호출 (CORS 허용)
  const [engRes, koRes] = await Promise.allSettled([
    fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,{headers:{Accept:'application/json'}}),
    fetch(`https://ko.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,{headers:{Accept:'application/json'}}),
  ]);
  let world=[], korea=[];
  if (engRes.status==='fulfilled'&&engRes.value.ok){
    const d=await engRes.value.json();
    world=(d.events||[]).sort((a,b)=>(b.pages||[]).some(p=>p.thumbnail)-(a.pages||[]).some(p=>p.thumbnail)).slice(0,6).map(ev=>{
      const p=(ev.pages||[])[0]||{};
      return{year:ev.year<0?`기원전 ${Math.abs(ev.year)}년`:`${ev.year}년`,text:ev.text||'',img:p.thumbnail?.source||'',url:p.content_urls?.mobile?.page||''};
    });
  }
  if (koRes.status==='fulfilled'&&koRes.value.ok){
    const d=await koRes.value.json();
    korea=(d.events||[]).slice(0,6).map(ev=>{
      const p=(ev.pages||[])[0]||{};
      return{year:ev.year<0?`기원전 ${Math.abs(ev.year)}년`:`${ev.year}년`,text:ev.text||'',img:p.thumbnail?.source||'',url:p.content_urls?.mobile?.page||''};
    });
  }
  return{ok:true,world,korea};
}

export async function loadHistory() {
  const now = new Date();
  const m = now.getMonth()+1, d = now.getDate();

  document.getElementById('history-date-label')?.textContent && (document.getElementById('history-date-label').textContent = `${m}월 ${d}일`);

  const loading = document.getElementById('history-loading');
  const errEl   = document.getElementById('history-error');
  const worldEl = document.getElementById('history-world');
  const koreaEl = document.getElementById('history-korea');

  if(loading) loading.style.display='block';
  if(errEl)   errEl.style.display='none';
  if(worldEl) worldEl.style.display='none';
  if(koreaEl) koreaEl.style.display='none';

  try {
    const data = HAS_BACKEND
      ? await apiFetchHistory(m, d)
      : await fetchHistoryFallback(m, d);

    if(worldEl) worldEl.innerHTML = data.world?.length
      ? data.world.map(historyCardHTML).join('')
      : '<div style="text-align:center;color:var(--text-dim);padding:30px;">이벤트 없음</div>';

    if(koreaEl) koreaEl.innerHTML = data.korea?.length
      ? data.korea.map(historyCardHTML).join('')
      : '<div style="text-align:center;color:var(--text-dim);padding:30px;">이벤트 없음</div>';

    if(loading) loading.style.display='none';
    switchTab(_currentTab);
  } catch(err) {
    console.error('history error:', err);
    if(loading) loading.style.display='none';
    if(errEl)   errEl.style.display='block';
  }
}

// 탭 전환 전역 노출
window.switchHistoryTab = switchTab;
