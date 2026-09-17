import { STATUS }                            from './agents.js';
import { renderRoster, renderCouncilBar }     from './roster.js';
import { addMsg, addDecision, addTyping, removeTyping, now, sleep } from './messages.js';
import { initConversation, addThinkingCycle } from './conversation.js';
import { toggleCMS, reloadCMS }              from './cms.js';

// ── PROPOSAL ACTIONS (need global scope for onclick attrs) ───
function executeProposal(btn, id) {
  btn.closest('.proposal-actions').innerHTML =
    `<span class="badge bg-g" style="padding:4px 10px;font-size:8px">✓ EXECUTED · ${now()}</span>`;
  setTimeout(() =>
    addDecision(`Proposal ${id} đã được thực thi. Agents CMS Connector và Fleet Monitor đang giám sát kết quả. ETA hoàn thành: <strong style="color:var(--n)">52 phút</strong>.`),
    800
  );
  STATUS.manage = 'active'; STATUS.monitor = 'active';
  renderRoster(); renderCouncilBar();
}

function deferProposal(btn, id) {
  btn.closest('.proposal-actions').innerHTML =
    `<span class="badge bg-a" style="padding:4px 10px;font-size:8px">⏸ DEFERRED · ${now()}</span>`;
}

function overrideProposal(btn, id) {
  btn.closest('.proposal-actions').innerHTML =
    `<span class="badge bg-r" style="padding:4px 10px;font-size:8px">✗ OVERRIDDEN · ${now()}</span>`;
}

// ── USER MESSAGE HANDLER ─────────────────────────────────────
function sendUserMsg() {
  const inp = document.getElementById('msgInput');
  const val = inp.value.trim();
  if (!val) return;
  inp.value = '';

  const el = document.createElement('div');
  el.className = 'msg right';
  el.innerHTML = `
    <div class="msg-av" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:var(--fg)">▷</div>
    <div class="msg-body" style="align-items:flex-end">
      <div class="msg-header"><span class="msg-from" style="color:var(--fg)">Operator</span><span class="msg-time">${now()}</span></div>
      <div class="msg-bubble" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);clip-path:polygon(0 5px,5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%)">${val}</div>
    </div>`;
  document.getElementById('messages').appendChild(el);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;

  addTyping('nexus');
  const responses = [
    'Đã nhận yêu cầu. Đang phân phối tới các agents liên quan để xử lý và tổng hợp phản hồi.',
    'Câu hỏi hợp lệ. Fleet Monitor và Data Agent đang truy vấn. Sẽ có kết quả trong vài giây.',
    `Routing "${val}" → Decision Engine. Thu thập context từ 12 xe và 8 trụ sạc.`,
    'Ghi nhận. CMS Connector đang đồng bộ với AMPECO để xác minh trạng thái thực tế.',
  ];
  setTimeout(() => {
    removeTyping('nexus');
    addDecision(responses[Math.floor(Math.random() * responses.length)]);
  }, 1400);
}

function insertPropose() {
  const inp = document.getElementById('msgInput');
  inp.value = '/propose: ';
  inp.focus();
}

// ── EXPOSE TO WINDOW (for onclick attrs in HTML) ─────────────
window.toggleCMS        = toggleCMS;
window.reloadCMS        = reloadCMS;
window.executeProposal  = executeProposal;
window.deferProposal    = deferProposal;
window.overrideProposal = overrideProposal;
window.sendUserMsg      = sendUserMsg;
window.insertPropose    = insertPropose;
window.addThinkingCycle = addThinkingCycle;

// ── CLOCK ────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = now();
}
setInterval(updateClock, 1000);

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  // Load HTML fragments in parallel
  const [lpHtml, cmsPanelHtml] = await Promise.all([
    fetch('./components/left-panel.html').then(r => r.text()),
    fetch('./components/cms-panel.html').then(r => r.text()),
  ]);

  document.getElementById('lp').innerHTML       = lpHtml;
  document.getElementById('cmsPanel').innerHTML = cmsPanelHtml;

  // Clock initial value
  updateClock();

  // Enter key to send
  document.getElementById('msgInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMsg(); }
  });

  // Render & start conversation
  renderRoster();
  renderCouncilBar();
  initConversation();
}

init();
