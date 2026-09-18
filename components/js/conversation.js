import { STATUS } from './agents.js';
import {
  sleep, addMsg, addSysMsg, addTyping, removeTyping,
  addProposal, addDecision, addRichMsg, now,
} from './messages.js';
import { renderRoster, renderCouncilBar } from './roster.js';
import {
  makeStats, makeBarChart, makeLineChart, makeDonut,
  makeHeatmap, makeTable, makeTimeline, makeRings,
} from './rich-cards.js';

// ── HELPER: ALERT CARD ───────────────────────────────────────
function makeAlertCard(level, title, lines) {
  const colors = {
    red:    { bg:'rgba(255,51,102,.08)',  border:'rgba(255,51,102,.3)',  fg:'#ff3366', icon:'🔴' },
    amber:  { bg:'rgba(255,187,0,.08)',   border:'rgba(255,187,0,.3)',   fg:'#ffbb00', icon:'⚠' },
    green:  { bg:'rgba(0,255,136,.08)',   border:'rgba(0,255,136,.3)',   fg:'#00ff88', icon:'✓' },
  };
  const c = colors[level] || colors.amber;
  return `<div class="rich-card" style="border-color:${c.border};background:${c.bg}">
    <div class="rich-header" style="border-color:${c.border}">
      <span class="rich-title" style="color:${c.fg}">${c.icon} ${title}</span>
      <span class="rich-tag" style="color:${c.fg};border-color:${c.border}">ALERT</span>
    </div>
    <div class="rich-body" style="display:flex;flex-direction:column;gap:6px">
      ${lines.map(l => `<div style="font-size:9px;color:#d1d5db;line-height:1.6;padding:4px 6px;background:rgba(255,255,255,.03);border-left:2px solid ${c.fg}">${l}</div>`).join('')}
    </div>
  </div>`;
}

// ── HELPER: REROUTE COMPARE CARD ────────────────────────────
function makeRerouteCard(from, to) {
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">🗺 Reroute Analysis</span><span class="rich-tag">AUTO</span></div>
    <div class="rich-body" style="display:flex;flex-direction:column;gap:8px">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center">
        <div style="padding:8px 10px;background:rgba(255,51,102,.07);border:1px solid rgba(255,51,102,.25);clip-path:polygon(0 4px,4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%)">
          <div style="font-size:7px;letter-spacing:.15em;color:#ff3366;margin-bottom:4px">HIỆN TẠI · ${from.id}</div>
          ${[
            ['Khoảng cách', from.dist],
            ['Hàng đợi',    `<span style="color:#ff3366;font-weight:700">${from.queue}</span>`],
            ['Giá điện',    from.price],
            ['ETA giao xe', `<span style="color:#ff3366">${from.eta}</span>`],
          ].map(([k,v]) => `<div style="display:flex;justify-content:space-between;font-size:8px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span style="color:#6b7280">${k}</span><span style="color:#d1d5db">${v}</span></div>`).join('')}
        </div>
        <div style="font-size:16px;color:#ffbb00;text-align:center">→</div>
        <div style="padding:8px 10px;background:rgba(0,255,136,.07);border:1px solid rgba(0,255,136,.25);clip-path:polygon(0 4px,4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%)">
          <div style="font-size:7px;letter-spacing:.15em;color:#00ff88;margin-bottom:4px">ĐỀ XUẤT · ${to.id}</div>
          ${[
            ['Khoảng cách', to.dist],
            ['Hàng đợi',    `<span style="color:#00ff88;font-weight:700">${to.queue}</span>`],
            ['Giá điện',    to.price],
            ['ETA giao xe', `<span style="color:#00ff88">${to.eta}</span>`],
          ].map(([k,v]) => `<div style="display:flex;justify-content:space-between;font-size:8px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span style="color:#6b7280">${k}</span><span style="color:#d1d5db">${v}</span></div>`).join('')}
        </div>
      </div>
      <div style="padding:7px 10px;background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.15);display:flex;justify-content:space-between;align-items:center;clip-path:polygon(0 3px,3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%)">
        <span style="font-size:8px;color:#6b7280">Tiết kiệm thời gian</span>
        <span style="font-family:'Orbitron',monospace;font-size:13px;font-weight:900;color:#00ff88">−38 phút</span>
      </div>
    </div>
  </div>`;
}

// ── PRE-POPULATED CONVERSATION ───────────────────────────────
export async function initConversation() {

  // ── PHASE 1: KHỞI ĐỘNG ─────────────────────────────────────
  addSysMsg('Trợ lý AI Giám sát Vận hành khởi tạo · 11/09/2026 · 13:42:07');
  await addMsg('nexus', 'all',
    'Xin chào. Tôi là <strong style="color:var(--n)">Trợ lý AI Giám sát Vận hành</strong> (Real-time Fleet Monitor). ' +
    'Đang theo dõi song song <strong>12 xe</strong> trên tuyến và <strong>8 trạm sạc</strong> trong khu vực. ' +
    'Tôi sẽ tự động cảnh báo và đề xuất điều chỉnh ngay khi phát hiện rủi ro.', 0);

  // ── Giám sát: Trạng thái xe ─────────────────────────────────
  await sleep(700);
  addTyping('monitor');
  await sleep(1500);
  removeTyping('monitor');
  await addRichMsg('monitor',
    'Cập nhật trạng thái fleet 13:42. Đang theo dõi SOC, vị trí và tiến độ tuyến:',
    makeStats([
      { label:'Xe đang chạy',  val:'8/12',  color:'#00ff88', sub:'4 xe tại depot' },
      { label:'SOC trung bình', val:'54%',  color:'#ffbb00', sub:'Target: >60%' },
      { label:'Đúng lịch',     val:'6/8',   color:'#88ff44', sub:'2 xe có nguy cơ trễ' },
      { label:'Cần sạc sớm',   val:'3 xe',  color:'#ff3366', sub:'SOC < 30%' },
    ]) +
    makeTable('Trạng thái xe trên tuyến', ['Xe', 'SOC', 'Vị trí hiện tại', 'Tiếp theo', 'Trạm sạc DK', 'Trạng thái'], [
      [`<strong style="color:#88ff44">VF-03</strong>`, '72%', 'Quận 9 · KM 14', 'Giao hàng 14:10', 'CP-02', `<span style="color:#00ff88">✓ Đúng lịch</span>`],
      [`<strong style="color:#ffbb00">VF-08</strong>`, '28%', 'Bình Dương · KM 22', 'Giao hàng 15:30', `<span style="color:#ff3366">CP-03</span>`, `<span style="color:#ffbb00">⚠ Cần theo dõi</span>`],
      [`<strong style="color:#ff3366">VF-11</strong>`, '19%', 'Long An · KM 8',  'Giao hàng 14:45', 'CP-06', `<span style="color:#ff3366">⚠ SOC thấp</span>`],
      [`<strong style="color:#88ff44">VF-05</strong>`, '81%', 'Quận 7 · KM 6',   'Giao hàng 13:55', '—',     `<span style="color:#00ff88">✓ Đủ pin</span>`],
    ])
  );

  // ── Giám sát: Trạng thái trạm sạc ─────────────────────────
  await sleep(600);
  addTyping('monitor');
  await sleep(1200);
  removeTyping('monitor');
  await addRichMsg('monitor',
    'Song song — trạng thái 8 trạm sạc trong khu vực. Phát hiện biến động hàng đợi:',
    makeTable('Trạm sạc — Realtime', ['Trạm', 'Khoảng cách', 'Hàng đợi', 'Công suất', 'Giá điện', 'Tình trạng'], [
      ['CP-02', '2.1 km', `<span style="color:#00ff88">0 xe</span>`,  '50 kW', '3,720₫/kWh', `<span style="color:#00ff88">Sẵn sàng</span>`],
      ['CP-03', '4.8 km', `<span style="color:#ff3366">3 xe · 45 phút</span>`, '50 kW', '3,850₫/kWh', `<span style="color:#ff3366">Quá tải</span>`],
      ['CP-06', '6.2 km', `<span style="color:#ffbb00">1 xe · 12 phút</span>`, '22 kW', '3,680₫/kWh', `<span style="color:#ffbb00">Chờ ít</span>`],
      ['CP-07', '5.5 km', `<span style="color:#00ff88">0 xe</span>`,  '50 kW', '3,850₫/kWh', `<span style="color:#00ff88">Sẵn sàng</span>`],
    ])
  );

  // ── PHASE 2: PHÁT HIỆN VẤN ĐỀ ──────────────────────────────
  await sleep(800);
  addSysMsg('⚠ Phát hiện bất thường — CP-03 hàng đợi tăng đột biến lúc 13:44');

  addTyping('monitor');
  await sleep(1000);
  removeTyping('monitor');
  STATUS.monitor = 'active'; renderRoster();
  await addRichMsg('monitor',
    '🔴 <strong style="color:#ff3366">CẢNH BÁO RỦI RO</strong> — VF-08 đang tiến đến CP-03, nhưng trạm vừa có sự cố:',
    makeAlertCard('red', 'CP-03 Quá Tải — Nguy cơ trễ tuyến VF-08', [
      '📍 <strong>VF-08</strong> · SOC 28% · Bình Dương · ETA đến CP-03: <strong>13:58</strong>',
      '⏱ Hàng đợi CP-03 hiện tại: <strong style="color:#ff3366">3 xe · ước tính 45 phút chờ</strong> (vừa tăng từ 0 trong 8 phút)',
      '🚚 Tuyến giao hàng tiếp theo của VF-08: <strong>15:30</strong> — nếu sạc tại CP-03, ETA thực: <strong style="color:#ff3366">16:12 (trễ 42 phút)</strong>',
      '⚡ SOC hiện tại 28% <strong>không đủ</strong> để hoàn thành tuyến không qua sạc',
    ])
  );

  // ── PHASE 3: ALERT CHO GSVT & TÀI XẾ ──────────────────────
  await sleep(500);
  addTyping('manage');
  await sleep(1100);
  removeTyping('manage');
  await addRichMsg('manage',
    'Đã phát Alert tức thì đến các bên liên quan:',
    makeAlertCard('amber', 'Alert đã gửi — Đang chờ xác nhận', [
      '📱 <strong>GSVT Nguyễn Minh Tuấn</strong> — Zalo + App · Gửi lúc 13:44:31 · <span style="color:#00ff88">✓ Đã đọc</span>',
      '📱 <strong>Tài xế VF-08 Trần Văn Hùng</strong> — App Driver · Gửi lúc 13:44:31 · <span style="color:#ffbb00">⏳ Chờ phản hồi</span>',
      '🔄 Hệ thống đang tính toán phương án reroute tối ưu...',
    ])
  );

  // ── PHASE 4: REROUTE ────────────────────────────────────────
  await sleep(600);
  addTyping('schedule');
  await sleep(1400);
  removeTyping('schedule');
  await addRichMsg('schedule',
    'Đã phân tích <strong>8 trạm</strong> trong bán kính 10km. CP-07 là phương án tối ưu nhất:',
    makeRerouteCard(
      { id:'CP-03', dist:'4.8 km', queue:'3 xe · 45 phút', price:'3,850₫/kWh', eta:'16:12 ⚠' },
      { id:'CP-07', dist:'5.5 km', queue:'0 xe · Ngay',    price:'3,850₫/kWh', eta:'15:08 ✓' }
    ) +
    makeTable('Các phương án khác đã xét', ['Trạm', 'Khoảng cách', 'Chờ', 'ETA giao xe', 'Điểm tối ưu'], [
      ['CP-07', '5.5 km', '0 xe',       `<span style="color:#00ff88">15:08</span>`, `<span style="color:#00ff88">★★★ Tốt nhất</span>`],
      ['CP-02', '7.2 km', '0 xe',       `<span style="color:#ffbb00">15:22</span>`, `<span style="color:#ffbb00">★★☆ Xa hơn</span>`],
      ['CP-06', '8.1 km', '1 xe 12ph',  `<span style="color:#ffbb00">15:35</span>`, `<span style="color:#ffbb00">★★☆ Chờ thêm</span>`],
      ['CP-03', '4.8 km', '3 xe 45ph',  `<span style="color:#ff3366">16:12</span>`, `<span style="color:#ff3366">✗ Không phù hợp</span>`],
    ])
  );

  // ── PHASE 5: 1-CLICK PROPOSAL ───────────────────────────────
  await sleep(500);
  addSysMsg('Gợi ý điều chỉnh sẵn sàng — Phê duyệt 1-click bên dưới');

  addProposal('schedule', {
    id: '#R-001',
    title: 'Reroute VF-08: CP-03 → CP-07 · Tiết kiệm 38 phút',
    reasoning: 'CP-03 quá tải 45 phút. CP-07 sẵn sàng, lệch 0.7km, cùng giá điện.',
    outcome: 'VF-08 giao hàng 15:08 · Đúng lịch tuyến 15:30 · SOC đạt 80% sau sạc',
    risk: 'LOW',
    confidence: 97,
    votes: [{ id:'monitor', yes:true }, { id:'manage', yes:true }, { id:'schedule', yes:true }],
  });

  await sleep(600);
  addSysMsg('Chờ phê duyệt từ GSVT · Tài xế đã nhận thông báo reroute dự kiến');
}

// ── SCHEDULE FILE ANALYSIS (MOCK) ───────────────────────────
export async function analyzeSchedule(filename) {
  const ext = filename.split('.').pop().toUpperCase();

  addSysMsg(`📂 Đã nhận file: ${filename} · Lập lịch sạc đang phân tích...`);

  // Parsing
  addTyping('schedule');
  await sleep(1800);
  removeTyping('schedule');
  await addMsg('schedule', 'all',
    `Đã đọc file <strong style="color:#ffbb00">${filename}</strong> (${ext}). ` +
    `Phát hiện <strong>12 chuyến xe</strong> trong ngày mai — đang so khớp với SOC hiện tại và năng lực trạm sạc...`, 0);

  // Parsed schedule table
  await sleep(600);
  addTyping('schedule');
  await sleep(1200);
  removeTyping('schedule');
  await addRichMsg('schedule',
    'Lịch vận hành đã phân tích — 12 chuyến / 8 tuyến:',
    makeTable('Lịch xe ngày mai', ['Xe', 'Xuất phát', 'Tuyến', 'Km ước tính', 'SOC cần', 'Trạm sạc DK', 'Trạng thái'], [
      ['VF-01', '06:00', 'HCM → BD',   '84 km',  '55%', 'CP-02', `<span style="color:#00ff88">✓ Đủ pin</span>`],
      ['VF-02', '06:30', 'HCM → LA',   '72 km',  '48%', 'CP-06', `<span style="color:#00ff88">✓ Đủ pin</span>`],
      ['VF-03', '07:00', 'HCM → DN',   '120 km', '78%', 'CP-03', `<span style="color:#ffbb00">⚠ Cần kiểm tra</span>`],
      ['VF-05', '07:30', 'BD → HCM',   '84 km',  '55%', '—',     `<span style="color:#00ff88">✓ Đủ pin</span>`],
      ['VF-07', '08:00', 'HCM → TDM',  '60 km',  '40%', 'CP-07', `<span style="color:#00ff88">✓ Đủ pin</span>`],
      ['VF-08', '08:30', 'HCM → BD',   '84 km',  '55%', 'CP-03', `<span style="color:#ff3366">✗ Xung đột trạm</span>`],
      ['VF-11', '09:00', 'LA → HCM',   '72 km',  '48%', 'CP-06', `<span style="color:#ffbb00">⚠ SOC thấp</span>`],
      ['VF-12', '13:00', 'HCM → VT',   '130 km', '85%', 'CP-01', `<span style="color:#ff3366">✗ Cần sạc trước</span>`],
    ])
  );

  // Monitor checks SOC readiness
  await sleep(700);
  addTyping('monitor');
  await sleep(1000);
  removeTyping('monitor');
  await addRichMsg('monitor',
    'Kiểm tra SOC hiện tại vs yêu cầu từ lịch — phát hiện 3 xe cần chú ý:',
    makeStats([
      { label:'Sẵn sàng',    val:'7/12',  color:'#00ff88', sub:'SOC đủ cho tuyến' },
      { label:'Cần sạc thêm', val:'3 xe', color:'#ffbb00', sub:'VF-03, VF-11, VF-12' },
      { label:'Xung đột trạm', val:'2',   color:'#ff3366', sub:'VF-03 & VF-08 cùng CP-03' },
      { label:'Phải sạc đêm', val:'1 xe', color:'#cc44ff', sub:'VF-12 cần 85% trước 13:00' },
    ])
  );

  // Schedule agent resolves conflicts
  await sleep(600);
  addTyping('schedule');
  await sleep(1400);
  removeTyping('schedule');
  await addRichMsg('schedule',
    'Đã tối ưu lịch sạc — giải quyết 2 xung đột và phân bổ lại trạm:',
    makeTable('Điều chỉnh đề xuất', ['Xe', 'Vấn đề', 'Hành động', 'Trạm mới', 'Tiết kiệm'], [
      ['VF-03', 'Xung đột CP-03 với VF-08', 'Chuyển sang CP-07', 'CP-07 · 07:15', `<span style="color:#00ff88">−22 phút chờ</span>`],
      ['VF-08', 'Xung đột CP-03 với VF-03', 'Giữ CP-03 · shift 30 phút', 'CP-03 · 09:00', `<span style="color:#00ff88">Tránh xếp hàng</span>`],
      ['VF-11', 'SOC 19% — thiếu cho tuyến', 'Sạc đêm nay tại depot', 'Depot · 22:00', `<span style="color:#00ff88">SOC 85% lúc 06:00</span>`],
      ['VF-12', 'Cần 85% trước 13:00', 'Bắt đầu sạc 06:30', 'CP-01 · 06:30', `<span style="color:#00ff88">Đủ SOC lúc 12:15</span>`],
    ])
  );

  // Final proposal
  await sleep(500);
  addSysMsg('Lịch tối ưu sẵn sàng — Phê duyệt để áp dụng toàn bộ điều chỉnh');
  addProposal('schedule', {
    id: '#S-001',
    title: `Áp dụng lịch sạc tối ưu từ ${filename} — 4 điều chỉnh`,
    reasoning: '2 xung đột trạm giải quyết, VF-11 & VF-12 sạc đêm bổ sung. Tất cả xe đủ SOC đúng giờ.',
    outcome: '12/12 xe sẵn sàng · 0 xung đột trạm · Tiết kiệm ước tính ₫340K chi phí diesel fallback',
    risk: 'LOW',
    confidence: 92,
    votes: [{ id:'monitor', yes:true }, { id:'manage', yes:true }, { id:'schedule', yes:true }],
  });
}

// ── LIVE SIMULATION ──────────────────────────────────────────
export function addThinkingCycle() {
  const activeAgents = ['schedule', 'monitor', 'manage'];
  const agId = activeAgents[Math.floor(Math.random() * activeAgents.length)];

  if (Math.random() < 0.4) {
    addTyping(agId);
    setTimeout(async () => {
      removeTyping(agId);
      const richOpts = [
        () => addRichMsg('monitor', 'Cập nhật realtime — SOC và vị trí:', makeStats([
          { label:'VF-08 SOC',    val:'28%',  color:'#ff3366', sub:'Cần sạc' },
          { label:'ETA CP-07',   val:'14:02', color:'#00ff88', sub:'Nếu reroute' },
          { label:'Hàng đợi CP-03', val:'45ph', color:'#ff3366', sub:'Đang tăng' },
        ])),
        () => addRichMsg('monitor', null, makeRings('SOC Fleet — Xe đang trên tuyến', [
          { label:'VF-03', val:72, icon:'✓'  }, { label:'VF-08', val:28, icon:'🔴' },
          { label:'VF-11', val:19, icon:'⚠'  }, { label:'VF-05', val:81, icon:'✓'  },
        ])),
        () => addRichMsg('manage', 'Cập nhật trạng thái alert và liên lạc:', makeTimeline('Alert Log', [
          { time: now(), msg:'GSVT đã xem cảnh báo reroute VF-08',        color:'#00ff88' },
          { time: now(), msg:'CP-07 xác nhận slot sẵn sàng cho VF-08',    color:'#00d4ff' },
          { time: now(), msg:'VF-11 SOC 19% — theo dõi thêm CP-06',       color:'#ffbb00' },
        ])),
      ];
      await richOpts[Math.floor(Math.random() * richOpts.length)]();
    }, 1200);
    return;
  }

  const msgs = [
    ['monitor',  'all',     'Cập nhật: VF-08 SOC ổn định 28%, đang giảm tốc chuẩn bị rẽ. GPS xác nhận hướng CP-07 nếu được phê duyệt.'],
    ['schedule', 'all',     'CP-07 vẫn 0 hàng đợi. Slot giữ cho VF-08 trong <strong style="color:#ffbb00">8 phút</strong> tới. Đề nghị phê duyệt sớm.'],
    ['manage',   'monitor', 'GSVT Tuấn đã phản hồi: đang xem xét. Tài xế Hùng xác nhận nhận được cảnh báo.'],
    ['monitor',  'all',     '⚠ VF-11 SOC xuống còn <strong style="color:#ff3366">17%</strong>. Khuyến nghị ưu tiên sạc tại CP-06 trước tuyến 14:45.'],
    ['schedule', 'all',     'Lịch sạc đã tự động điều chỉnh: VF-11 → CP-06 lúc 14:05, VF-08 → CP-07 lúc 14:02 (chờ phê duyệt).'],
  ];
  const [from, to, text] = msgs[Math.floor(Math.random() * msgs.length)];
  addTyping(from);
  setTimeout(() => { removeTyping(from); addMsg(from, to, text); }, 1200);
}
