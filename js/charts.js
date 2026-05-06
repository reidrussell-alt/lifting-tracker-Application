import { formatDateShort } from './utils.js';

export function drawSingleLineChart(canvas, points, yKey, color) {
  if (points.length === 0) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const padL = 36, padR = 16, padT = 16, padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const values = points.map(p => p[yKey]);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const padYRange = range * 0.15;
  const yMin = Math.max(0, minV - padYRange);
  const yMax = maxV + padYRange;

  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1;
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillStyle = '#555';
  for (let i = 0; i <= 3; i++) {
    const y = padT + (chartH / 3) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    const v = yMax - ((yMax - yMin) / 3) * i;
    ctx.fillText(Math.round(v), 4, y + 3);
  }

  ctx.fillStyle = '#888';
  if (points.length === 1) {
    ctx.fillText(formatDateShort(points[0].date), padL, h - 8);
  } else {
    ctx.fillText(formatDateShort(points[0].date), padL, h - 8);
    const xLabelN = formatDateShort(points[points.length - 1].date);
    const lastWidth = ctx.measureText(xLabelN).width;
    ctx.fillText(xLabelN, w - padR - lastWidth, h - 8);
  }

  if (points.length > 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padL + (chartW / (points.length - 1)) * i;
      const y = padT + chartH - ((p[yKey] - yMin) / (yMax - yMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = color + '15';
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.lineTo(padL, padT + chartH);
    ctx.closePath();
    ctx.fill();
  }

  points.forEach((p, i) => {
    const x = points.length === 1 ? padL + chartW / 2 : padL + (chartW / Math.max(1, points.length - 1)) * i;
    const y = padT + chartH - ((p[yKey] - yMin) / (yMax - yMin)) * chartH;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  });
}
