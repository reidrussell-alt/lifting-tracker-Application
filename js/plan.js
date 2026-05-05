import { state } from './data.js';

export function renderPlan() {
  const el = document.getElementById('planPage');

  if (!state.profile) {
    el.innerHTML = '';
    return;
  }

  if (state.profile.trainingMode === 'trackAsYouGo') {
    renderTrackAsYouGoPlan(el);
    return;
  }

  const activeProgram = state.programs.find(p => p.isActive);
  if (!activeProgram) {
    renderNoProgramState(el);
    return;
  }

  renderStructuredPlan(el, activeProgram);
}

function renderTrackAsYouGoPlan(el) {
  const count = state.history.length;
  el.innerHTML = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">Track As You Go</div>
      <div class="plan-mode-sub">${count} session${count !== 1 ? 's' : ''} logged</div>
    </div>
    <div class="day-card" style="border: 1px dashed var(--accent);">
      <div class="day-header">
        <div class="day-left">
          <div class="day-badge" style="border-color:var(--accent);color:var(--accent);">+</div>
          <div>
            <div class="day-title">Start New Workout</div>
            <div class="day-desc">Add exercises as you go</div>
          </div>
        </div>
        <button class="start-btn" onclick="startTrackAsYouGoWorkout()">Start</button>
      </div>
    </div>
    ${count > 0 && count % 10 === 0 ? `
      <div class="rules-card" style="border-color:rgba(212,255,58,0.3);">
        <div class="rules-card-title">Ready for a structured plan?</div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;">
          You've logged ${count} workouts! Head to Settings to set up a structured training program.
        </div>
        <button class="start-btn" onclick="switchTab('settings')" style="width:100%;">Go to Settings</button>
      </div>
    ` : ''}
  `;
}

function renderNoProgramState(el) {
  el.innerHTML = `
    <div class="empty-state">
      <div class="icon">📋</div>
      <p><strong>No active program.</strong><br>Go to Settings to create or activate a program.</p>
    </div>
    <button class="finish-btn" style="margin-top:16px;" onclick="switchTab('settings')">Go to Settings</button>
  `;
}

function renderStructuredPlan(el, prog) {
  let html = `
    <div class="plan-mode-header">
      <div class="plan-mode-title">${prog.name}</div>
      <div class="plan-mode-sub">${prog.days.length}-day program</div>
    </div>
  `;

  prog.days.forEach((d, idx) => {
    const totalSets = d.exercises.reduce((s, e) => s + e.sets, 0);
    const type = d.type || '';
    html += `
      <div class="day-card"${type ? ` data-type="${type}"` : ''}>
        <div class="day-header">
          <div class="day-left">
            <div class="day-badge">${idx + 1}</div>
            <div>
              <div class="day-title">${d.name}</div>
              <div class="day-desc">${d.exercises.length} exercises · ${totalSets} sets</div>
            </div>
          </div>
          <button class="start-btn" onclick="startSession('${d.id}')">Start</button>
        </div>
      </div>
    `;
  });

  html += `
    <div class="rules-card">
      <div class="rules-card-title">Core Rules</div>
      <div class="rule"><span class="rule-num">01</span><span><strong>Last set to failure.</strong> Earlier sets stop 1-2 reps short.</span></div>
      <div class="rule"><span class="rule-num">02</span><span><strong>Hit top of rep range</strong> on all sets → add weight next session.</span></div>
      <div class="rule"><span class="rule-num">03</span><span><strong>48+ hours</strong> between same-pattern days.</span></div>
      <div class="rule"><span class="rule-num">04</span><span><strong>Compounds = tension,</strong> isolations = burn. Don't chase burn on squats.</span></div>
    </div>
  `;

  el.innerHTML = html;
}
