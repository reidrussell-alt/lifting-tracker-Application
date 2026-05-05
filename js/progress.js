import { state, saveData } from './data.js';
import { MUSCLE_GROUPS, MUSCLE_GROUP_ORDER, MUSCLE_GROUP_META } from './program.js';
import { formatDate, formatDateShort, isoDateOnly, showToast } from './utils.js';
import { drawSingleLineChart } from './charts.js';

const FALLBACK_COLORS = ['#ff6b35','#d4ff3a','#3a9eff','#b86bff','#4ade80','#f472b6','#fb923c','#60a5fa'];

function dayColor(dayId) {
  const known = { upperA:'#ff6b35', lowerA:'#d4ff3a', upperB:'#3a9eff', lowerB:'#b86bff' };
  if (known[dayId]) return known[dayId];
  let h = 0;
  for (const c of dayId) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

export function navigateCalendar(dir) {
  calendarMonth += dir;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  if (calendarMonth < 0)  { calendarMonth = 11; calendarYear--; }
  renderProgress();
}

function renderCalendar() {
  const today = new Date();
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay  = new Date(calendarYear, calendarMonth + 1, 0);
  const startDow = firstDay.getDay();

  const sessionsByDate = {};
  state.history.forEach(sess => {
    const key = sess.date.split('T')[0];
    if (!sessionsByDate[key]) sessionsByDate[key] = [];
    sessionsByDate[key].push(sess);
  });

  // Build legend from days that actually appear this month
  const monthLegend = {};
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    (sessionsByDate[key] || []).forEach(s => {
      if (!monthLegend[s.dayId]) {
        monthLegend[s.dayId] = { color: dayColor(s.dayId), label: s.dayTitle || s.dayId };
      }
    });
  }

  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const legendHtml = Object.values(monthLegend).map(({ color, label }) => `
    <span class="cal-legend-item">
      <span class="cal-legend-dot" style="background:${color};"></span>
      <span>${label}</span>
    </span>
  `).join('');

  let html = `
    <div class="chart-card calendar-card">
      <div class="calendar-nav">
        <button class="cal-nav-btn" onclick="navigateCalendar(-1)">&#8592;</button>
        <div class="calendar-month-label">${monthLabel}</div>
        <button class="cal-nav-btn" onclick="navigateCalendar(1)">&#8594;</button>
      </div>
      ${legendHtml ? `<div class="calendar-legend">${legendHtml}</div>` : ''}
      <div class="calendar-grid">
        ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
  `;

  for (let i = 0; i < startDow; i++) {
    html += `<div class="cal-day cal-day--empty"></div>`;
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const sessions = sessionsByDate[key] || [];
    const isToday = today.getFullYear() === calendarYear &&
                    today.getMonth() === calendarMonth &&
                    today.getDate() === d;

    html += `
      <div class="cal-day${isToday ? ' cal-day--today' : ''}">
        <span class="cal-day-num">${d}</span>
        <div class="cal-dots">
          ${sessions.map(s =>
            `<span class="cal-dot" style="background:${dayColor(s.dayId)};" title="${s.dayTitle || s.dayId}"></span>`
          ).join('')}
        </div>
      </div>
    `;
  }

  html += `</div></div>`;
  return html;
}

export function renderProgress() {
  const el = document.getElementById('progressPage');

  if (state.history.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📊</div>
        <p><strong>No workouts logged yet.</strong><br>Complete a session to see your progress here.</p>
      </div>
      ${renderCalendar()}
    `;
    return;
  }

  const totalSessions = state.history.length;
  const totalSets = state.history.reduce((s, h) =>
    s + h.exercises.reduce((es, ex) => es + ex.sets.length, 0), 0);

  const sessionsByDay = {};
  state.history.forEach(h => {
    if (!sessionsByDay[h.dayId]) sessionsByDay[h.dayId] = { count: 0, title: h.dayTitle || h.dayId };
    sessionsByDay[h.dayId].count++;
  });

  const mostRecent = [...state.history].reverse().find(h => h.bw);
  const currentBw = mostRecent?.bw || '—';

  const exerciseStats = {};
  state.history.forEach((sess, sessionIdx) => {
    sess.exercises.forEach((ex, exerciseIdx) => {
      if (!exerciseStats[ex.id]) {
        exerciseStats[ex.id] = { name: ex.name, loadType: ex.loadType, sessions: [] };
      }
      exerciseStats[ex.id].sessions.push({
        date: sess.date,
        sets: ex.sets,
        note: ex.note || '',
        dayTitle: sess.dayTitle,
        sessionIdx,
        exerciseIdx
      });
    });
  });

  let html = `
    <div class="progress-summary">
      <div class="progress-title">Your Stats</div>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-label">Sessions</div>
          <div class="stat-value">${totalSessions}</div>
          <div class="stat-sub">All-time</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Sets Logged</div>
          <div class="stat-value">${totalSets}</div>
          <div class="stat-sub">All-time</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Current BW</div>
          <div class="stat-value">${currentBw}</div>
          <div class="stat-sub">lb</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Most Trained</div>
          <div class="stat-value" style="font-size: 16px; font-family: 'Inter Tight'; font-weight: 900;">
            ${getMostTrainedDay(sessionsByDay)}
          </div>
          <div class="stat-sub">${Math.max(...Object.values(sessionsByDay).map(s => s.count), 0)} sessions</div>
        </div>
      </div>
    </div>
  `;

  html += renderCalendar();

  // Group exercises by muscle group
  const muscleGroupStats = {};
  MUSCLE_GROUP_ORDER.forEach(mg => muscleGroupStats[mg] = {});
  Object.entries(exerciseStats).forEach(([id, data]) => {
    const mg = MUSCLE_GROUPS[id] || 'other';
    if (!muscleGroupStats[mg]) muscleGroupStats[mg] = {};
    muscleGroupStats[mg][id] = data;
  });

  // Default selected exercise per group to most-trained
  MUSCLE_GROUP_ORDER.forEach(mg => {
    const exercisesInGroup = muscleGroupStats[mg] || {};
    const exIds = Object.keys(exercisesInGroup);
    if (exIds.length === 0) return;
    if (!state.chartExerciseByGroup[mg] || !exercisesInGroup[state.chartExerciseByGroup[mg]]) {
      const sorted = Object.entries(exercisesInGroup).sort((a, b) => b[1].sessions.length - a[1].sessions.length);
      state.chartExerciseByGroup[mg] = sorted[0][0];
    }
  });

  MUSCLE_GROUP_ORDER.forEach(mg => {
    const exercisesInGroup = muscleGroupStats[mg] || {};
    const exIds = Object.keys(exercisesInGroup);
    if (exIds.length === 0) return;

    const meta = MUSCLE_GROUP_META[mg];
    const selectedId = state.chartExerciseByGroup[mg];
    const selectedData = exercisesInGroup[selectedId];
    const trend = analyzeTrend(selectedData);

    const opts = Object.entries(exercisesInGroup)
      .sort((a, b) => b[1].sessions.length - a[1].sessions.length)
      .map(([id, data]) => `<option value="${id}" ${id === selectedId ? 'selected' : ''}>${data.name} (${data.sessions.length})</option>`)
      .join('');

    html += `
      <div class="chart-card" style="border-left: 3px solid ${meta.color};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div class="chart-title" style="color: ${meta.color};">${meta.label.toUpperCase()}</div>
          <div class="trend-pill ${trend.cls}">${trend.label}</div>
        </div>
        <div class="chart-subtitle">Weight growth · ${selectedData.sessions.length} sessions logged</div>
        <select class="chart-select" onchange="updateMuscleGroupExercise('${mg}', this.value)">
          ${opts}
        </select>
        <div class="chart-canvas-wrap"><canvas id="chart_${mg}"></canvas></div>
        <div class="chart-legend">
          <span><span class="legend-dot" style="background: ${meta.color};"></span>${selectedData.loadType === 'bw' ? 'Max Reps' : 'Top Weight (lb)'}</span>
        </div>
        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border);">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>Session History</span>
            <span style="color: var(--text-dimmer); text-transform: none; letter-spacing: 0.5px; font-style: italic;">tap to expand</span>
          </div>
          <div class="exercise-history-block" style="margin-bottom: 0; border: 1px solid var(--border);">
            <div class="exercise-history-header" onclick="toggleHistoryBlock(this)">
              <div>
                <div class="ex-history-name">${selectedData.name}</div>
                <div class="ex-history-meta">${trend.summary}</div>
              </div>
              <div style="color: var(--text-dim); font-size: 16px;">▾</div>
            </div>
            <div class="history-detail">
              ${selectedData.sessions.slice().reverse().map(s => `
                <div class="history-session">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div class="history-date" style="margin-bottom: 0;">${formatDate(s.date)} · ${s.dayTitle}</div>
                    <button onclick="event.stopPropagation(); openEditModal(${s.sessionIdx}, ${s.exerciseIdx})"
                            style="background: var(--surface-3); border: 1px solid var(--border); color: var(--accent); font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; cursor: pointer;">
                      Edit
                    </button>
                  </div>
                  <div class="history-sets">
                    ${s.sets.map(set => {
                      if (selectedData.loadType === 'bw') return `<span class="history-set-tag">${set.reps} reps</span>`;
                      return `<span class="history-set-tag">${set.weight}lb × ${set.reps}</span>`;
                    }).join('')}
                  </div>
                  ${s.sets.filter(set => set.note).map(set => `
                    <div class="history-note">"${set.note}"</div>
                  `).join('')}
                  ${s.note ? `<div class="history-ex-note">📝 ${s.note}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `
    <div class="chart-card">
      <div class="chart-title">Total Sets Per Session</div>
      <div class="chart-subtitle">All exercises combined</div>
      <div class="chart-canvas-wrap"><canvas id="volumeChart"></canvas></div>
    </div>
  `;

  const bwData = state.history.filter(h => h.bw && parseFloat(h.bw) > 0);
  if (bwData.length > 0) {
    html += `
      <div class="chart-card">
        <div class="chart-title">Bodyweight</div>
        <div class="chart-subtitle">Tracked across sessions</div>
        <div class="chart-canvas-wrap"><canvas id="bwChart"></canvas></div>
      </div>
    `;
  }

  el.innerHTML = html;

  setTimeout(() => {
    MUSCLE_GROUP_ORDER.forEach(mg => {
      const exercisesInGroup = muscleGroupStats[mg] || {};
      const selectedId = state.chartExerciseByGroup[mg];
      if (selectedId && exercisesInGroup[selectedId]) {
        renderMuscleGroupChart(mg, exercisesInGroup[selectedId]);
      }
    });
    renderVolumeChart();
    if (bwData.length > 0) renderBwChart(bwData);
  }, 50);
}

export function updateMuscleGroupExercise(mg, id) {
  state.chartExerciseByGroup[mg] = id;
  renderProgress();
}

export function renderMuscleGroupChart(mg, exerciseData) {
  if (!exerciseData) return;
  const canvas = document.getElementById('chart_' + mg);
  if (!canvas) return;
  const color = MUSCLE_GROUP_META[mg].color;

  const dataPoints = exerciseData.sessions.map(s => {
    const validSets = s.sets.filter(set => set.reps !== '');
    const topWeight = exerciseData.loadType === 'bw'
      ? Math.max(...validSets.map(set => parseInt(set.reps) || 0), 0)
      : Math.max(...validSets.map(set => parseFloat(set.weight) || 0), 0);
    return { date: s.date, topWeight };
  });

  drawSingleLineChart(canvas, dataPoints, 'topWeight', color);
}

export function renderVolumeChart() {
  const canvas = document.getElementById('volumeChart');
  if (!canvas) return;
  const dataPoints = state.history.map(s => ({
    date: s.date,
    sets: s.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  }));
  drawSingleLineChart(canvas, dataPoints, 'sets', '#d4ff3a');
}

export function renderBwChart(bwData) {
  const canvas = document.getElementById('bwChart');
  if (!canvas) return;
  const dataPoints = bwData.map(s => ({ date: s.date, bw: parseFloat(s.bw) }));
  drawSingleLineChart(canvas, dataPoints, 'bw', '#ff6b35');
}

export function getMostTrainedDay(sessionsByDay) {
  if (!Object.keys(sessionsByDay).length) return '—';
  const best = Object.values(sessionsByDay).reduce((a, b) => b.count > a.count ? b : a);
  return best.count > 0 ? best.title : '—';
}

export function analyzeTrend(exerciseData) {
  const sessions = exerciseData.sessions;
  if (sessions.length < 2) return { label: 'NEW', cls: 'trend-new', summary: 'First time logged' };

  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  if (exerciseData.loadType === 'bw') {
    const firstReps = Math.max(...first.sets.map(s => parseInt(s.reps) || 0));
    const lastReps = Math.max(...last.sets.map(s => parseInt(s.reps) || 0));
    const diff = lastReps - firstReps;
    if (diff > 0) return { label: `+${diff} REPS`, cls: 'trend-up', summary: `${firstReps} → ${lastReps} reps` };
    if (diff < 0) return { label: `${diff} REPS`, cls: 'trend-flat', summary: `${firstReps} → ${lastReps} reps` };
    return { label: 'STEADY', cls: 'trend-flat', summary: `${lastReps} reps top set` };
  }

  const firstTop = Math.max(...first.sets.map(s => parseFloat(s.weight) || 0));
  const lastTop = Math.max(...last.sets.map(s => parseFloat(s.weight) || 0));
  const diff = lastTop - firstTop;
  if (diff > 0) return { label: `+${diff}LB`, cls: 'trend-up', summary: `${firstTop} → ${lastTop} lb top set` };
  if (diff < 0) return { label: `${diff}LB`, cls: 'trend-flat', summary: `${firstTop} → ${lastTop} lb top set` };
  return { label: 'STEADY', cls: 'trend-flat', summary: `${lastTop} lb top set` };
}

export function toggleHistoryBlock(header) {
  header.parentElement.classList.toggle('expanded');
}

export function openEditModal(sessionIdx, exerciseIdx) {
  state.editing = { sessionIdx, exerciseIdx };
  const session = state.history[sessionIdx];
  const exercise = session.exercises[exerciseIdx];
  const dateStr = isoDateOnly(session.date);

  let html = `
    <div style="margin-bottom: 16px;">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">Workout Date</div>
      <input type="date" id="editDateInput" value="${dateStr}"
             style="width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;">
      <div style="font-size: 10px; color: var(--text-dimmer); margin-top: 4px; font-style: italic;">Date applies to the whole workout session.</div>
    </div>
    <div style="margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase;">${exercise.name} — Sets</div>
  `;

  exercise.sets.forEach((set, i) => {
    if (exercise.loadType === 'bw') {
      html += `
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-dim); font-weight: 700; width: 24px;">#${i + 1}</div>
            <input type="number" inputmode="numeric" class="edit-reps" data-idx="${i}" value="${set.reps}" placeholder="reps"
                   style="flex: 1; background: var(--surface-3); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-align: center;">
          </div>
          <textarea class="edit-note" data-idx="${i}" placeholder="Note..." rows="1"
                    style="width: 100%; background: var(--surface-3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; color: var(--text); font-family: 'Inter Tight', sans-serif; font-size: 11px; font-style: italic; resize: vertical; min-height: 30px;">${set.note || ''}</textarea>
        </div>
      `;
    } else {
      html += `
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-dim); font-weight: 700; width: 24px;">#${i + 1}</div>
            <input type="number" inputmode="decimal" class="edit-weight" data-idx="${i}" value="${set.weight}" placeholder="lb"
                   style="flex: 1; background: var(--surface-3); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-align: center;">
            <span style="color: var(--text-dimmer); font-family: 'JetBrains Mono', monospace; font-size: 11px;">×</span>
            <input type="number" inputmode="numeric" class="edit-reps" data-idx="${i}" value="${set.reps}" placeholder="reps"
                   style="flex: 1; background: var(--surface-3); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-align: center;">
          </div>
          <textarea class="edit-note" data-idx="${i}" placeholder="Note..." rows="1"
                    style="width: 100%; background: var(--surface-3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; color: var(--text); font-family: 'Inter Tight', sans-serif; font-size: 11px; font-style: italic; resize: vertical; min-height: 30px;">${set.note || ''}</textarea>
        </div>
      `;
    }
  });

  document.getElementById('editModalBody').innerHTML = html;
  document.getElementById('editModal').classList.add('active');
}

export function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  state.editing = null;
}

export function saveEdit() {
  if (!state.editing) return;
  const { sessionIdx, exerciseIdx } = state.editing;
  const session = state.history[sessionIdx];
  const exercise = session.exercises[exerciseIdx];

  const newDateStr = document.getElementById('editDateInput').value;
  if (newDateStr) {
    session.date = new Date(newDateStr + 'T12:00:00').toISOString();
  }

  exercise.sets.forEach((set, i) => {
    const weightEl = document.querySelector(`.edit-weight[data-idx="${i}"]`);
    const repsEl = document.querySelector(`.edit-reps[data-idx="${i}"]`);
    const noteEl = document.querySelector(`.edit-note[data-idx="${i}"]`);
    if (weightEl) set.weight = weightEl.value;
    if (repsEl) set.reps = repsEl.value;
    if (noteEl) set.note = noteEl.value;
  });

  saveData();
  closeEditModal();
  showToast('Workout updated ✓', 'success');
  renderProgress();
}

export function deleteEditSession() {
  if (!state.editing) return;
  if (!confirm('Delete this exercise from the workout? If it was the only exercise in the session, the whole session will be removed.')) return;
  const { sessionIdx, exerciseIdx } = state.editing;
  const session = state.history[sessionIdx];
  session.exercises.splice(exerciseIdx, 1);
  if (session.exercises.length === 0) {
    state.history.splice(sessionIdx, 1);
  }
  saveData();
  closeEditModal();
  showToast('Deleted ✓');
  renderProgress();
}
