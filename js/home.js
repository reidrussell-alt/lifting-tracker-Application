import { state } from './data.js';

export function renderHome() {
  const el = document.getElementById('homePage');
  if (!el) return;

  const name = state.profile?.name || 'there';
  const { grid, legendHtml, typesThisWeek } = buildWeekView();

  el.innerHTML = `
    <div class="home-welcome">
      <div class="home-greeting-line">Welcome,</div>
      <div class="home-name-line">${name}</div>
    </div>

    <button class="home-start-btn" onclick="window.homeStartWorkout()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Start Workout
    </button>

    <div class="home-section-label">This Week</div>
    <div class="home-week-card">
      ${grid}
      ${legendHtml}
    </div>

    ${buildStatsStrip()}
  `;
}

// ─── Week View ────────────────────────────────────────────────────────────────

function buildWeekView() {
  const today = new Date();
  const dow = today.getDay();

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const byDay = {};
  for (const s of state.history) {
    const d = new Date(s.date);
    if (d >= weekStart && d < weekEnd) {
      const idx = d.getDay();
      if (!byDay[idx] || new Date(s.date) > new Date(byDay[idx].date)) byDay[idx] = s;
    }
  }

  const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const typesThisWeek = new Set();
  let cells = '';

  for (let i = 0; i < 7; i++) {
    const session = byDay[i];
    const isToday = i === dow;
    const cellClass = ['home-week-cell', isToday ? 'home-week-cell--today' : ''].filter(Boolean).join(' ');

    const dateObj = new Date(weekStart);
    dateObj.setDate(weekStart.getDate() + i);
    const iso = dateObj.toISOString().split('T')[0];

    let badgeHtml;
    if (session) {
      const type = getDayType(session);
      typesThisWeek.add(type);
      const label = abbreviateDay(session.dayTitle);
      badgeHtml = `<div class="home-week-badge home-week-badge--${type}" onclick="window.openCalendarDay('${iso}')">${label}</div>`;
    } else {
      badgeHtml = `<div class="home-week-badge home-week-badge--empty"></div>`;
    }

    cells += `
      <div class="${cellClass}">
        <div class="home-week-dow">${DOW_LABELS[i]}</div>
        ${badgeHtml}
      </div>
    `;
  }

  const TYPE_LABELS = {
    push: 'Push', pull: 'Pull', legs: 'Legs',
    recovery: 'Recovery', default: 'Workout'
  };

  let legendHtml = '';
  if (typesThisWeek.size > 0) {
    const items = [...typesThisWeek].map(t =>
      `<div class="home-legend-item">
        <span class="home-legend-dot home-legend-dot--${t}"></span>
        <span>${TYPE_LABELS[t] || t}</span>
      </div>`
    ).join('');
    legendHtml = `<div class="home-week-legend">${items}</div>`;
  }

  return { grid: `<div class="home-week-grid">${cells}</div>`, legendHtml, typesThisWeek };
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function buildStatsStrip() {
  const history = state.history || [];
  const total = history.length;

  const today = new Date();
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = history.filter(s => new Date(s.date) >= weekStart).length;

  let lastLabel = '—';
  if (total > 0) {
    const last = history.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
    const diffDays = Math.floor((today - new Date(last.date)) / (1000 * 60 * 60 * 24));
    lastLabel = diffDays === 0 ? 'Today' : diffDays === 1 ? '1d ago' : `${diffDays}d ago`;
  }

  return `
    <div class="home-stats-strip">
      <div class="home-stat-tile">
        <div class="home-stat-value">${thisWeek}</div>
        <div class="home-stat-label">This Week</div>
      </div>
      <div class="home-stat-tile">
        <div class="home-stat-value">${total}</div>
        <div class="home-stat-label">Total</div>
      </div>
      <div class="home-stat-tile">
        <div class="home-stat-value home-stat-value--sm">${lastLabel}</div>
        <div class="home-stat-label">Last Session</div>
      </div>
    </div>
  `;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayType(session) {
  for (const prog of (state.programs || [])) {
    const day = prog.days?.find(d => d.id === session.dayId);
    if (day?.type) return day.type;
  }
  const title = (session.dayTitle || '').toLowerCase();
  if (title.includes('push') || (title.includes('upper') && title.includes('a'))) return 'push';
  if (title.includes('pull') || (title.includes('upper') && title.includes('b'))) return 'pull';
  if (title.includes('leg') || title.includes('lower')) return 'legs';
  return 'default';
}

function abbreviateDay(title) {
  if (!title) return '?';
  const base = title.split(' - ')[0].trim();
  return base.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('');
}

function getSuggestedDay(program) {
  const sessions = state.history.filter(s => s.programId === program.id);
  if (sessions.length === 0) return program.days[0];
  const last = sessions.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
  const lastIdx = program.days.findIndex(d => d.id === last.dayId);
  if (lastIdx === -1) return program.days[0];
  return program.days[(lastIdx + 1) % program.days.length];
}

// ─── Start Workout Sheet ──────────────────────────────────────────────────────

export function homeStartWorkout() {
  const profile = state.profile;

  if (!profile || profile.trainingMode !== 'structured') {
    window.startTrackAsYouGoWorkout();
    return;
  }

  const activeProgram = (state.programs || []).find(p => p.isActive);
  if (!activeProgram) {
    window.switchTab('myPlans');
    return;
  }

  showStartSheet(activeProgram);
}

function showStartSheet(program) {
  const modal = document.getElementById('calendarDayModal');
  const body = document.getElementById('calendarDayBody');

  const suggested = getSuggestedDay(program);

  let html = `
    <div class="cday-header">
      <div class="cday-title">Start Workout</div>
      <button class="cday-close" onclick="window.closeCalendarDay()">×</button>
    </div>
    <div class="start-sheet-label">Next Up</div>
    <div class="manual-day-card start-suggested-card" onclick="window.closeCalendarDay(); window.startSession('${suggested.id}')">
      <div class="start-suggested-inner">
        <div>
          <div class="manual-day-name">${suggested.name}</div>
          <div class="manual-day-meta">${suggested.exercises.length} exercises · ${suggested.exercises.reduce((s, e) => s + e.sets, 0)} sets</div>
        </div>
        <div class="start-suggested-arrow">→</div>
      </div>
    </div>
  `;

  const others = program.days.filter(d => d.id !== suggested.id);
  if (others.length > 0) {
    html += `<div class="start-sheet-label start-sheet-label--dim">Or choose a different day</div>`;
    others.forEach(d => {
      const totalSets = d.exercises.reduce((s, e) => s + e.sets, 0);
      html += `
        <div class="manual-day-card" onclick="window.closeCalendarDay(); window.startSession('${d.id}')">
          <div class="manual-day-name">${d.name}</div>
          <div class="manual-day-meta">${d.exercises.length} exercises · ${totalSets} sets</div>
        </div>
      `;
    });
  }

  body.innerHTML = html;
  modal.classList.add('active');
}
