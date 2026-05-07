import { state, saveData, openResetModal } from './data.js';
import { PROGRAM_TEMPLATES, buildProgramFromTemplate } from './programTemplates.js';
import { showToast, showConfirm } from './utils.js';
import { getTimerSettings, setTimerEnabled, setTimerDuration, setTimerAlertEnabled, formatRestDuration } from './restTimer.js';

const MAX_CUSTOM_PROGRAMS = 5;

export function renderSettings() {
  const el = document.getElementById('settingsPage');
  if (!el) return;

  const profile = state.profile || { name: '—', trainingMode: 'structured' };
  const isStructured = profile.trainingMode === 'structured';

  let html = `
    <div class="settings-section">
      <div class="settings-section-title">Profile</div>
      <div class="settings-row">
        <span class="settings-row-label">Name</span>
        <div class="settings-row-right">
          <span class="settings-row-value" id="profileNameDisplay">${profile.name}</span>
          <button class="settings-edit-btn" onclick="editProfileName()">Edit</button>
        </div>
      </div>
      <div class="settings-row">
        <span class="settings-row-label">Mode</span>
        <div class="settings-row-right">
          <span class="settings-row-value">${isStructured ? 'Structured Plan' : 'Track As You Go'}</span>
          <button class="settings-edit-btn" onclick="switchTrainingMode()">${isStructured ? 'Switch' : 'Switch'}</button>
        </div>
      </div>
    </div>
  `;

  if (isStructured) {
    html += `
      <div class="settings-section">
        <div class="settings-section-title">Programs</div>
        <div id="programsList">${renderProgramsListHtml()}</div>
      </div>
    `;
  }

  const timer = getTimerSettings();
  html += `
    <div class="settings-section">
      <div class="settings-section-title">Workout Settings</div>
      <div class="settings-row">
        <span class="settings-row-label">Rest Timer</span>
        <label class="settings-toggle">
          <input type="checkbox" ${timer.enabled ? 'checked' : ''}
                 onchange="window.toggleRestTimer(this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div id="restTimerOptions" style="display:${timer.enabled ? '' : 'none'}">
        <div class="settings-row">
          <span class="settings-row-label">Rest Duration</span>
          <div class="timer-duration-wrap">
            <input type="range" class="timer-duration-slider"
                   min="30" max="600" step="15" value="${timer.duration}"
                   oninput="window.onRestDurationChange(this.value)">
            <span class="timer-duration-display" id="restDurationDisplay">${formatRestDuration(timer.duration)}</span>
          </div>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Vibrate when ready</span>
          <label class="settings-toggle">
            <input type="checkbox" ${timer.alertEnabled ? 'checked' : ''}
                   onchange="window.toggleRestAlert(this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;

  html += `
    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <div class="data-buttons">
        <button class="data-btn" onclick="exportData()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
        <button class="data-btn" onclick="document.getElementById('importInput').click()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import
        </button>
      </div>
      <input type="file" id="importInput" class="file-input-hidden" accept=".json,application/json" onchange="importData(event)">
      <div class="data-helper">Export saves your full history as a backup file. Import restores from a backup.</div>
    </div>
    <div class="reset-section">
      <button class="reset-link" onclick="openResetModal()">↻ Reset All Data</button>
    </div>
  `;

  el.innerHTML = html;
}

function getTotalExercises(prog) {
  return prog.days.reduce((sum, d) => sum + (d.exercises?.length || 0), 0);
}

function renderProgramCard(prog, isActive) {
  const isCustom = prog.isCustom === true;
  const totalExercises = getTotalExercises(prog);

  const customLabel = isCustom
    ? `<span class="prog-custom-label">(Custom)</span>`
    : '';
  const activeBadge = isActive
    ? `<span class="program-active-badge">ACTIVE</span>`
    : '';

  let actions = '';
  actions += `<button class="prog-btn" onclick="showProgramBuilder('${prog.id}')">Edit</button>`;
  actions += `<button class="prog-btn" onclick="duplicateProgram('${prog.id}')">Duplicate</button>`;
  if (!isActive && isCustom) {
    actions += `<button class="prog-btn danger" onclick="deleteProgram('${prog.id}')">Delete</button>`;
  }
  if (!isActive) {
    actions += `<button class="prog-btn activate" onclick="setActiveProgram('${prog.id}')">Activate</button>`;
  }

  return `
    <div class="program-item${isActive ? ' active' : ''}">
      <div class="program-item-top">
        <div style="flex:1;min-width:0;">
          <div class="program-item-name">${prog.name} ${customLabel}</div>
          <div class="program-item-meta">${prog.days.length} workout day${prog.days.length !== 1 ? 's' : ''} · ${totalExercises} exercises</div>
        </div>
        ${activeBadge}
      </div>
      <div class="program-item-actions">${actions}</div>
    </div>
  `;
}

function renderTemplateCard(template) {
  const totalExercises = template.days.reduce((sum, d) => sum + d.exercises.length, 0);
  return `
    <div class="program-item">
      <div class="program-item-top">
        <div style="flex:1;min-width:0;">
          <div class="program-item-name">${template.name}</div>
          <div class="program-item-meta">${template.daysPerWeek} workout days · ${totalExercises} exercises</div>
        </div>
      </div>
      <div class="program-item-actions">
        <button class="prog-btn" onclick="duplicateTemplate('${template.id}')">Duplicate</button>
        <button class="prog-btn activate" onclick="activateTemplate('${template.id}')">Activate</button>
      </div>
    </div>
  `;
}

function renderProgramsListHtml() {
  const activeProgram = state.programs.find(p => p.isActive);
  const customPrograms = state.programs.filter(p => p.isCustom === true && !p.isActive);
  const customCount = state.programs.filter(p => p.isCustom === true).length;

  let html = '';

  // Section 1: Active Program
  html += `<div class="programs-section-label">Active Program</div>`;
  if (activeProgram) {
    html += renderProgramCard(activeProgram, true);
  } else {
    html += `<p class="settings-empty-msg">No active program. Activate one below.</p>`;
  }

  // Section 2: Custom Programs
  html += `<div class="programs-section-label">Your Custom Programs (${customCount}/${MAX_CUSTOM_PROGRAMS})</div>`;
  if (customPrograms.length === 0) {
    const msg = customCount === 0
      ? 'No custom programs yet. Create one below.'
      : 'Your custom program is currently active above.';
    html += `<p class="settings-empty-msg">${msg}</p>`;
  } else {
    html += customPrograms.map(p => renderProgramCard(p, false)).join('');
  }

  // Section 3: Templates
  html += `<div class="programs-section-label">Templates</div>`;
  html += PROGRAM_TEMPLATES.map(t => renderTemplateCard(t)).join('');

  // Create button or limit message
  if (customCount < MAX_CUSTOM_PROGRAMS) {
    html += `<button class="finish-btn" style="margin-top:12px;" onclick="showProgramBuilder()">+ Create New Program</button>`;
  } else {
    html += `<p class="settings-empty-msg" style="text-align:center;margin-top:12px;">Maximum ${MAX_CUSTOM_PROGRAMS} custom programs reached. Delete one to create new.</p>`;
  }

  return html;
}

export function editProfileName() {
  const name = prompt('Enter your name:', state.profile?.name || '');
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) { showToast('Name cannot be empty'); return; }
  if (!state.profile) state.profile = { trainingMode: 'structured', createdAt: new Date().toISOString() };
  state.profile.name = trimmed;
  saveData();
  renderSettings();
  showToast('Name updated ✓', 'success');
}

export function switchTrainingMode() {
  const current = state.profile?.trainingMode || 'structured';
  const next = current === 'structured' ? 'trackAsYouGo' : 'structured';
  const label = next === 'structured' ? 'Structured Plan' : 'Track As You Go';
  showConfirm(`Switch to "${label}" mode?`, () => {
    state.profile.trainingMode = next;
    saveData();
    renderSettings();
    window.renderPlan();
    showToast(`Switched to ${label}`, 'success');
  }, 'Switch');
}

export function setActiveProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  const current = state.programs.find(p => p.isActive);
  const currentName = current ? current.name : '';
  const msg = currentName
    ? `Switch to "${prog.name}"?\n\nThis will replace "${currentName}" on the Plan tab.\n\nYour workout history will be preserved.`
    : `Activate "${prog.name}"?`;
  showConfirm(msg, () => {
    state.programs.forEach(p => { p.isActive = false; });
    prog.isActive = true;
    saveData();
    refreshProgramsList();
    window.renderPlan();
    showToast(`Activated: ${prog.name}`, 'success');
  }, 'Activate');
}

export function deleteProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  if (prog.isActive) {
    showToast('Cannot delete active program. Switch to another first.');
    return;
  }
  showConfirm(
    `Delete "${prog.name}"?\n\nThis will permanently delete the program and all its workout days.\n\nYour workout history will NOT be deleted.\n\nThis cannot be undone.`,
    () => {
      state.programs = state.programs.filter(p => p.id !== programId);
      saveData();
      refreshProgramsList();
      window.renderPlan();
      showToast(`Deleted: ${prog.name}`);
    },
    'Delete'
  );
}

export function duplicateProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;

  const customCount = state.programs.filter(p => p.isCustom === true).length;
  if (customCount >= MAX_CUSTOM_PROGRAMS) {
    showToast(`Max ${MAX_CUSTOM_PROGRAMS} custom programs. Delete one first.`);
    return;
  }

  const copyName = `${prog.name} (Copy)`;
  showConfirm(
    `Create a copy of "${prog.name}"?\n\nThe copy will be saved as "${copyName}".\n\nYou can rename it after creation.`,
    () => {
      const copy = JSON.parse(JSON.stringify(prog));
      copy.id = `program_${Date.now()}`;
      copy.name = copyName;
      copy.isActive = false;
      copy.isCustom = true;
      copy.templateId = null;
      copy.createdAt = new Date().toISOString();
      state.programs.push(copy);
      saveData();
      refreshProgramsList();
      showToast(`Duplicated: ${copyName}`, 'success');
    },
    'Duplicate'
  );
}

export function activateTemplate(templateId) {
  const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  const current = state.programs.find(p => p.isActive);
  const currentName = current ? current.name : '';
  const msg = currentName
    ? `Switch to "${template.name}"?\n\nThis will replace "${currentName}" on the Plan tab.\n\nYour workout history will be preserved.`
    : `Activate "${template.name}"?`;

  showConfirm(msg, () => {
    // Reuse existing non-custom program from this template if one exists
    const existing = state.programs.find(p => p.templateId === templateId && !p.isCustom);
    state.programs.forEach(p => { p.isActive = false; });
    if (existing) {
      existing.isActive = true;
    } else {
      const newProg = buildProgramFromTemplate(template.name, template, true, false);
      state.programs.push(newProg);
    }
    saveData();
    refreshProgramsList();
    window.renderPlan();
    showToast(`Activated: ${template.name}`, 'success');
  }, 'Activate');
}

export function duplicateTemplate(templateId) {
  const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  const customCount = state.programs.filter(p => p.isCustom === true).length;
  if (customCount >= MAX_CUSTOM_PROGRAMS) {
    showToast(`Max ${MAX_CUSTOM_PROGRAMS} custom programs. Delete one first.`);
    return;
  }

  const copyName = `${template.name} (Copy)`;
  showConfirm(
    `Create a copy of "${template.name}"?\n\nThe copy will be saved as "${copyName}" and added to your custom programs.`,
    () => {
      const copy = buildProgramFromTemplate(copyName, template, false, true);
      state.programs.push(copy);
      saveData();
      refreshProgramsList();
      showToast(`Duplicated: ${copyName}`, 'success');
    },
    'Duplicate'
  );
}

export function editProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  const name = prompt('Rename program:', prog.name);
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) { showToast('Name cannot be empty'); return; }
  prog.name = trimmed;
  saveData();
  refreshProgramsList();
  window.renderPlan();
  showToast('Program renamed ✓', 'success');
}

export function showCreateProgram() {
  const customCount = state.programs.filter(p => p.isCustom === true).length;
  if (customCount >= MAX_CUSTOM_PROGRAMS) {
    showToast(`Max ${MAX_CUSTOM_PROGRAMS} custom programs. Delete one first.`);
    return;
  }

  const templateOptions = PROGRAM_TEMPLATES.map(t =>
    `<option value="${t.id}">${t.name} (${t.daysPerWeek}×/week)</option>`
  ).join('');

  const html = `
    <div class="modal-bg active" id="createProgramModal" onclick="closeCreateProgram()">
      <div class="modal" style="max-width:440px;text-align:left;max-height:85vh;overflow-y:auto;" onclick="event.stopPropagation()">
        <div class="modal-title" style="text-align:left;margin-bottom:16px;">Create Program</div>
        <div style="margin-bottom:12px;">
          <div class="settings-row-label" style="margin-bottom:6px;">Program Name</div>
          <input type="text" id="newProgName" class="ob-input" placeholder="My Program" style="width:100%;">
        </div>
        <div style="margin-bottom:16px;">
          <div class="settings-row-label" style="margin-bottom:6px;">Start from Template</div>
          <select id="newProgTemplate" class="chart-select" style="margin-bottom:0;">
            ${templateOptions}
          </select>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeCreateProgram()">Cancel</button>
          <button class="modal-btn primary" onclick="confirmCreateProgram()">Create</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

export function closeCreateProgram() {
  document.getElementById('createProgramModal')?.remove();
}

export function confirmCreateProgram() {
  const nameInput = document.getElementById('newProgName');
  const templateSelect = document.getElementById('newProgTemplate');
  const name = nameInput?.value.trim();
  if (!name) { showToast('Please enter a program name'); return; }

  const templateId = templateSelect?.value;
  const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
  if (!template) { showToast('Please select a template'); return; }

  const hasActive = state.programs.some(p => p.isActive);
  const newProg = buildProgramFromTemplate(name, template, !hasActive, true);

  state.programs.push(newProg);
  saveData();
  closeCreateProgram();
  refreshProgramsList();
  window.renderPlan();
  showToast(`Created: ${name}`, 'success');
}

function refreshProgramsList() {
  const el = document.getElementById('programsList');
  if (el) el.innerHTML = renderProgramsListHtml();
}

export function toggleRestTimer(enabled) {
  setTimerEnabled(enabled);
  const opts = document.getElementById('restTimerOptions');
  if (opts) opts.style.display = enabled ? '' : 'none';
}

export function onRestDurationChange(val) {
  const seconds = parseInt(val, 10);
  setTimerDuration(seconds);
  const display = document.getElementById('restDurationDisplay');
  if (display) display.textContent = formatRestDuration(seconds);
}

export function toggleRestAlert(enabled) {
  setTimerAlertEnabled(enabled);
}
