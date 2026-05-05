import { state, saveData } from './data.js';
import { EXERCISE_LIBRARY } from './exerciseLibrary.js';
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

  let topRep = 10;
  if (exercise.repRange) {
    const m = exercise.repRange.match(/(\d+)-(\d+)/);
    if (m) topRep = parseInt(m[2]);
  }

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
  const targetSets = exercise.targetSets || 3;

  if (allHitTop && validSets.length >= targetSets - 1) {
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
  const activeProgram = state.programs.find(p => p.isActive);
  if (!activeProgram) { window.switchTab('plan'); return; }

  const day = activeProgram.days.find(d => d.id === dayId);
  if (!day) return;

  state.currentSession = {
    programId: activeProgram.id,
    programName: activeProgram.name,
    dayId,
    dayTitle: day.name,
    tag: day.type || 'LIFT',
    bw: '',
    date: todayDateString(),
    startedAt: new Date().toISOString(),
    isTrackAsYouGo: false,
    exercises: day.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      loadType: ex.loadType,
      repRange: ex.repRange || '',
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

export function startTrackAsYouGoWorkout() {
  const today = new Date();
  state.currentSession = {
    programId: null,
    programName: 'Track As You Go',
    dayId: `workout_${Date.now()}`,
    dayTitle: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    tag: 'TRACK',
    bw: '',
    date: todayDateString(),
    startedAt: today.toISOString(),
    isTrackAsYouGo: true,
    exercises: []
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
  const metaTag = (sess.tag || 'LIFT').toUpperCase();

  let html = `
    <div class="session-header">
      <div class="session-header-top">
        <div>
          <div class="session-day-name">${sess.dayTitle}</div>
          <div class="session-meta-row">${metaTag} · ${sess.exercises.length} EXERCISE${sess.exercises.length !== 1 ? 'S' : ''}</div>
        </div>
        <button class="back-btn" onclick="abandonSession()">←</button>
      </div>
      <div class="bw-input-wrap">
        <span class="bw-label">Workout Date</span>
        <input type="date" class="bw-input" id="sessionDateInput" value="${sess.date}"
               style="width:150px;font-size:12px;" onchange="updateSessionDate(this.value)">
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
    const targetSets = ex.targetSets || ex.sets.length;
    const pillLabel = ex.repRange ? `${targetSets}×${ex.repRange}` : `${targetSets} sets`;

    html += `
      <div class="exercise-block ${allLogged && ex.sets.length >= targetSets ? 'complete' : ''}">
        <div class="exercise-header">
          <div class="exercise-name">
            <span>${ex.name}</span>
            <div style="display:flex;gap:6px;align-items:center;">
              <span class="target-pill">${pillLabel}</span>
              ${sess.isTrackAsYouGo ? `
                <button onclick="removeExercise(${exIdx})" style="background:transparent;border:none;color:var(--text-dimmer);cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;" title="Remove exercise">×</button>
              ` : ''}
            </div>
          </div>
          ${suggestion ? `
            <div class="suggestion">
              <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Suggestion: <strong>${suggestion.msg}</strong></span>
            </div>
          ` : `
            <div class="suggestion" style="background:rgba(212,255,58,0.04);color:var(--text-dimmer);">
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
      const isExtra = setIdx >= targetSets;
      const rowCls = `set-row ${set.logged ? 'logged' : ''} ${ex.loadType === 'bw' ? 'bw-row' : ''} ${isExtra ? 'extra' : ''}`;
      const setNumLabel = isExtra ? `+${setIdx - targetSets + 1}` : (setIdx + 1);
      const noteBtnCls = `icon-btn ${set.note ? 'has-note' : ''}`;

      html += `
        <div class="${rowCls}" data-ex="${exIdx}" data-set="${setIdx}">
          <div class="set-num">${setNumLabel}</div>
          ${ex.loadType === 'bw' ? `
            <div class="set-input-wrap">
              <span class="set-input-label">Reps</span>
              <input type="number" inputmode="numeric" class="set-input" value="${set.reps}" placeholder="—"
                     onchange="updateSet(${exIdx}, ${setIdx}, 'reps', this.value)">
            </div>
          ` : `
            <div class="set-input-wrap">
              <span class="set-input-label">Lb</span>
              <input type="number" inputmode="decimal" class="set-input" value="${set.weight}" placeholder="—"
                     onchange="updateSet(${exIdx}, ${setIdx}, 'weight', this.value)">
            </div>
            <div class="set-input-wrap">
              <span class="set-input-label">Reps</span>
              <input type="number" inputmode="numeric" class="set-input" value="${set.reps}" placeholder="—"
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

  if (sess.isTrackAsYouGo) {
    html += `<button class="add-exercise-fab" onclick="showExercisePicker()">+ Add Exercise</button>`;
  }

  html += `<button class="finish-btn" onclick="finishSession()">Finish & Save Session</button>`;
  el.innerHTML = html;
}

export function updateBw(val) { state.currentSession.bw = val; }

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
  state.currentSession.exercises[exIdx].sets[setIdx].noteOpen ^= true;
  renderSession();
}

export function toggleSetLogged(exIdx, setIdx) {
  state.currentSession.exercises[exIdx].sets[setIdx].logged ^= true;
  renderSession();
}

export function addSet(exIdx) {
  state.currentSession.exercises[exIdx].sets.push({ weight: '', reps: '', logged: false, note: '', noteOpen: false });
  renderSession();
}

export function removeExercise(exIdx) {
  if (state.currentSession.exercises.length <= 1 && !confirm('Remove the only exercise in this session?')) return;
  state.currentSession.exercises.splice(exIdx, 1);
  renderSession();
}

export function showExercisePicker() {
  const grouped = {};
  EXERCISE_LIBRARY.forEach(ex => {
    if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = [];
    grouped[ex.muscleGroup].push(ex);
  });

  const groupOrder = ['chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves','abs'];
  const groupLabels = {
    chest:'Chest', back:'Back', shoulders:'Shoulders', biceps:'Biceps',
    triceps:'Triceps', quads:'Quads', hamstrings:'Hamstrings',
    glutes:'Glutes', calves:'Calves', abs:'Core / Abs'
  };

  let listHtml = '';
  groupOrder.forEach(mg => {
    const exs = grouped[mg];
    if (!exs || !exs.length) return;
    listHtml += `
      <div class="picker-group">
        <div class="picker-group-label">${groupLabels[mg] || mg}</div>
        ${exs.map(ex => `
          <button class="picker-ex-btn" data-name="${ex.name.toLowerCase()}" data-group="${mg}"
                  onclick="addExerciseToSession('${ex.id}')">
            <span>${ex.name}</span>
            <span class="picker-load-tag ${ex.loadType === 'bw' ? 'bw' : 'wt'}">${ex.loadType === 'bw' ? 'BW' : 'WT'}</span>
          </button>
        `).join('')}
      </div>
    `;
  });

  const modal = document.createElement('div');
  modal.className = 'modal-bg active';
  modal.id = 'exercisePickerModal';
  modal.innerHTML = `
    <div class="modal" style="max-width:480px;max-height:80vh;overflow-y:auto;text-align:left;" onclick="event.stopPropagation()">
      <div class="modal-title" style="text-align:left;margin-bottom:12px;">Add Exercise</div>
      <input type="text" id="exSearchInput" class="bw-input" style="width:100%;margin-bottom:16px;"
             placeholder="Search exercises…" oninput="filterExercisePicker(this.value)">
      <div id="pickerList">${listHtml}</div>
    </div>
  `;
  modal.addEventListener('click', closeExercisePicker);
  document.body.appendChild(modal);
  document.getElementById('exSearchInput')?.focus();
}

export function filterExercisePicker(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.picker-ex-btn').forEach(btn => {
    btn.style.display = btn.dataset.name.includes(q) ? '' : 'none';
  });
  document.querySelectorAll('.picker-group').forEach(group => {
    const visible = [...group.querySelectorAll('.picker-ex-btn')].some(b => b.style.display !== 'none');
    group.style.display = visible ? '' : 'none';
  });
}

export function closeExercisePicker() {
  document.getElementById('exercisePickerModal')?.remove();
}

export function addExerciseToSession(exerciseId) {
  const ex = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
  if (!ex) return;
  state.currentSession.exercises.push({
    id: ex.id,
    name: ex.name,
    loadType: ex.loadType,
    repRange: '',
    targetSets: 3,
    note: '',
    sets: Array.from({ length: 3 }, () => ({ weight: '', reps: '', logged: false, note: '', noteOpen: false }))
  });
  closeExercisePicker();
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
  if (sess.exercises.length === 0) { showToast('No exercises added yet'); return; }

  const totalSets = sess.exercises.reduce((s, e) => s + (e.targetSets || e.sets.length), 0);
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
    programId: sess.programId || null,
    programName: sess.programName || null,
    bw: sess.bw,
    exercises: sess.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      loadType: ex.loadType,
      repRange: ex.repRange || '',
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
