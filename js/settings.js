import { state, saveData, openResetModal } from './data.js';
import { PROGRAM_TEMPLATES } from './programTemplates.js';
import { showToast } from './utils.js';

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
        <button class="finish-btn" style="margin-top:12px;" onclick="showCreateProgram()">+ Create New Program</button>
      </div>
    `;
  }

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

function renderProgramsListHtml() {
  if (state.programs.length === 0) {
    return '<p class="settings-empty-msg">No programs yet. Create your first one!</p>';
  }
  return state.programs.map(prog => `
    <div class="program-item${prog.isActive ? ' active' : ''}">
      <div class="program-item-top">
        <div>
          <div class="program-item-name">${prog.name}</div>
          <div class="program-item-meta">${prog.days.length} day${prog.days.length !== 1 ? 's' : ''}</div>
        </div>
        ${prog.isActive ? '<span class="program-active-badge">Active</span>' : ''}
      </div>
      <div class="program-item-actions">
        ${!prog.isActive ? `<button class="prog-btn accent" onclick="setActiveProgram('${prog.id}')">Set Active</button>` : ''}
        <button class="prog-btn" onclick="duplicateProgram('${prog.id}')">Duplicate</button>
        <button class="prog-btn danger" onclick="deleteProgram('${prog.id}')">Delete</button>
      </div>
    </div>
  `).join('');
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
  if (!confirm(`Switch to "${label}" mode?`)) return;
  state.profile.trainingMode = next;
  saveData();
  renderSettings();
  window.renderPlan();
  showToast(`Switched to ${label}`, 'success');
}

export function setActiveProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  if (!confirm(`Switch active program to "${prog.name}"?\nYour workout history will remain intact.`)) return;
  state.programs.forEach(p => { p.isActive = false; });
  prog.isActive = true;
  saveData();
  refreshProgramsList();
  window.renderPlan();
  showToast(`Switched to "${prog.name}"`, 'success');
}

export function deleteProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  if (prog.isActive && state.programs.length > 1) {
    showToast('Set another program as active first');
    return;
  }
  if (!confirm(`Delete "${prog.name}"? This cannot be undone.`)) return;
  state.programs = state.programs.filter(p => p.id !== programId);
  saveData();
  refreshProgramsList();
  window.renderPlan();
  showToast(`Deleted "${prog.name}"`);
}

export function duplicateProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  const copy = JSON.parse(JSON.stringify(prog));
  copy.id = `program_${Date.now()}`;
  copy.name = `${prog.name} (Copy)`;
  copy.isActive = false;
  copy.createdAt = new Date().toISOString();
  state.programs.push(copy);
  saveData();
  refreshProgramsList();
  showToast(`Duplicated "${prog.name}"`, 'success');
}

export function showCreateProgram() {
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
  const newProg = {
    id: `program_${Date.now()}`,
    name,
    isActive: !hasActive,
    createdAt: new Date().toISOString(),
    days: template.days.map(day => ({
      id: day.id,
      name: day.name,
      exercises: day.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        loadType: ex.loadType,
        muscleGroup: ex.muscleGroup
      }))
    }))
  };

  state.programs.push(newProg);
  saveData();
  closeCreateProgram();
  refreshProgramsList();
  window.renderPlan();
  showToast(`Created "${name}"`, 'success');
}

function refreshProgramsList() {
  const el = document.getElementById('programsList');
  if (el) el.innerHTML = renderProgramsListHtml();
}
