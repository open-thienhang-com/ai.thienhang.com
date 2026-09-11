import { AGENTS } from './agents.js';

// ── HELPERS ──────────────────────────────────────────────────
export const container  = () => document.getElementById('messages');
export const now        = () => new Date().toTimeString().split(' ')[0];
export const sleep      = ms => new Promise(r => setTimeout(r, ms));
export const scrollBottom = () => { const m = container(); if (m) m.scrollTop = m.scrollHeight; };

// ── SYSTEM MESSAGE ───────────────────────────────────────────
export function addSysMsg(text) {
  const el = document.createElement('div');
  el.className = 'sys-msg';
  el.textContent = text;
  container().appendChild(el);
  scrollBottom();
}

// ── AGENT MESSAGE ────────────────────────────────────────────
export function addMsg(agentId, to, text, delay = 0) {
  return new Promise(res => setTimeout(() => {
    const a   = AGENTS[agentId];
    const toA = to && to !== 'all' ? AGENTS[to] : null;
    const el  = document.createElement('div');
    el.className = `msg${agentId === 'nexus' ? ' right' : ''}`;
    const mention = toA
      ? `<span class="mention" style="color:${toA.color}">@${toA.name}</span> `
      : to === 'all' ? '<span class="mention" style="color:var(--muted-fg)">@All</span> ' : '';
    el.innerHTML = `
      <div class="msg-av" style="background:${a.bg};border-color:${a.border};color:${a.color}">${a.icon}</div>
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-from" style="color:${a.color}">${a.name}</span>
          ${toA
            ? `<span class="msg-to">→ <span style="color:${toA.color}">${toA.name}</span></span>`
            : to === 'all' ? '<span class="msg-to">→ All</span>' : ''}
          <span class="msg-time">${now()}</span>
        </div>
        <div class="msg-bubble" style="background:${a.bg};border:1px solid ${a.border};clip-path:polygon(0 5px,5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%)">
          ${mention}${text}
        </div>
      </div>`;
    container().appendChild(el);
    scrollBottom();
    res();
  }, delay));
}

// ── TYPING INDICATOR ─────────────────────────────────────────
export function addTyping(agentId) {
  const a  = AGENTS[agentId];
  const el = document.createElement('div');
  el.className = 'typing-wrap';
  el.id = 'typing-' + agentId;
  el.innerHTML = `
    <div class="msg-av" style="background:${a.bg};border-color:${a.border};color:${a.color}">${a.icon}</div>
    <div>
      <div class="typing-label">${a.name} đang phân tích...</div>
      <div class="typing-bubble" style="background:${a.bg};border:1px solid ${a.border};clip-path:polygon(0 4px,4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%)">
        <div class="tdot" style="background:${a.color}"></div>
        <div class="tdot" style="background:${a.color}"></div>
        <div class="tdot" style="background:${a.color}"></div>
      </div>
    </div>`;
  container().appendChild(el);
  scrollBottom();
  return el;
}

export function removeTyping(agentId) {
  const el = document.getElementById('typing-' + agentId);
  if (el) el.remove();
}

// ── PROPOSAL CARD ────────────────────────────────────────────
export function addProposal(agentId, { id, title, reasoning, outcome, risk, confidence, votes }) {
  const a  = AGENTS[agentId];
  const el = document.createElement('div');
  el.className = 'msg';
  const votesHtml = votes.map(v =>
    `<span class="vote-chip ${v.yes ? 'vote-yes' : v.abstain ? 'vote-abstain' : 'vote-no'}">
      ${v.yes ? '✓' : v.abstain ? '—' : '✗'} ${AGENTS[v.id]?.name || v.id}
    </span>`
  ).join('');
  el.innerHTML = `
    <div class="msg-av" style="background:${a.bg};border-color:${a.border};color:${a.color}">${a.icon}</div>
    <div style="flex:1;max-width:82%">
      <div class="msg-header"><span class="msg-from" style="color:${a.color}">${a.name}</span><span class="msg-time">${now()}</span></div>
      <div class="proposal-card" style="border-color:${a.border};color:${a.color};background:${a.bg}">
        <div class="proposal-tag">PROPOSAL ${id}</div>
        <div class="proposal-title" style="color:var(--fg)">${title}</div>
        <div class="proposal-meta">
          <span>📋 ${reasoning}</span>
          <span>✦ ${outcome}</span>
          <span style="color:${risk === 'LOW' ? 'var(--n)' : risk === 'MED' ? 'var(--amber)' : 'var(--red)'}">⚡ Risk: ${risk}</span>
          <span style="color:${a.color}">◎ ${confidence}% confidence</span>
        </div>
        <div class="proposal-votes">${votesHtml}</div>
        <div class="proposal-actions">
          <button class="pact" style="border-color:var(--n);color:var(--n)" onclick="executeProposal(this,'${id}')">✓ Execute</button>
          <button class="pact" style="border-color:var(--amber);color:var(--amber)" onclick="deferProposal(this,'${id}')">⏸ Defer</button>
          <button class="pact" style="border-color:var(--red);color:var(--red)" onclick="overrideProposal(this,'${id}')">✗ Override</button>
        </div>
      </div>
    </div>`;
  container().appendChild(el);
  scrollBottom();
}

// ── NEXUS DECISION ───────────────────────────────────────────
export function addDecision(text) {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="msg right">
      <div class="msg-av" style="background:rgba(0,255,136,.12);border:1px solid rgba(0,255,136,.3);color:var(--n)">◈</div>
      <div class="msg-body" style="align-items:flex-end">
        <div class="msg-header"><span class="msg-from" style="color:var(--n)">NEXUS</span><span class="msg-time">${now()}</span></div>
        <div class="nexus-decision"><div class="nd-tag">⬡ NEXUS DECISION</div><div class="nd-msg">${text}</div></div>
      </div>
    </div>`;
  container().appendChild(el);
  scrollBottom();
}

// ── RICH MESSAGE ─────────────────────────────────────────────
export function addRichMsg(agentId, text, richHtml, delay = 0) {
  return new Promise(res => setTimeout(() => {
    const a  = AGENTS[agentId];
    const el = document.createElement('div');
    el.className = 'msg';
    el.innerHTML = `
      <div class="msg-av" style="background:${a.bg};border-color:${a.border};color:${a.color}">${a.icon}</div>
      <div class="msg-body" style="max-width:90%;width:90%">
        <div class="msg-header">
          <span class="msg-from" style="color:${a.color}">${a.name}</span>
          <span class="msg-time">${now()}</span>
        </div>
        ${text ? `<div class="msg-bubble" style="background:${a.bg};border:1px solid ${a.border};clip-path:polygon(0 5px,5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%);margin-bottom:6px">${text}</div>` : ''}
        <div class="rich-wrap">${richHtml}</div>
      </div>`;
    container().appendChild(el);
    scrollBottom();
    // animate bar fills after DOM insert
    setTimeout(() => {
      el.querySelectorAll('.r-bar-fill').forEach(b => {
        const w = b.dataset.w;
        b.style.width = '0';
        setTimeout(() => b.style.width = w, 60);
      });
    }, 80);
    res();
  }, delay));
}
