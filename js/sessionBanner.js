import { state } from './data.js';

let _bannerInterval = null;

function _tickElapsed() {
  const sess = state.currentSession;
  const el = document.getElementById('awbElapsed');
  if (!sess || !el) return;

  const startMs = new Date(sess.startedAt).getTime();
  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(elapsedSec / 3600);
  const m = Math.floor((elapsedSec % 3600) / 60);
  const s = elapsedSec % 60;

  el.textContent = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export function showSessionBanner() {
  const banner = document.getElementById('activeWorkoutBanner');
  const sess = state.currentSession;
  if (!sess || !banner) return;

  document.getElementById('awbTitle').textContent = sess.dayTitle;

  const totalSets = sess.exercises.reduce((s, e) => s + (e.targetSets || e.sets.length), 0);
  const loggedSets = sess.exercises.reduce((s, e) => s + e.sets.filter(set => set.logged).length, 0);
  document.getElementById('awbMeta').textContent = `${loggedSets}/${totalSets} sets logged`;

  banner.style.display = 'flex';

  // Start ticker only if not already running
  if (!_bannerInterval) {
    _tickElapsed();
    _bannerInterval = setInterval(_tickElapsed, 1000);
  }
}

export function hideSessionBanner() {
  const banner = document.getElementById('activeWorkoutBanner');
  if (banner) banner.style.display = 'none';

  if (_bannerInterval) {
    clearInterval(_bannerInterval);
    _bannerInterval = null;
  }
}

export function updateSessionBanner() {
  if (state.currentSession) {
    showSessionBanner();
  } else {
    hideSessionBanner();
  }
}

export function resumeSession() {
  window.switchTab('session');
}
