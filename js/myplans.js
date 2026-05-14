import { state } from './data.js';
import { PROGRAM_TEMPLATES } from './programTemplates.js';

const MAX_CUSTOM_PROGRAMS = 5;

export function renderMyPlans() {
  const el = document.getElementById('myPlansPage');
  if (!el) return;

  if (!state.profile) {
    el.innerHTML = '';
    return;
  }

  if (state.profile.trainingMode === 'trackAsYouGo') {
    renderTrackAsYouGoMyPlans(el);
    return;
  }

  const activeProgram = (state.programs || []).find(p => p.isActive);

  if (!activeProgram) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <p><strong>No active program.</strong><br>Create or activate one below.</p>
      </div>
      ${renderManageSectionHtml()}
    `;
    return;
  }

  el.innerHTML = `
    ${renderActivePlanHtml(activeProgram)}
    ${renderManageSectionHtml()}
  `;
}

function renderTrackAsYouGoMyPlans(el) {
  const count = state.history.length;
  el.innerHTML = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">Track As You Go</div>
      <div class="plan-mode-sub">${count} session${count !== 1 ? 's' : ''} logged</div>
    </div>
    ${renderManageSectionHtml()}
  `;
}

function renderActivePlanHtml(prog) {
  const isCustom = prog.isCustom === true;
  const subLabel = isCustom ? 'Custom Program' : `${prog.days.length}-Day Program`;

  const programSessions = state.history.filter(s => s.programId === prog.id);
  let suggestedDayId = prog.days[0]?.id ?? null;

  if (programSessions.length > 0) {
    const last = programSessions.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
    const lastIdx = prog.days.findIndex(d => d.id === last.dayId);
    if (lastIdx !== -1) {
      suggestedDayId = prog.days[(lastIdx + 1) % prog.days.length]?.id ?? null;
    }
  }

  const activeDayId = state.currentSession?.dayId ?? null;

  let html = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">${prog.name}</div>
      <div class="plan-mode-sub">${subLabel}</div>
    </div>
  `;

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
    const nextBadge = isNext ? `<span class="day-next-badge" title="Suggested next workout">⭐</span>` : '';

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

  return html;
}

function getLastWorkoutDate(programId, dayId) {
  let latest = null;
  for (const s of state.history) {
    if (s.programId === programId && s.dayId === dayId) {
      if (!latest || new Date(s.date) > new Date(latest)) latest = s.date;
    }
  }
  return latest;
}

function formatLastWorkout(dateStr) {
  if (!dateStr) return 'Never';
  const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function renderManageSectionHtml() {
  const customPrograms = (state.programs || []).filter(p => p.isCustom === true && !p.isActive);
  const customCount = (state.programs || []).filter(p => p.isCustom === true).length;
  const atLimit = customCount >= MAX_CUSTOM_PROGRAMS;

  let inner = '';

  if (customPrograms.length === 0) {
    inner += `<p class="settings-empty-msg">No custom plans yet.</p>`;
  } else {
    inner += customPrograms.map(renderManageProgramCard).join('');
  }

  if (!atLimit) {
    inner += `
      <button class="myplans-create-btn" onclick="window.showCreatePlanSheet()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0;">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create a Plan
      </button>
    `;
  } else {
    inner += `<p class="settings-empty-msg" style="text-align:center;margin-top:8px;">Maximum ${MAX_CUSTOM_PROGRAMS} custom plans reached. Delete one to create new.</p>`;
  }

  return `
    <div class="settings-section">
      <div class="settings-section-title">Manage Plans</div>
      ${inner}
    </div>
  `;
}

function renderManageProgramCard(prog) {
  const totalExercises = prog.days.reduce((s, d) => s + (d.exercises?.length || 0), 0);
  return `
    <div class="program-item">
      <div class="program-item-top">
        <div style="flex:1;min-width:0;">
          <div class="program-item-name">${prog.name}</div>
          <div class="program-item-meta">${prog.days.length} day${prog.days.length !== 1 ? 's' : ''} · ${totalExercises} exercises</div>
        </div>
      </div>
      <div class="program-item-actions">
        <button class="prog-btn" onclick="window.showProgramBuilder('${prog.id}')">Edit</button>
        <button class="prog-btn" onclick="window.duplicateProgram('${prog.id}')">Duplicate</button>
        <button class="prog-btn danger" onclick="window.deleteProgram('${prog.id}')">Delete</button>
        <button class="prog-btn activate" onclick="window.setActiveProgram('${prog.id}')">Activate</button>
      </div>
    </div>
  `;
}

export function showCreatePlanSheet() {
  const modal = document.getElementById('calendarDayModal');
  const body = document.getElementById('calendarDayBody');

  let html = `
    <div class="cday-header">
      <div class="cday-title">Create a Plan</div>
      <button class="cday-close" onclick="window.closeCalendarDay()">×</button>
    </div>
    <p style="font-size:13px;color:var(--text-dim);margin-bottom:14px;line-height:1.5;">Start from a template or build your own from scratch.</p>
  `;

  PROGRAM_TEMPLATES.forEach(t => {
    const totalEx = t.days.reduce((s, d) => s + d.exercises.length, 0);
    html += `
      <div class="manual-day-card" onclick="window.closeCalendarDay(); window.duplicateTemplate('${t.id}')">
        <div class="manual-day-name">${t.name}</div>
        <div class="manual-day-meta">${t.daysPerWeek} days · ${totalEx} exercises</div>
      </div>
    `;
  });

  html += `
    <div style="margin-top:12px;">
      <button class="add-exercise-fab" onclick="window.closeCalendarDay(); window.showProgramBuilder()">
        + Build from Scratch
      </button>
    </div>
  `;

  body.innerHTML = html;
  modal.classList.add('active');
}
