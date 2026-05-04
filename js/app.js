import { loadData, exportData, importData, confirmReset, openResetModal, closeResetModal } from './data.js';
import { renderProgress, updateMuscleGroupExercise, toggleHistoryBlock, openEditModal, closeEditModal, saveEdit, deleteEditSession, navigateCalendar } from './progress.js';
import { startSession, renderSession, abandonSession, finishSession, confirmFinishSession, closeModal, updateBw, updateSessionDate, updateSet, toggleNote, toggleSetLogged, addSet, updateExerciseNote } from './session.js';
import { renderPlan } from './plan.js';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (tab === 'plan') {
    document.querySelectorAll('.tab')[0].classList.add('active');
    document.getElementById('planPage').classList.add('active');
    renderPlan();
  } else {
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('progressPage').classList.add('active');
    renderProgress();
  }
}

// Bind all functions called by inline onclick handlers to window.
// These are set once here so every module stays free of window references except
// session.js/data.js which call window.switchTab and window.renderPlan at runtime.
window.switchTab = switchTab;
window.renderPlan = renderPlan;

window.startSession = startSession;
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
window.updateExerciseNote = updateExerciseNote;

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

// Register service worker for offline/PWA support (skipped on localhost)
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

loadData();
renderPlan();

window.addEventListener('resize', () => {
  if (document.getElementById('progressPage').classList.contains('active')) {
    renderProgress();
  }
});
