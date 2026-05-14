import { state } from './data.js';

export function renderPlan() {
  const el = document.getElementById('planPage');

  if (!state.profile) {
    el.innerHTML = '';
    return;
  }

  if (state.profile.trainingMode === 'trackAsYouGo') {
    renderTrackAsYouGoPlan(el);
    return;
  }

  const activeProgram = state.programs.find(p => p.isActive);
  if (!activeProgram) {
    renderNoProgramState(el);
    return;
  }

  renderStructuredPlan(el, activeProgram);
}

function renderTrackAsYouGoPlan(el) {
  const count = state.history.length;
  const hasActiveSession = !!state.currentSession;
  const btnLabel = hasActiveSession ? 'Resume' : 'Start';
  const btnClass = hasActiveSession ? 'start-btn resume' : 'start-btn';
  const btnAction = hasActiveSession ? 'resumeSession()' : 'startTrackAsYouGoWorkout()';
  el.innerHTML = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">Track As You Go</div>
      <div class="plan-mode-sub">${count} session${count !== 1 ? 's' : ''} logged</div>
    </div>
    <div class="day-card${hasActiveSession ? ' is-active-session' : ''}" style="border: 1px dashed var(--accent);">
      <div class="day-header">
        <div class="day-left">
          <div class="day-badge" style="border-color:var(--accent);color:var(--accent);">+</div>
          <div>
            <div class="day-title">Start New Workout</div>
            <div class="day-desc">Add exercises as you go</div>
          </div>
        </div>
        <button class="${btnClass}" onclick="${btnAction}">${btnLabel}</button>
      </div>
    </div>
    ${count > 0 && count % 10 === 0 ? `
      <div class="rules-card" style="border-color:rgba(212,255,58,0.3);">
        <div class="rules-card-title">Ready for a structured plan?</div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;">
          You've logged ${count} workouts! Head to Settings to set up a structured training program.
        </div>
        <button class="start-btn" onclick="switchTab('settings')" style="width:100%;">Go to Settings</button>
      </div>
    ` : ''}
  `;
}

function renderNoProgramState(el) {
  el.innerHTML = `
    <div class="empty-state">
      <div class="icon">📋</div>
      <p><strong>No active program.</strong><br>Go to Settings to create or activate a program.</p>
    </div>
    <button class="finish-btn" style="margin-top:16px;" onclick="switchTab('settings')">Go to Settings</button>
  `;
}

function getLastWorkoutDate(programId, dayId) {
  let latest = null;
  for (const s of state.history) {
    if (s.programId === programId && s.dayId === dayId) {
      if (!latest || new Date(s.date) > new Date(latest)) {
        latest = s.date;
      }
    }
  }
  return latest;
}

function formatLastWorkout(dateStr) {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function getSuggestedNextDayId(program) {
  const programSessions = state.history.filter(s => s.programId === program.id);
  if (programSessions.length === 0) return program.days[0]?.id ?? null;

  const lastSession = programSessions.reduce((latest, s) =>
    new Date(s.date) > new Date(latest.date) ? s : latest
  );

  const lastDayIdx = program.days.findIndex(d => d.id === lastSession.dayId);
  if (lastDayIdx === -1) return program.days[0]?.id ?? null;

  const nextIdx = (lastDayIdx + 1) % program.days.length;
  return program.days[nextIdx]?.id ?? null;
}

function renderStructuredPlan(el, prog) {
  const isCustom = prog.isCustom === true;
  const subLabel = isCustom ? 'Custom Program' : `${prog.days.length}-Day Program`;

  let html = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">${prog.name}</div>
      <div class="plan-mode-sub">${subLabel}</div>
    </div>
  `;

  const activeDayId = state.currentSession?.dayId ?? null;
  const suggestedDayId = getSuggestedNextDayId(prog);

  prog.days.forEach((d, idx) => {
    const totalSets = d.exercises.reduce((s, e) => s + e.sets, 0);
    const type = d.type || '';
    const isActive = activeDayId === d.id;
    const isNext = !isActive && d.id === suggestedDayId;
    const cardClass = `day-card${isActive ? ' is-active-session' : ''}`;
    const btnLabel = isActive ? 'Resume' : 'Start';
    const btnClass = isActive ? 'start-btn resume' : 'start-btn';

    const lastDate = getLastWorkoutDate(prog.id, d.id);
    const lastStr = formatLastWorkout(lastDate);

    const nextBadge = isNext
      ? `<span class="day-next-badge" title="Suggested next workout">⭐</span>`
      : '';

    html += `
      <div class="${cardClass}"${type ? ` data-type="${type}"` : ''}>
        <div class="day-header">
          <div class="day-left">
            <div class="day-badge">${idx + 1}</div>
            <div>
              <div class="day-title">${d.name} ${nextBadge}</div>
              <div class="day-desc">${d.exercises.length} exercises · ${totalSets} sets</div>
              <div class="day-last">Last: ${lastStr}</div>
            </div>
          </div>
          <button class="${btnClass}" onclick="startSession('${d.id}')">${btnLabel}</button>
        </div>
      </div>
    `;
  });

  el.innerHTML = html;
}
