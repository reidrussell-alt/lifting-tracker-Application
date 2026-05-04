import { state, saveData } from './data.js';
import { program } from './program.js';
import { todayDateString, formatDate, showToast } from './utils.js';

export function getLastPerformance(exerciseId) {
  for (let i = state.history.length - 1; i >= 0; i--) {
    const sess = state.history[i];
    const ex = sess.exercises.find(e => e.id === exerciseId);
    if (ex && ex.sets.some(s => s.weight !== '' || s.reps !== '')) {
      return { session: sess, exercise: ex };
    }
  }
  return null;
}

export function getSuggestion(exercise) {
  const last = getLastPerformance(exercise.id);
  if (!last) return null;
  const validSets = last.exercise.sets.filter(s => s.reps !== '' && (s.weight !== '' || exercise.loadType === 'bw'));
  if (validSets.length === 0) return null;

  const repRangeMatch = exercise.repRange.match(/(\d+)-(\d+)/);
  const topRep = repRangeMatch ? parseInt(repRangeMatch[2]) : 10;
  const sortedByWeight = [...validSets].sort((a, b) => parseFloat(b.weight || 0) - parseFloat(a.weight || 0));
  const topSet = sortedByWeight[0];

  if (exercise.loadType === 'bw') {
    const bestReps = Math.max(...validSets.map(s => parseInt(s.reps) || 0));
    if (bestReps >= topRep) return { msg: `Try for ${topRep + 1}+ reps` };
    return { msg: `Match ${bestReps} reps` };
  }

  const lastWeight = parseFloat(topSet.weight);
  const lastTopReps = parseInt(topSet.reps);
  const allHitTop = validSets.every(s => parseInt(s.reps) >= topRep);

  if (allHitTop && validSets.length >= exercise.targetSets - 1) {
    return { msg: `Bump up: ${lastWeight} → ${lastWeight + 5} lb` };
  }
  return { msg: `Last: ${lastWeight} × ${lastTopReps}` };
}

export function getLastSetsString(exerciseId) {
  const last = getLastPerformance(exerciseId);
  if (!last) return null;
  const dateStr = formatDate(last.session.date);
  const setsStr = last.exercise.sets
    .filter(s => s.reps !== '')
    .map(s => s.weight ? `${s.weight}×${s.reps}` : `${s.reps}`)
    .join(' · ');
  return { date: dateStr, sets: setsStr };
}

export function getLastExerciseNote(exerciseId) {
  const last = getLastPerformance(exerciseId);
  if (!last) return null;
  const { session, exercise: ex } = last;

  if (ex.note) return { date: formatDate(session.date), note: ex.note };

  const setNotes = ex.sets
    .map((s, i) => s.note ? `Set ${i + 1}: ${s.note}` : null)
    .filter(Boolean);
  if (setNotes.length > 0) return { date: formatDate(session.date), note: setNotes.join(' | ') };

  return null;
}

export function startSession(dayId) {
  const day = program.days.find(d => d.id === dayId);
  state.currentSession = {
    dayId,
    dayTitle: day.title,
    tag: day.tag,
    type: day.type,
    bw: '',
    date: todayDateString(),
    startedAt: new Date().toISOString(),
    exercises: day.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      loadType: ex.loadType,
      repRange: ex.repRange,
      targetSets: ex.sets,
      note: '',
      sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', logged: false, note: '', noteOpen: false }))
    }))
  };

  const lastSession = [...state.history].reverse()[0];
  if (lastSession && lastSession.bw) state.currentSession.bw = lastSession.bw;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('sessionPage').classList.add('active');
  renderSession();
}

export function renderSession() {
  const sess = state.currentSession;
  const el = document.getElementById('sessionPage');

  let html = `
    <div class="session-header">
      <div class="session-header-top">
        <div>
          <div class="session-day-name">${sess.dayTitle}</div>
          <div class="session-meta-row">${sess.tag.toUpperCase()} · ${sess.exercises.length} EXERCISES</div>
        </div>
        <button class="back-btn" onclick="abandonSession()">←</button>
      </div>
      <div class="bw-input-wrap">
        <span class="bw-label">Workout Date</span>
        <input type="date" class="bw-input" id="sessionDateInput" value="${sess.date}"
               style="width: 150px; font-size: 12px;" onchange="updateSessionDate(this.value)">
      </div>
      <div class="bw-input-wrap">
        <span class="bw-label">Bodyweight (lb)</span>
        <input type="number" inputmode="decimal" class="bw-input" id="bwInput" value="${sess.bw}"
               placeholder="196" onchange="updateBw(this.value)">
      </div>
    </div>
  `;

  sess.exercises.forEach((ex, exIdx) => {
    const allLogged = ex.sets.every(s => s.logged);
    const suggestion = getSuggestion(ex);
    const lastInfo = getLastSetsString(ex.id);
    const lastNote = getLastExerciseNote(ex.id);

    html += `
      <div class="exercise-block ${allLogged && ex.sets.length >= ex.targetSets ? 'complete' : ''}">
        <div class="exercise-header">
          <div class="exercise-name">
            <span>${ex.name}</span>
            <span class="target-pill">${ex.targetSets}×${ex.repRange}</span>
          </div>
          ${suggestion ? `
            <div class="suggestion">
              <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Suggestion: <strong>${suggestion.msg}</strong></span>
            </div>
          ` : `
            <div class="suggestion" style="background: rgba(212, 255, 58, 0.04); color: var(--text-dimmer);">
              <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>First time — start at a comfortable weight</span>
            </div>
          `}
          ${lastNote ? `
            <div class="ex-last-note">
              <span class="ex-last-note-label">📝 Last note (${lastNote.date})</span>
              <span class="ex-last-note-text">${lastNote.note}</span>
            </div>
          ` : ''}
        </div>
        <div class="sets-list">
    `;

    ex.sets.forEach((set, setIdx) => {
      const isExtra = setIdx >= ex.targetSets;
      const rowCls = `set-row ${set.logged ? 'logged' : ''} ${ex.loadType === 'bw' ? 'bw-row' : ''} ${isExtra ? 'extra' : ''}`;
      const setNumLabel = isExtra ? `+${setIdx - ex.targetSets + 1}` : (setIdx + 1);
      const noteBtnCls = `icon-btn ${set.note ? 'has-note' : ''}`;

      html += `
        <div class="${rowCls}" data-ex="${exIdx}" data-set="${setIdx}">
          <div class="set-num">${setNumLabel}</div>
          ${ex.loadType === 'bw' ? `
            <div class="set-input-wrap">
              <span class="set-input-label">Reps</span>
              <input type="number" inputmode="numeric" class="set-input"
                     value="${set.reps}" placeholder="—"
                     onchange="updateSet(${exIdx}, ${setIdx}, 'reps', this.value)">
            </div>
          ` : `
            <div class="set-input-wrap">
              <span class="set-input-label">Lb</span>
              <input type="number" inputmode="decimal" class="set-input"
                     value="${set.weight}" placeholder="—"
                     onchange="updateSet(${exIdx}, ${setIdx}, 'weight', this.value)">
            </div>
            <div class="set-input-wrap">
              <span class="set-input-label">Reps</span>
              <input type="number" inputmode="numeric" class="set-input"
                     value="${set.reps}" placeholder="—"
                     onchange="updateSet(${exIdx}, ${setIdx}, 'reps', this.value)">
            </div>
          `}
          <button class="${noteBtnCls}" onclick="toggleNote(${exIdx}, ${setIdx})" title="Note">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
          </button>
          <button class="icon-btn ${set.logged ? 'logged' : ''}" onclick="toggleSetLogged(${exIdx}, ${setIdx})">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
        ${(set.noteOpen || set.note) ? `
          <div class="note-row">
            <textarea class="note-input" placeholder="Note for set ${setNumLabel}..."
                      oninput="updateSet(${exIdx}, ${setIdx}, 'note', this.value)"
                      rows="1">${set.note}</textarea>
          </div>
        ` : ''}
      `;
    });

    html += `<button class="add-set-btn" onclick="addSet(${exIdx})">+ Add Set</button>`;

    if (lastInfo) {
      html += `
        <div class="last-time-row">
          <span><strong>Last (${lastInfo.date}):</strong></span>
          <span>${lastInfo.sets}</span>
        </div>
      `;
    }
    html += `
      <div class="ex-note-wrap">
        <textarea class="ex-note-input"
                  placeholder="Notes for next time (technique, soreness, etc.)"
                  oninput="updateExerciseNote(${exIdx}, this.value)"
                  rows="2">${ex.note}</textarea>
      </div>
    </div></div>`;
  });

  html += `<button class="finish-btn" onclick="finishSession()">Finish & Save Session</button>`;
  el.innerHTML = html;
}

export function updateBw(val) {
  state.currentSession.bw = val;
}

export function updateSessionDate(val) {
  state.currentSession.date = val || todayDateString();
}

export function updateSet(exIdx, setIdx, field, value) {
  state.currentSession.exercises[exIdx].sets[setIdx][field] = value;
  if (field === 'note') return;

  const set = state.currentSession.exercises[exIdx].sets[setIdx];
  const ex = state.currentSession.exercises[exIdx];
  const hasWeight = ex.loadType === 'bw' || (set.weight !== '' && set.weight !== null);
  const hasReps = set.reps !== '' && set.reps !== null;

  if (hasWeight && hasReps && !set.logged) {
    set.logged = true;
    const row = document.querySelector(`.set-row[data-ex="${exIdx}"][data-set="${setIdx}"]`);
    if (row) {
      row.classList.add('logged');
      const checkBtn = row.querySelectorAll('.icon-btn')[1];
      if (checkBtn) checkBtn.classList.add('logged');
    }
  }
}

export function toggleNote(exIdx, setIdx) {
  const set = state.currentSession.exercises[exIdx].sets[setIdx];
  set.noteOpen = !set.noteOpen;
  renderSession();
}

export function toggleSetLogged(exIdx, setIdx) {
  const set = state.currentSession.exercises[exIdx].sets[setIdx];
  set.logged = !set.logged;
  renderSession();
}

export function addSet(exIdx) {
  const ex = state.currentSession.exercises[exIdx];
  ex.sets.push({ weight: '', reps: '', logged: false, note: '', noteOpen: false });
  renderSession();
}

export function abandonSession() {
  if (confirm('Discard this session?')) {
    state.currentSession = null;
    window.switchTab('plan');
  }
}

export function finishSession() {
  const sess = state.currentSession;
  const totalSets = sess.exercises.reduce((s, e) => s + e.targetSets, 0);
  const loggedSets = sess.exercises.reduce((s, e) => s + e.sets.filter(set => set.logged).length, 0);

  if (loggedSets === 0) { showToast('No sets logged yet'); return; }

  if (loggedSets < totalSets) {
    document.getElementById('finishModalText').textContent =
      `${loggedSets} of ${totalSets} sets logged. Save anyway?`;
    document.getElementById('finishModal').classList.add('active');
  } else {
    confirmFinishSession();
  }
}

export function confirmFinishSession() {
  closeModal();
  const sess = state.currentSession;
  const dateStr = sess.date || todayDateString();
  const record = {
    date: new Date(dateStr + 'T12:00:00').toISOString(),
    dayId: sess.dayId,
    dayTitle: sess.dayTitle,
    tag: sess.tag,
    bw: sess.bw,
    exercises: sess.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      loadType: ex.loadType,
      repRange: ex.repRange,
      note: ex.note || '',
      sets: ex.sets.filter(s => s.logged).map(s => ({
        weight: s.weight,
        reps: s.reps,
        note: s.note || ''
      }))
    })).filter(ex => ex.sets.length > 0)
  };

  state.history.push(record);
  saveData();
  state.currentSession = null;
  showToast('Session saved 💪', 'success');
  window.switchTab('progress');
}

export function updateExerciseNote(exIdx, value) {
  state.currentSession.exercises[exIdx].note = value;
}

export function closeModal() {
  document.getElementById('finishModal').classList.remove('active');
}
