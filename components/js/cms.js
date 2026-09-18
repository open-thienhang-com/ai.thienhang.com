// ── CMS PANEL ────────────────────────────────────────────────
let cmsLoaded = false;

export function toggleCMS() {
  const panel     = document.getElementById('cmsPanel');
  const btn       = document.getElementById('cmsToggle');
  const barBtn    = document.getElementById('cmsBarBtn');
  const manageRow = document.querySelector('.agent-row[data-agent="manage"]');
  const isOpen    = panel.style.display === 'flex';

  if (isOpen) {
    panel.style.display = 'none';
    btn       && btn.classList.remove('cms-active');
    barBtn    && (barBtn.textContent = '⊞ Open CMS');
    manageRow && manageRow.classList.remove('cms-active-row');
  } else {
    panel.style.display = 'flex';
    btn       && btn.classList.add('cms-active');
    barBtn    && (barBtn.textContent = '✕ Close CMS');
    manageRow && manageRow.classList.add('cms-active-row');
    if (!cmsLoaded) { loadCMS(); cmsLoaded = true; }
  }
}

export function loadCMS() {
  const loading = document.getElementById('cmsLoading');
  const frame   = document.getElementById('cmsFrame');
  frame.src = 'https://ghn-cms.vercel.app/';
  frame.onload = () => { loading.style.display = 'none'; frame.style.display = 'block'; };
}

export function reloadCMS() {
  const frame   = document.getElementById('cmsFrame');
  const loading = document.getElementById('cmsLoading');
  frame.style.display   = 'none';
  loading.style.display = 'flex';
  frame.src = frame.src;
  frame.onload = () => { loading.style.display = 'none'; frame.style.display = 'block'; };
}
