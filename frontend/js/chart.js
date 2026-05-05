// ── 차트 모듈 ──
import { DAYS_KR } from './saju.js';

// ── 5. 공용 캔버스 차트 렌더 ──
// ══════════════════════════════════════════
function drawChart(canvasId, data7, series, onClickIdx) {
  const canvas=document.getElementById(canvasId);
  if(!canvas) return;
  const dpr=window.devicePixelRatio||1;
  // card padding(20px) 고려해서 정확한 width 계산
  const parentW = canvas.parentElement.clientWidth || 360;
  const W = Math.max(200, parentW), H=parseInt(canvas.getAttribute('height'))||180;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
  const PAD={top:18,right:16,bottom:12,left:28};
  const cW=W-PAD.left-PAD.right, cH=H-PAD.top-PAD.bottom;
  const xP=i=>PAD.left+(i/6)*cW, yP=v=>PAD.top+cH-((v-1)/4)*cH;

  // 그리드
  ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1;
  [1,2,3,4,5].forEach(v=>{ctx.beginPath();ctx.moveTo(PAD.left,yP(v));ctx.lineTo(PAD.left+cW,yP(v));ctx.stroke();});
  ctx.fillStyle='rgba(232,224,208,.3)'; ctx.font='9px sans-serif'; ctx.textAlign='right';
  [1,2,3,4,5].forEach(v=>ctx.fillText(v,PAD.left-4,yP(v)+3));

  // 오늘 구분선
  ctx.strokeStyle='rgba(201,168,76,.3)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  // today marker removed (labels handle it)
  ctx.setLineDash([]);

  // 시리즈
  series.forEach(({vals,color,fillAlpha})=>{
    const grad=ctx.createLinearGradient(0,PAD.top,0,PAD.top+cH);
    const rgb=color.startsWith('#')?parseInt(color.slice(1,3),16)+','+parseInt(color.slice(3,5),16)+','+parseInt(color.slice(5,7),16):'201,168,76';
    grad.addColorStop(0,`rgba(${rgb},${fillAlpha})`); grad.addColorStop(1,`rgba(${rgb},0)`);
    ctx.beginPath(); ctx.moveTo(xP(0),yP(vals[0]));
    vals.forEach((v,i)=>{if(i>0)ctx.lineTo(xP(i),yP(v));});
    ctx.lineTo(xP(6),PAD.top+cH); ctx.lineTo(xP(0),PAD.top+cH); ctx.closePath();
    ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(xP(0),yP(vals[0]));
    vals.forEach((v,i)=>{if(i>0)ctx.lineTo(xP(i),yP(v));});
    ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
    vals.forEach((v,i)=>{
      ctx.beginPath(); ctx.arc(xP(i),yP(v),i===0?5:3.5,0,Math.PI*2);
      ctx.fillStyle=i===0?color:'rgba(7,4,15,.85)'; ctx.fill();
      ctx.strokeStyle=i===0?'rgba(255,255,255,.6)':color; ctx.lineWidth=i===0?2:1.5; ctx.stroke();
    });
  });

  // 최고점
  const mainVals=series[0].vals, maxI=mainVals.reduce((mi,v,i,a)=>v>a[mi]?i:mi,0);
  ctx.fillStyle='#f0d080'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
  ctx.fillText(`▲${mainVals[maxI]}`,xP(maxI),yP(mainVals[maxI])-9);

  // 오늘 표시
  ctx.fillStyle='rgba(201,168,76,.7)'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
  ctx.fillText('TODAY',xP(0),PAD.top+cH+10);

  // 클릭
  canvas.onclick=e=>{
    const rect=canvas.getBoundingClientRect();
    const idx=Math.max(0,Math.min(6,Math.round((e.clientX-rect.left-PAD.left)/(cW/6))));
    onClickIdx(idx);
  };
  canvas.style.touchAction='manipulation';
}

// ── 날짜 라벨 렌더 ──
function renderLabels(elId, data7, onClickIdx) {
  const container = document.getElementById(elId);
  if (!container) return;
  const PAD_L=28, PAD_R=16;
  // canvas 실제 너비 읽기 (canvas가 렌더된 이후)
  const canvasId = elId.replace('-labels','').replace('saju-week','saju-week-chart').replace('z-week','z-week-chart');
  const canvasEl = document.getElementById(canvasId);
  const W = canvasEl ? parseInt(canvasEl.style.width)||container.parentElement.clientWidth||360 : container.parentElement.clientWidth||360;
  const cW = W - PAD_L - PAD_R;
  const xP = i => PAD_L + (i/6)*cW;

  container.style.position='relative';
  container.style.height='38px';
  container.style.marginTop='6px';

  container.innerHTML = data7.map((d,i)=>{
    const lvlColor=d.level==='high'?'#f0d080':d.level==='mid'?'rgba(232,224,208,.7)':'rgba(160,140,200,.7)';
    const bg=d.isToday?'background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);border-radius:6px;':'';
    const dateLabel=d.isToday?'오늘':(d.date.getMonth()+1)+'/'+(d.date.getDate());
    return `<div onclick="(${onClickIdx})(${i})" style="position:absolute;left:${xP(i)}px;transform:translateX(-50%);cursor:pointer;text-align:center;padding:3px 4px;${bg}transition:background .2s;min-width:28px;"
      onmouseover="this.style.background='rgba(201,168,76,.18)'" onmouseout="this.style.background='${d.isToday?'rgba(201,168,76,.15)':'transparent'}'">
      <div style="font-size:9px;color:${d.isToday?'var(--gold)':'var(--text-dim);white-space:nowrap'}">${dateLabel}</div>
      <div style="font-size:10px;color:${lvlColor};margin-top:1px;">${DAYS_KR[d.date.getDay()]}</div>
    </div>`;
  }).join('');
}

// ── 공용 상세 모달 열기 ──
function openDetailModal(date,emoji,dateHtml,subHtml,barsHtml,text,tipsArr) {
  document.getElementById('dm-date').innerHTML=dateHtml;
  document.getElementById('dm-sub').innerHTML=subHtml;
  document.getElementById('dm-emoji').textContent=emoji;
  document.getElementById('dm-bars').innerHTML=barsHtml;
  document.getElementById('dm-text').innerHTML=text;
  document.getElementById('dm-tips').innerHTML=tipsArr.map(t=>`
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center;">
      <span style="font-size:20px;display:block;margin-bottom:3px;">${t.e}</span>
      <div style="font-size:9px;color:var(--text-dim);">${t.l}</div>
      <div style="font-size:12px;color:var(--gold-l);margin-top:2px;">${t.v}</div>
    </div>`).join('');
  const modal=document.getElementById('detail-modal'), sheet=document.getElementById('detail-sheet');
  modal.style.display='flex';
  modal.onclick=e=>{if(e.target===modal)closeDetail();};
  requestAnimationFrame(()=>requestAnimationFrame(()=>{sheet.style.transform='translateY(0)';}));
}
function closeDetail() {
  document.getElementById('detail-sheet').style.transform='translateY(100%)';
  setTimeout(()=>{document.getElementById('detail-modal').style.display='none';},350);
}

export { drawChart, renderLabels, openDetailModal, closeDetail };
