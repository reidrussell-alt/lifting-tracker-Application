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
