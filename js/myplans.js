import { state } from './data.js';
import { PROGRAM_TEMPLATES } from './programTemplates.js';

export const MAX_CUSTOM_PROGRAMS = 5;

export function renderMyPlans() {
  const el = document.getElementById('myPlansPage');
  if (!el) return;
  if (!state.profile) { el.innerHTML = ''; return; }

  const programs = state.programs || [];
  const activeProgram = programs.find(p => p.isActive);
  const libraryPrograms = programs.filter(p => !p.isActive);

  el.innerHTML = `
    ${buildHeader()}
    ${state.profile.trainingMode === 'trackAsYouGo'
      ? buildTAYGSection()
      : activeProgram
        ? buildActiveSection(activeProgram)
        : buildNoProgramSection()
    }
    ${buildLibrarySection(libraryPrograms)}
  `;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function buildHeader() {
  return `
    <div class="myplans-header">
      <div class="myplans-title">My Plans</div>
      <button class="myplans-add-btn" onclick="window.showCreatePlanSheet()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  `;
}

// ─── Active Program Section ───────────────────────────────────────────────────

function buildActiveSection(program) {
  const dayCards = program.days.map((d, i) => buildDayCard(d, i, program.id)).join('');

  return `
    <div class="myplans-section-label myplans-section-label--active">
      <span class="myplans-active-dot"></span>
      Active Program
    </div>
    <div class="myplans-program-identity">
      <div class="myplans-program-name">${program.name}</div>
      <div class="myplans-program-subtitle">${program.days.length} workout${program.days.length !== 1 ? 's' : ''} · rotate freely</div>
    </div>
    ${dayCards}
  `;
}

function buildDayCard(day, idx, programId) {
  const exCount = day.exercises.length;
  const setCount = day.exercises.reduce((s, e) => s + (e.sets || 0), 0);
  const preview = buildExercisePreview(day.exercises);

  return `
    <div class="myplans-day-card">
      <div class="myplans-day-badge">${idx + 1}</div>
      <div class="myplans-day-content">
        <div class="myplans-day-row">
          <span class="myplans-day-name">${day.name}</span>
          <span class="myplans-day-meta">${exCount} ex · ${setCount} sets</span>
        </div>
        <div class="myplans-day-preview">${preview}</div>
      </div>
      <button class="myplans-day-chevron" onclick="window.showProgramBuilder('${programId}', '${day.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  `;
}

function buildExercisePreview(exercises) {
  if (!exercises || exercises.length === 0) return 'No exercises yet';
  const names = exercises.map(e => e.name);
  const shown = names.slice(0, 3).join(' · ');
  const remaining = names.length - 3;
  return remaining > 0 ? `${shown} · +${remaining}` : shown;
}

// ─── No-Program / TAYG Sections ───────────────────────────────────────────────

function buildNoProgramSection() {
  return `
    <div class="myplans-section-label myplans-section-label--active">
      <span class="myplans-active-dot"></span>
      Active Program
    </div>
    <div class="myplans-no-program">No active program — set one from your library or create a new plan.</div>
  `;
}

function buildTAYGSection() {
  const count = (state.history || []).length;
  return `
    <div class="myplans-section-label myplans-section-label--active">
      <span class="myplans-active-dot"></span>
      Active Program
    </div>
    <div class="myplans-no-program">You're in Track As You Go mode — ${count} session${count !== 1 ? 's' : ''} logged. Switch to Structured in <button class="myplans-inline-link" onclick="window.switchTab('profile')">Profile</button> to use a program.</div>
  `;
}

// ─── Library Section ──────────────────────────────────────────────────────────

function buildLibrarySection(libraryPrograms) {
  const customCount = (state.programs || []).filter(p => p.isCustom).length;
  const atLimit = customCount >= MAX_CUSTOM_PROGRAMS;

  const libraryCards = libraryPrograms.length === 0
    ? `<div class="myplans-empty-library">No other plans saved yet</div>`
    : libraryPrograms.map(buildLibraryCard).join('');

  const createCta = atLimit
    ? `<div class="myplans-at-limit">Max ${MAX_CUSTOM_PROGRAMS} custom plans reached — delete one to create another.</div>`
    : `<button class="myplans-create-cta" onclick="window.showCreatePlanSheet()">
        + Create a New Plan
      </button>`;

  return `
    <div class="myplans-section-label">Your Library</div>
    ${libraryCards}
    ${createCta}
  `;
}

function buildLibraryCard(prog) {
  const id = prog.id;
  return `
    <div class="myplans-library-card" id="libcard-${id}">
      <div class="myplans-library-main">
        <div class="myplans-library-info">
          <div class="myplans-library-name">${prog.name}</div>
          <div class="myplans-library-subtitle">${prog.days.length} workout${prog.days.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="myplans-library-btns">
          <button class="myplans-set-active-btn" onclick="window.setActiveProgram('${id}')">Set Active</button>
          <button class="myplans-more-btn" onclick="window.myPlansToggleActions('${id}')" aria-label="More options">···</button>
        </div>
      </div>
      <div class="myplans-library-secondary">
        <button class="myplans-sec-btn" onclick="window.duplicateProgram('${id}')">Duplicate</button>
        <button class="myplans-sec-btn myplans-sec-btn--danger" onclick="window.deleteProgram('${id}')">Delete</button>
      </div>
    </div>
  `;
}

export function myPlansToggleActions(programId) {
  document.getElementById(`libcard-${programId}`)?.classList.toggle('myplans-library-card--open');
}

// ─── Create Plan Sheet ────────────────────────────────────────────────────────

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
