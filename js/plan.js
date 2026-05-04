import { program } from './program.js';

export function renderPlan() {
  const el = document.getElementById('planPage');
  let html = '';

  program.days.forEach(d => {
    const totalSets = d.exercises.reduce((s, e) => s + e.sets, 0);
    html += `
      <div class="day-card" data-type="${d.type}">
        <div class="day-header">
          <div class="day-left">
            <div class="day-badge">${d.day}</div>
            <div>
              <div class="day-title">${d.title} <span class="day-tag">${d.tag}</span></div>
              <div class="day-desc">${d.exercises.length} ex · ${totalSets} sets · ${d.desc.split(' · ')[1]}</div>
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
    <div class="data-section">
      <div class="data-section-title">Backup & Restore</div>
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
      <div class="data-helper">Export saves your history as a backup file. Import restores from a backup.</div>
    </div>
    <div class="reset-section">
      <button class="reset-link" onclick="openResetModal()">↻ Reset All Data</button>
    </div>
  `;

  el.innerHTML = html;
}
