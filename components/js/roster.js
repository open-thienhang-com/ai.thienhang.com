import { AGENTS, STATUS } from './agents.js';

// ── RENDER LEFT PANEL ROSTER ─────────────────────────────────
export function renderRoster() {
  const roster = document.getElementById('agentRoster');
  if (!roster) return;
  const agents = Object.values(AGENTS).filter(a => a.id !== 'nexus');
  let html = '<div class="roster-title">// Agent Council</div>';
  agents.forEach(a => {
    const st = STATUS[a.id] || 'idle';
    const dotColor = st === 'active' ? a.color : st === 'thinking' ? '#ffbb00' : '#6b7280';
    const stLabel  = st === 'active' ? 'ACTIVE'  : st === 'thinking' ? 'THINKING' : 'IDLE';
    const isManage = a.id === 'manage';
    const onClick  = isManage ? ' onclick="toggleCMS()" title="Mở/đóng CMS Quản lí"' : '';
    html += `<div class="agent-row ${st === 'thinking' ? 'thinking' : st === 'active' ? 'speaking' : ''}${isManage ? ' manage-cms-row' : ''}" data-agent="${a.id}"${onClick}>
      <div class="adot" style="background:${dotColor};box-shadow:0 0 4px ${dotColor}40;animation-delay:${Math.random().toFixed(1)}s"></div>
      <div class="aavatar" style="background:${a.bg};border:1px solid ${a.border};color:${a.color}">${a.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="aname">${a.name}</div>
        <div style="font-size:7px;letter-spacing:.07em;color:var(--muted-fg)">${a.role}</div>
      </div>
      <div class="astatus" style="color:${dotColor}">${isManage ? '⊞' : stLabel}</div>
    </div>`;
  });
  roster.innerHTML = html;
}

// ── RENDER COUNCIL BAR ───────────────────────────────────────
export function renderCouncilBar() {
  const bar = document.getElementById('councilBar');
  if (!bar) return;
  const allAgents = Object.values(AGENTS);
  let html = '';
  allAgents.forEach(a => {
    const st = STATUS[a.id] || 'idle';
    const isActive = st === 'active' || st === 'thinking';
    html += `<div class="council-agent" title="${a.name} · ${a.role}">
      <div class="c-av ${isActive ? 'active' : ''}" style="background:${a.bg};border-color:${a.border};color:${a.color}">${a.icon}</div>
      <div class="c-lbl" style="color:${a.color}">${a.name.split(' ')[0]}</div>
    </div>`;
  });
  html += `<div class="council-sep"></div>
  <div class="council-actions">
    <span class="badge bg-g" style="margin-right:4px">● ${Object.values(STATUS).filter(s => s === 'active').length} Active</span>
    <button class="cb-btn" onclick="addThinkingCycle()">⚙ Trigger</button>
    <button class="cb-btn cms-active" id="cmsBarBtn" onclick="toggleCMS()">⊞ Open CMS</button>
  </div>`;
  bar.innerHTML = html;
}
