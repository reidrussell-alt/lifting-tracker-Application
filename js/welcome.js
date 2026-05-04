import { state } from './data.js';
import { program } from './program.js';

const USER_NAME = 'Reid';

const WORKOUT_LABELS = {
  upperA: 'UPPER A',
  lowerA: 'LOWER A',
  upperB: 'UPPER B',
  lowerB: 'LOWER B',
};

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getWelcomeWorkoutLabel() {
  const dayIds = program.days.map(d => d.id);
  if (!state.history.length) return "TODAY'S SESSION";
  const lastDayId = state.history[state.history.length - 1].dayId;
  const lastIdx = dayIds.indexOf(lastDayId);
  if (lastIdx === -1) return "TODAY'S SESSION";
  const nextId = dayIds[(lastIdx + 1) % dayIds.length];
  return WORKOUT_LABELS[nextId] ?? "TODAY'S SESSION";
}

export function showWelcomeScreen() {
  const el = document.getElementById('welcomeScreen');
  if (!el) return;

  const greeting = getGreeting();
  const workoutLabel = getWelcomeWorkoutLabel();

  el.innerHTML = `
    <div class="welcome-inner">
      <div class="welcome-logo-wrap">
        <div class="welcome-logo">
          <svg viewBox="0 0 60 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <filter id="wLogoGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#wLogoGlow)">
              <path d="M30 3 L5 50 L16 50 L30 22 L44 50 L55 50 Z"
                    fill="#232323" stroke="#d4ff3a" stroke-width="1.5" stroke-linejoin="round"/>
              <line x1="18" y1="35" x2="42" y2="35"
                    stroke="#d4ff3a" stroke-width="1.5" stroke-linecap="round"/>
            </g>
          </svg>
        </div>
      </div>
      <div class="welcome-content">
        <div class="welcome-greeting">
          <span class="welcome-greeting-text">${greeting},</span><br>
          <span class="welcome-name">${USER_NAME}.</span>
        </div>
        <div class="welcome-tagline">Let's get after it.</div>
        <div class="welcome-label-wrap">
          <span class="welcome-label-line"></span>
          <span class="welcome-label">${workoutLabel}</span>
          <span class="welcome-label-line"></span>
        </div>
      </div>
      <div class="welcome-hint">Tap to continue</div>
    </div>
  `;

  el.classList.add('visible');

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    el.classList.add('fading');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };

  el.addEventListener('click', dismiss, { once: true });
}
