export function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isoDateOnly(iso) {
  if (!iso) return todayDateString();
  return iso.split('T')[0];
}

export function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return `${Math.floor(diff)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function showToast(msg, variant = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + variant;
  setTimeout(() => toast.classList.remove('show'), 2200);
}

export function showConfirm(message, onConfirm, confirmLabel = 'Confirm') {
  const modal = document.getElementById('confirmModal');
  const textEl = document.getElementById('confirmModalText');
  const okBtn = document.getElementById('confirmModalOk');
  const cancelBtn = document.getElementById('confirmModalCancel');

  textEl.textContent = message;
  okBtn.textContent = confirmLabel;
  modal.classList.add('active');

  const close = () => modal.classList.remove('active');
  const handleOk = () => { close(); onConfirm(); };

  okBtn.addEventListener('click', handleOk, { once: true });
  cancelBtn.addEventListener('click', close, { once: true });
}

export function showPrompt(message, defaultValue, onConfirm, confirmLabel = 'Save') {
  const modal = document.getElementById('promptModal');
  const textEl = document.getElementById('promptModalText');
  const input = document.getElementById('promptModalInput');
  const okBtn = document.getElementById('promptModalOk');
  const cancelBtn = document.getElementById('promptModalCancel');

  textEl.textContent = message;
  input.value = defaultValue || '';
  okBtn.textContent = confirmLabel;
  modal.classList.add('active');
  setTimeout(() => { input.focus(); input.select(); }, 50);

  const close = () => {
    modal.classList.remove('active');
    input.removeEventListener('keydown', handleKey);
  };
  const handleOk = () => { close(); onConfirm(input.value); };
  const handleKey = (e) => { if (e.key === 'Enter') handleOk(); };

  input.addEventListener('keydown', handleKey);
  okBtn.addEventListener('click', handleOk, { once: true });
  cancelBtn.addEventListener('click', close, { once: true });
}
