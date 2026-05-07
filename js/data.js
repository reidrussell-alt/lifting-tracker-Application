import { showToast, showConfirm } from './utils.js';
import { program, MUSCLE_GROUPS } from './program.js';

export const state = {
  profile: null,
  programs: [],
  history: [],
  currentSession: null,
  chartExerciseByGroup: {},
  editing: null,
  customExercises: []
};

const STORAGE_KEY = 'liftTrackerData';
const SESSION_KEY = 'liftTrackerSession';
const SCHEMA_VERSION = 4;

export function saveCurrentSession() {
  try {
    if (state.currentSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentSession));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {}
}

export function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      profile: state.profile,
      programs: state.programs,
      history: state.history,
      customExercises: state.customExercises
    }));
  } catch (e) {
    console.warn('Save failed', e);
    showToast('Could not save — storage may be full');
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
    name: oldData.profile?.name || '',
    createdAt: new Date().toISOString(),
    trainingMode: 'structured'
  };

  const updatedHistory = (oldData.history || []).map(session => ({
    ...session,
    programId: 'program_default',
    programName: "Reid's 4-Day Push/Pull/Legs",
    exercises: (session.exercises || []).map(ex => ({
      ...ex,
      sets: (ex.sets || []).map(set => ({ note: '', ...set }))
    }))
  }));

  return {
    version: 3,
    profile,
    programs: [defaultProgram],
    history: updatedHistory
  };
}

function migrateV3ToV4(data) {
  const remap = { leg_ext_a: 'leg_extension', leg_ext_b: 'leg_extension' };
  const remapId = id => remap[id] ?? id;

  return {
    ...data,
    version: 4,
    programs: (data.programs || []).map(prog => ({
      ...prog,
      days: (prog.days || []).map(day => ({
        ...day,
        exercises: (day.exercises || []).map(ex => ({ ...ex, id: remapId(ex.id) }))
      }))
    })),
    history: (data.history || []).map(session => ({
      ...session,
      exercises: (session.exercises || []).map(ex => ({ ...ex, id: remapId(ex.id) }))
    }))
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let data = JSON.parse(raw);

    if (!data.version || data.version < 3) {
      data = migrateV2ToV3(data);
    }
    if (data.version < 4) {
      data = migrateV3ToV4(data);
    }
    if (!data.version || data.version < SCHEMA_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    if (data.profile) state.profile = data.profile;
    if (data.programs) state.programs = data.programs;
    if (data.history) state.history = data.history;
    if (data.customExercises) state.customExercises = data.customExercises;
  } catch (e) {
    console.warn('Load failed', e);
  }

  try {
    const sessRaw = localStorage.getItem(SESSION_KEY);
    if (sessRaw) state.currentSession = JSON.parse(sessRaw);
  } catch (e) {}
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

export function importData(event, onSuccess) {
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
      showConfirm(confirmMsg, () => {
        state.history = data.history;
        if (data.profile) state.profile = data.profile;
        if (data.programs) state.programs = data.programs;
        saveData();
        showToast(`Imported ${incomingCount} sessions ✓`, 'success');
        onSuccess?.();
      }, 'Import');
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
}
