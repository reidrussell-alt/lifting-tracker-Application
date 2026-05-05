import { loadData, exportData, importData, confirmReset, openResetModal, closeResetModal } from './data.js';
import { showWelcomeScreen } from './welcome.js';
import { renderProgress, updateMuscleGroupExercise, toggleHistoryBlock, openEditModal, closeEditModal, saveEdit, deleteEditSession, navigateCalendar } from './progress.js';
import { startSession, startTrackAsYouGoWorkout, abandonSession, finishSession, confirmFinishSession, closeModal, updateBw, updateSessionDate, updateSet, toggleNote, toggleSetLogged, addSet, removeExercise, updateExerciseNote, showExercisePicker, closeExercisePicker, addExerciseToSession, filterExercisePicker } from './session.js';
import { renderPlan } from './plan.js';
import { renderSettings, editProfileName, switchTrainingMode, setActiveProgram, deleteProgram, duplicateProgram, showCreateProgram, closeCreateProgram, confirmCreateProgram } from './settings.js';
import { showOnboarding, hideOnboarding, obGoTo, obSelectMode, obSelectTemplate, obFinish, obProcessImport } from './onboarding.js';
import { state } from './data.js';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (tab === 'plan') {
    document.querySelectorAll('.tab')[0].classList.add('active');
    document.getElementById('planPage').classList.add('active');
    renderPlan();
  } else if (tab === 'progress') {
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('progressPage').classList.add('active');
    renderProgress();
  } else if (tab === 'settings') {
    document.querySelectorAll('.tab')[2].classList.add('active');
    document.getElementById('settingsPage').classList.add('active');
    renderSettings();
  }
}

// All window bindings — the only place inline onclick handlers can reach these functions
window.switchTab = switchTab;
window.renderPlan = renderPlan;

window.startSession = startSession;
window.startTrackAsYouGoWorkout = startTrackAsYouGoWorkout;
window.abandonSession = abandonSession;
window.finishSession = finishSession;
window.confirmFinishSession = confirmFinishSession;
window.closeModal = closeModal;
window.updateBw = updateBw;
window.updateSessionDate = updateSessionDate;
window.updateSet = updateSet;
window.toggleNote = toggleNote;
window.toggleSetLogged = toggleSetLogged;
window.addSet = addSet;
window.removeExercise = removeExercise;
window.updateExerciseNote = updateExerciseNote;
window.showExercisePicker = showExercisePicker;
window.closeExercisePicker = closeExercisePicker;
window.addExerciseToSession = addExerciseToSession;
window.filterExercisePicker = filterExercisePicker;

window.renderProgress = renderProgress;
window.updateMuscleGroupExercise = updateMuscleGroupExercise;
window.toggleHistoryBlock = toggleHistoryBlock;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.deleteEditSession = deleteEditSession;
window.navigateCalendar = navigateCalendar;

window.exportData = exportData;
window.importData = importData;
window.openResetModal = openResetModal;
window.closeResetModal = closeResetModal;
window.confirmReset = confirmReset;

window.renderSettings = renderSettings;
window.editProfileName = editProfileName;
window.switchTrainingMode = switchTrainingMode;
window.setActiveProgram = setActiveProgram;
window.deleteProgram = deleteProgram;
window.duplicateProgram = duplicateProgram;
window.showCreateProgram = showCreateProgram;
window.closeCreateProgram = closeCreateProgram;
window.confirmCreateProgram = confirmCreateProgram;

window.showOnboarding = showOnboarding;
window.hideOnboarding = hideOnboarding;
window.obGoTo = obGoTo;
window.obSelectMode = obSelectMode;
window.obSelectTemplate = obSelectTemplate;
window.obFinish = obFinish;
window.obProcessImport = obProcessImport;

window.showWelcomeScreen = showWelcomeScreen;

// Register service worker (skipped on localhost)
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

loadData();

if (!state.profile) {
  showOnboarding();
} else {
  renderPlan();
  showWelcomeScreen();
}

window.addEventListener('resize', () => {
  if (document.getElementById('progressPage').classList.contains('active')) {
    renderProgress();
  }
});
