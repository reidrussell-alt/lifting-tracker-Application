import { loadData, exportData, importData, confirmReset, openResetModal, closeResetModal } from './data.js';
import { showWelcomeScreen } from './welcome.js';
import { renderProgress, updateMuscleGroupExercise, setChartRange, toggleHistoryBlock, openEditModal, closeEditModal, saveEdit, deleteEditSession, navigateCalendar, openCalendarDay, closeCalendarDay, openManualWorkoutSelect, openSessionEdit, closeSessionEdit, saveSessionEdit, deleteSession } from './progress.js';
import { startSession, startTrackAsYouGoWorkout, abandonSession, finishSession, confirmFinishSession, closeModal, updateBw, updateSessionDate, updateSet, toggleNote, toggleSetLogged, addSet, removeExercise, updateExerciseNote, showExercisePicker, closeExercisePicker, addExerciseToSession, filterExercisePicker, renderSession, leaveSession, toggleReorderMode, startManualEntry } from './session.js';
import { updateSessionBanner, hideSessionBanner, resumeSession } from './sessionBanner.js';
import { renderPlan } from './plan.js';
import { renderSettings, editProfileName, switchTrainingMode, setActiveProgram, deleteProgram, duplicateProgram, activateTemplate, duplicateTemplate, editProgram, showCreateProgram, closeCreateProgram, confirmCreateProgram, toggleRestTimer, onRestDurationChange, toggleRestAlert } from './settings.js';
import { initRestTimer, pauseTimer, skipTimer, resetTimer, toggleTimerExpanded, updatePillVisibility } from './restTimer.js';
import { showOnboarding, hideOnboarding, obGoTo, obSelectMode, obSelectTemplate, obFinish, obProcessImport } from './onboarding.js';
import { openExerciseSelector, closeExerciseSelector, exSelFilterMuscle, exSelSearch, exSelPickExercise, exSelShowCreate, exSelCancelCreate, exSelConfirmCreate } from './exerciseSelector.js';
import { showProgramBuilder, closeProgramBuilder, pbUpdateName, pbSelectDayCount, pbToggleDay, pbSetDayName, pbAddExercise, pbEditExercise, pbRemoveExercise, pbSetRepType, pbSaveProgram, pbConfirmSetsReps, pbCancelSetsReps, pbIncrSets, pbDecrSets, pbIncrRepMin, pbDecrRepMin, pbIncrRepMax, pbDecrRepMax, pbIncrFixed, pbDecrFixed } from './programBuilder.js';
import { state } from './data.js';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  if (tab === 'session') {
    // No tab button highlights for the session page
    document.getElementById('sessionPage').classList.add('active');
    hideSessionBanner();
    renderSession();
    updatePillVisibility();
    return;
  }

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

  // Show or hide the active workout banner on all non-session tabs
  updateSessionBanner();
  updatePillVisibility();
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
window.setChartRange = setChartRange;
window.toggleHistoryBlock = toggleHistoryBlock;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.deleteEditSession = deleteEditSession;
window.navigateCalendar = navigateCalendar;
window.openCalendarDay = openCalendarDay;
window.closeCalendarDay = closeCalendarDay;
window.openManualWorkoutSelect = openManualWorkoutSelect;
window.openSessionEdit = openSessionEdit;
window.closeSessionEdit = closeSessionEdit;
window.saveSessionEdit = saveSessionEdit;
window.deleteSession = deleteSession;

window.exportData = exportData;
window.importData = (event) => importData(event, () => renderPlan());
window.openResetModal = openResetModal;
window.closeResetModal = closeResetModal;
window.confirmReset = () => { confirmReset(); switchTab('plan'); };

window.renderSettings = renderSettings;
window.editProfileName = editProfileName;
window.switchTrainingMode = switchTrainingMode;
window.setActiveProgram = setActiveProgram;
window.deleteProgram = deleteProgram;
window.duplicateProgram = duplicateProgram;
window.activateTemplate = activateTemplate;
window.duplicateTemplate = duplicateTemplate;
window.editProgram = editProgram;
window.showCreateProgram = showCreateProgram;
window.closeCreateProgram = closeCreateProgram;
window.confirmCreateProgram = confirmCreateProgram;

window.openExerciseSelector = openExerciseSelector;
window.closeExerciseSelector = closeExerciseSelector;
window.exSelFilterMuscle = exSelFilterMuscle;
window.exSelSearch = exSelSearch;
window.exSelPickExercise = exSelPickExercise;
window.exSelShowCreate = exSelShowCreate;
window.exSelCancelCreate = exSelCancelCreate;
window.exSelConfirmCreate = exSelConfirmCreate;

window.showProgramBuilder = showProgramBuilder;
window.closeProgramBuilder = closeProgramBuilder;
window.pbUpdateName = pbUpdateName;
window.pbSelectDayCount = pbSelectDayCount;
window.pbToggleDay = pbToggleDay;
window.pbSetDayName = pbSetDayName;
window.pbAddExercise = pbAddExercise;
window.pbEditExercise = pbEditExercise;
window.pbRemoveExercise = pbRemoveExercise;
window.pbSetRepType = pbSetRepType;
window.pbSaveProgram = pbSaveProgram;
window.pbConfirmSetsReps = pbConfirmSetsReps;
window.pbCancelSetsReps = pbCancelSetsReps;
window.pbIncrSets = pbIncrSets;
window.pbDecrSets = pbDecrSets;
window.pbIncrRepMin = pbIncrRepMin;
window.pbDecrRepMin = pbDecrRepMin;
window.pbIncrRepMax = pbIncrRepMax;
window.pbDecrRepMax = pbDecrRepMax;
window.pbIncrFixed = pbIncrFixed;
window.pbDecrFixed = pbDecrFixed;

window.toggleRestTimer = toggleRestTimer;
window.onRestDurationChange = onRestDurationChange;
window.toggleRestAlert = toggleRestAlert;
window.pauseTimer = pauseTimer;
window.skipTimer = skipTimer;
window.resetTimer = resetTimer;
window.toggleTimerExpanded = toggleTimerExpanded;

window.showOnboarding = showOnboarding;
window.hideOnboarding = hideOnboarding;
window.obGoTo = obGoTo;
window.obSelectMode = obSelectMode;
window.obSelectTemplate = obSelectTemplate;
window.obFinish = obFinish;
window.obProcessImport = obProcessImport;

window.showWelcomeScreen = showWelcomeScreen;

window.resumeSession = resumeSession;
window.leaveSession = leaveSession;
window.toggleReorderMode = toggleReorderMode;
window.startManualEntry = startManualEntry;

// Register service worker (skipped on localhost)
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

loadData();
initRestTimer();

if (state.currentSession) {
  // Go directly to session page — banner not shown while on session screen
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('sessionPage').classList.add('active');
  renderSession();
} else if (!state.profile) {
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
