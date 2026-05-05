import { showToast } from './utils.js';
import { program, MUSCLE_GROUPS } from './program.js';

export const state = {
  profile: null,
  programs: [],
  history: [],
  currentSession: null,
  chartExerciseByGroup: {},
  editing: null
};

const STORAGE_KEY = 'liftTrackerData';
const SCHEMA_VERSION = 3;

export function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      profile: state.profile,
      programs: state.programs,
      history: state.history
    }));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function migrateV2ToV3(oldData) {
  const defaultProgram = {
    id: 'program_default',
    name: "Reid's 4-Day Push/Pull/Legs",
    isActive: true,
    createdAt: new Date().toISOString(),
    days: program.days.map(d => ({
      id: d.id,
      name: d.title,
      type: d.type,
      exercises: d.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        loadType: ex.loadType,
        muscleGroup: MUSCLE_GROUPS[ex.id] || 'other'
      }))
    }))
  };

  const profile = {
    name: 'Reid',
    createdAt: new Date().toISOString(),
    trainingMode: 'structured'
  };

  const updatedHistory = (oldData.history || []).map(session => ({
    ...session,
    programId: 'program_default',
    programName: "Reid's 4-Day Push/Pull/Legs"
  }));

  return {
    version: 3,
    profile,
    programs: [defaultProgram],
    history: updatedHistory
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let data = JSON.parse(raw);

    if (!data.version || data.version < 3) {
      data = migrateV2ToV3(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    if (data.profile) state.profile = data.profile;
    if (data.programs) state.programs = data.programs;
    if (data.history) {
      state.history = data.history;
      state.history.forEach(s => {
        if (s.exercises) {
          s.exercises.forEach(ex => {
            if (ex.sets) {
              ex.sets.forEach(set => {
                if (set.note === undefined) set.note = '';
              });
            }
          });
        }
      });
    }
  } catch (e) {
    console.warn('Load failed', e);
  }
}

export function exportData() {
  if (state.history.length === 0) { showToast('No data to export yet'); return; }
  const exportObj = {
    app: 'lift-tracker',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    programs: state.programs,
    history: state.history
  };
  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `lift-tracker-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${state.history.length} sessions ✓`, 'success');
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let data = JSON.parse(e.target.result);
      if (!data.history || !Array.isArray(data.history)) {
        showToast('Invalid backup file');
        return;
      }
      if (!data.version || data.version < 3) {
        data = migrateV2ToV3(data);
      }
      const incomingCount = data.history.length;
      const currentCount = state.history.length;
      const confirmMsg = currentCount === 0
        ? `Import ${incomingCount} sessions?`
        : `You have ${currentCount} sessions. Replace with ${incomingCount} imported sessions?`;
      if (confirm(confirmMsg)) {
        state.history = data.history;
        if (data.profile) state.profile = data.profile;
        if (data.programs) state.programs = data.programs;
        saveData();
        showToast(`Imported ${incomingCount} sessions ✓`, 'success');
        window.renderPlan();
      }
    } catch (err) {
      showToast('Could not read backup file');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

export function openResetModal() {
  document.getElementById('resetModal').classList.add('active');
}

export function closeResetModal() {
  document.getElementById('resetModal').classList.remove('active');
}

export function confirmReset() {
  state.history = [];
  state.currentSession = null;
  saveData();
  closeResetModal();
  showToast('All data cleared');
  window.switchTab('plan');
}
