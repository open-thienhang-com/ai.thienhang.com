// ── CMS PANEL ────────────────────────────────────────────────
let cmsLoaded = false;

export function toggleCMS() {
  const shell  = document.getElementById('shell');
  const panel  = document.getElementById('cmsPanel');
  const btn    = document.getElementById('cmsToggle');
  const barBtn = document.getElementById('cmsBarBtn');
  const isOpen = shell.classList.contains('cms-open');

  if (isOpen) {
    shell.classList.remove('cms-open');
    panel.style.display = 'none';
    btn    && btn.classList.remove('cms-active');
    barBtn && (barBtn.textContent = '⊞ Open CMS');
  } else {
    panel.style.display = 'flex';
    shell.classList.add('cms-open');
    btn    && btn.classList.add('cms-active');
    barBtn && (barBtn.textContent = '✕ Close CMS');
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
  frame.src = frame.src; // triggers reload
  frame.onload = () => { loading.style.display = 'none'; frame.style.display = 'block'; };
}
