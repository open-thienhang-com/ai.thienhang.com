import { STATUS } from './agents.js';
import {
  sleep, addMsg, addSysMsg, addTyping, removeTyping,
  addProposal, addDecision, addRichMsg, now,
} from './messages.js';
import { renderRoster, renderCouncilBar } from './roster.js';
import {
  makeStats, makeBarChart, makeLineChart, makeDonut,
  makeHeatmap, makeVideo, makeTable, makeTimeline, makeRings,
} from './rich-cards.js';

// ── PRE-POPULATED CONVERSATION ───────────────────────────────
export async function initConversation() {
  addSysMsg('Multi-agent session khởi tạo · 11/09/2026 · 09:14:02');
  await addMsg('nexus', 'all', 'Council đã kết nối. Phát hiện <strong style="color:var(--red)">2 sự kiện ưu tiên</strong> cần xử lý: VF-07 SOC anomaly và L3 phase overload. Kích hoạt Fleet Monitor và Data Agent để điều tra.', 0);

  await sleep(600);
  addSysMsg('Fleet Monitor đang phân tích telemetry...');
  addTyping('fleet');
  await sleep(1400);
  removeTyping('fleet');
  await addMsg('fleet', 'all', '⚠ VF-07 SOC <strong style="color:var(--red)">đóng băng tại 41%</strong> trong 38 phút liên tục. T-Box báo delta năng lượng = 0. Xe đang dừng tại Bay 4 / CP-04. Phiên vẫn active nhưng không có transfer.', 0);

  await sleep(500);
  addTyping('data');
  await sleep(1200);
  removeTyping('data');
  await addMsg('data', 'fleet', 'Xác nhận với <span class="mention" style="color:var(--f)">@Fleet Monitor</span>. OCPP log CP-04: MeterValues cuối lúc 09:07:51 — <strong>0 kW transfer</strong>. StatusNotification = <strong style="color:var(--amber)">SuspendedEV</strong>. Session TXN-0847 vẫn open.', 0);

  await sleep(400);
  addTyping('cms');
  await sleep(1000);
  removeTyping('cms');
  STATUS.cms = 'active'; renderRoster();
  await addMsg('cms', 'all', 'Đã kiểm tra <strong style="color:var(--c)">GHN CMS Dashboard</strong> (AMPECO) — CP-04 hiển thị trạng thái "Preparing". <span style="color:var(--red)">Mismatch</span> với trạng thái vehicle. Gợi ý: terminate session và khởi động lại trên trụ khác.', 0);

  await sleep(500);
  addTyping('route');
  await sleep(900);
  removeTyping('route');
  await addMsg('route', 'engine', 'CP-05 đang idle, capacity 50kW. VF-07 cần ~22kWh để đạt 80% target. <strong style="color:var(--r)">ETA: 52 phút</strong>. Đề xuất chuyển sang CP-05 để tối ưu thời gian.', 0);

  await sleep(600);
  addTyping('engine');
  await sleep(1600);
  removeTyping('engine');
  addProposal('engine', {
    id: '#P-001',
    title: 'Terminate CP-04 session VF-07 → Restart trên CP-05 (50kW)',
    reasoning: 'CP-04 SuspendedEV 38min, 0kW transfer. Session stuck.',
    outcome: 'VF-07 đạt 80% SOC trong 52 phút · CP-04 available cho xe khác',
    risk: 'LOW',
    confidence: 94,
    votes: [{ id:'fleet', yes:true }, { id:'route', yes:true }, { id:'cms', yes:true }, { id:'data', abstain:true }],
  });

  await sleep(800);
  addSysMsg('3/4 agents đồng thuận · Decision Engine chờ Operator');

  await sleep(400);
  addTyping('fleet');
  await sleep(900);
  removeTyping('fleet');
  await addMsg('fleet', 'engine', 'Lưu ý thêm: <strong style="color:var(--amber)">VF-11</strong> tại CP-08 chỉ còn 8% SOC — cần 80% cho tuyến chiều. Nếu CP-05 đã occupied, VF-11 cần CP-05 ưu tiên hơn VF-07.', 0);

  await sleep(300);
  addTyping('report');
  await sleep(1100);
  removeTyping('report');
  STATUS.report = 'active'; renderRoster(); renderCouncilBar();
  addProposal('report', {
    id: '#P-002',
    title: 'Tái phân bổ thứ tự sạc: VF-11 (CP-05) → VF-07 (CP-01 khi free)',
    reasoning: 'VF-11 SOC 8% — không đủ cho tuyến chiều 14:00. VF-07 SOC 41% đủ chạy nếu cần.',
    outcome: 'Đảm bảo đủ xe cho tuyến chiều · Cost/km tối ưu hơn vs diesel fallback',
    risk: 'LOW',
    confidence: 88,
    votes: [{ id:'route', yes:true }, { id:'engine', yes:true }, { id:'fleet', yes:true }, { id:'cms', abstain:true }],
  });

  await sleep(800);
  addSysMsg('Agents đang tổng hợp dữ liệu và tạo báo cáo...');
  initRichMessages();
}

// ── RICH CONVERSATION ────────────────────────────────────────
export async function initRichMessages() {
  await sleep(400);

  // Report Agent: Stats + Bar chart
  addTyping('report');
  await sleep(1300);
  removeTyping('report');
  await addRichMsg('report',
    'Tổng hợp hiệu suất fleet hôm nay. Đây là snapshot toàn bộ chỉ số:',
    makeStats([
      { label:'Fleet Online', val:'12/15', color:'#00ff88', sub:'↑ 3 vs hôm qua' },
      { label:'Đang Sạc',     val:'3',     color:'#00d4ff', sub:'CP-02, CP-06, CP-08' },
      { label:'Avg SOC',      val:'61%',   color:'#ffbb00', sub:'Target: >70%' },
      { label:'Tiết kiệm',    val:'₫2.4M', color:'#cc44ff', sub:'vs diesel hôm nay' },
    ]) +
    makeBarChart('Fleet SOC theo xe', [
      { label:'VF-01', val:82 }, { label:'VF-02', val:34 }, { label:'VF-03', val:45 },
      { label:'VF-04', val:51 }, { label:'VF-05', val:78 }, { label:'VF-06', val:29 },
      { label:'VF-07', val:41 }, { label:'VF-08', val:12 }, { label:'VF-09', val:65 },
      { label:'VF-10', val:88 }, { label:'VF-11', val:8  }, { label:'VF-12', val:72 },
    ])
  );

  // Fleet Monitor: Heatmap
  addTyping('fleet');
  await sleep(900);
  removeTyping('fleet');
  await addRichMsg('fleet',
    'Visual SOC heatmap toàn đội — màu sắc phản ánh mức độ ưu tiên sạc:',
    makeHeatmap('Fleet SOC Heatmap — 11/09/2026 09:22', [
      { id:'VF-01', val:82 }, { id:'VF-02', val:34 }, { id:'VF-03', val:45, icon:'⚡' },
      { id:'VF-04', val:51 }, { id:'VF-05', val:78 }, { id:'VF-06', val:29 },
      { id:'VF-07', val:41, icon:'⚠' }, { id:'VF-08', val:12, icon:'🔴' }, { id:'VF-09', val:65, icon:'⚡' },
      { id:'VF-10', val:88 }, { id:'VF-11', val:8, icon:'⚡' }, { id:'VF-12', val:72 },
    ])
  );

  await sleep(700);

  // Data Agent: Line chart + stats
  const hourData = [3,5,8,12,15,18,22,30,45,52,58,142,60,55,50,48,52,68,72,65,55,40,25,12];
  addTyping('data');
  await sleep(1100);
  removeTyping('data');
  await addRichMsg('data',
    'Biểu đồ tiêu thụ điện 24h hôm nay. Spike hiện tại 142kW lúc 11:00 do 3 xe đang sạc đồng thời:',
    makeLineChart('Công suất tiêu thụ theo giờ (kW)',
      hourData.map((v, i) => ({ v, l:`${i}h`, highlight: v === Math.max(...hourData) })),
      '#00d4ff'
    ) +
    makeStats([
      { label:'Hiện tại',    val:'142kW',  color:'#ffbb00', sub:'71% công suất trạm' },
      { label:'Peak hôm nay', val:'142kW', color:'#ff3366', sub:'11:00' },
      { label:'Tổng hôm nay', val:'892kWh',color:'#00d4ff', sub:'↑ 12% vs hôm qua' },
    ])
  );

  await sleep(600);

  // Fleet Monitor: Donut + Rings
  addTyping('fleet');
  await sleep(800);
  removeTyping('fleet');
  await addRichMsg('fleet', null,
    makeDonut('Trạng thái Fleet', [
      { label:'Đang chạy tuyến', val:7, color:'#00ff88' },
      { label:'Đang sạc',        val:3, color:'#00d4ff' },
      { label:'Idle tại Depot',  val:1, color:'#6b7280' },
      { label:'Anomaly / Lỗi',   val:1, color:'#ff3366' },
    ]) +
    makeRings('SOC Realtime — Xe đang sạc', [
      { label:'VF-03', val:45, icon:'⚡' }, { label:'VF-09', val:65, icon:'⚡' },
      { label:'VF-11', val:8,  icon:'🔴' }, { label:'VF-07', val:41, icon:'⚠' },
    ])
  );

  await sleep(700);

  // Route Optimizer: Video + bar chart
  addTyping('route');
  await sleep(1000);
  removeTyping('route');
  await addRichMsg('route',
    'Replay tối ưu hóa tuyến đường buổi chiều. Dựa trên SOC forecast hiện tại, tôi đã tái phân bổ 4 xe để tối ưu chi phí/km:',
    makeVideo('Route Optimization Replay — Buổi chiều 14:00', '2m 14s', ['Tuyến A-B', '4 Xe', 'Tối ưu']) +
    makeBarChart('Ước tính tiết kiệm theo tuyến (₫/km)',
      [
        { label:'Tuyến A', val:2560, unit:'₫' }, { label:'Tuyến B', val:2480, unit:'₫' },
        { label:'Tuyến C', val:2620, unit:'₫' }, { label:'Tuyến D', val:2390, unit:'₫' },
      ],
      '#ffbb00'
    )
  );

  await sleep(600);

  // CMS Connector: Table + Timeline
  addTyping('cms');
  await sleep(1000);
  removeTyping('cms');
  await addRichMsg('cms',
    'Dữ liệu phiên sạc từ AMPECO CMS và log OCPP sự kiện quan trọng hôm nay:',
    makeTable('Phiên sạc đang hoạt động', ['Xe', 'Trụ', 'SOC', 'Công suất', 'ETA 80%', 'Chi phí'], [
      [`<span style="color:var(--n);font-weight:700">VF-03</span>`, 'CP-02', '45%', `<span style="color:var(--n)">50kW</span>`, '+42 phút', '₫114K'],
      [`<span style="color:var(--n);font-weight:700">VF-09</span>`, 'CP-06', '65%', `<span style="color:var(--n)">22kW</span>`, '+65 phút', '₫21K'],
      [`<span style="color:var(--red);font-weight:700">VF-11</span>`, 'CP-08', `<span style="color:var(--red)">8%</span>`, `<span style="color:var(--n)">50kW</span>`, `<span style="color:var(--amber)">+80 phút</span>`, '₫108K'],
      [`<span style="color:var(--amber);font-weight:700">VF-07</span>`, 'CP-04', `<span style="color:var(--amber)">41%⚠</span>`, `<span style="color:var(--red)">0kW</span>`, `<span style="color:var(--red)">STUCK</span>`, '₫0'],
    ]) +
    makeTimeline('OCPP Event Log — Gần nhất', [
      { time:'09:22:14', msg:'CP-02 · StatusNotification · <strong>Charging</strong> · VF-03',              color:'#00ff88' },
      { time:'09:21:58', msg:'CP-06 · MeterValues · <strong>22.1 kW</strong> · VF-09',                     color:'#00d4ff' },
      { time:'09:20:31', msg:'VETC-KBC-02 · OCPI StartSession · <strong>VF-04 OK</strong>',                color:'#4499ff' },
      { time:'09:19:15', msg:'CP-03 · StatusNotification · <strong style="color:var(--red)">Faulted</strong> · timeout', color:'#ff3366' },
      { time:'09:15:10', msg:'CP-04 · Heartbeat missed · <strong style="color:var(--amber)">SuspendedEV</strong>',       color:'#ffbb00' },
    ])
  );

  await sleep(600);

  // Report Agent: Cost comparison
  addTyping('report');
  await sleep(1100);
  removeTyping('report');
  const monthData = [38,42,45,39,41,44,47,43,40,38,36];
  await addRichMsg('report',
    'Phân tích tài chính tháng 9/2026. EV fleet đang tiết kiệm ổn định hơn 65% so với diesel:',
    makeLineChart('Chi phí/km: EV vs Diesel (tháng 9)',
      monthData.map((_, i) => ({ v: 1200 + Math.round(Math.random() * 80 - 40), l:`T${i + 1}`, highlight: i === monthData.length - 1 })),
      '#00ff88'
    ) +
    `<div class="rich-card">
      <div class="rich-header"><span class="rich-title">💰 So sánh EV vs Diesel</span><span class="rich-tag">Tháng 9</span></div>
      <div class="rich-body">
        <div style="margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:8px;color:var(--muted-fg);width:50px">EV (thực)</span>
            <div style="flex:1;height:16px;background:rgba(255,255,255,.05);position:relative;clip-path:polygon(0 3px,3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%)">
              <div class="r-bar-fill" data-w="32%" style="width:0%;height:100%;background:linear-gradient(90deg,rgba(0,255,136,.5),rgba(0,255,136,.2));display:flex;align-items:center;padding-left:6px;font-size:8px;font-weight:700;color:var(--n)">1,240₫/km</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:8px;color:var(--muted-fg);width:50px">Diesel</span>
            <div style="flex:1;height:16px;background:rgba(255,255,255,.05);position:relative;clip-path:polygon(0 3px,3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%)">
              <div class="r-bar-fill" data-w="100%" style="width:0%;height:100%;background:linear-gradient(90deg,rgba(255,51,102,.5),rgba(255,51,102,.2));display:flex;align-items:center;padding-left:6px;font-size:8px;font-weight:700;color:var(--red)">3,800₫/km</div>
            </div>
          </div>
        </div>
        <div style="padding:10px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.2);clip-path:polygon(0 4px,4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:7px;color:var(--muted-fg);letter-spacing:.15em;text-transform:uppercase">Tiết kiệm</div>
            <div style="font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:var(--n);text-shadow:0 0 10px #00ff8840">67.4%</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:7px;color:var(--muted-fg)">Tháng 9/2026</div>
            <div style="font-size:14px;font-weight:700;color:var(--n)">₫26.2M</div>
            <div style="font-size:8px;color:var(--muted-fg)">tổng tiết kiệm được</div>
          </div>
        </div>
      </div>
    </div>`
  );
}

// ── LIVE SIMULATION ──────────────────────────────────────────
export function addThinkingCycle() {
  const activeAgents = ['data', 'fleet', 'route', 'engine', 'cms', 'report'];
  const agId = activeAgents[Math.floor(Math.random() * activeAgents.length)];

  if (Math.random() < 0.4) {
    addTyping(agId);
    setTimeout(async () => {
      removeTyping(agId);
      const richOpts = [
        () => addRichMsg(agId, 'Cập nhật nhanh từ dữ liệu mới nhất:', makeStats([
          { label:'Công suất', val:'142kW',  color:'#ffbb00', sub:'Realtime' },
          { label:'kWh hôm nay', val:'892',  color:'#00d4ff', sub:'Tổng tiêu thụ' },
          { label:'Cost/km',   val:'1,240₫', color:'#00ff88', sub:'↓ Tốt' },
        ])),
        () => addRichMsg(agId, null, makeRings('SOC Update — Xe đang sạc', [
          { label:'VF-03', val:47, icon:'⚡' }, { label:'VF-09', val:67, icon:'⚡' },
          { label:'VF-11', val:11, icon:'🔴' }, { label:'VF-07', val:41, icon:'⚠' },
        ])),
        () => addRichMsg(agId, 'Timeline sự kiện 15 phút qua:', makeTimeline('Recent Events', [
          { time: now(), msg:'Fleet đang ổn định. 10/12 xe trong tầm hoạt động bình thường.', color:'#00ff88' },
          { time: now(), msg:'L3 phase tải giảm về 81% sau khi cân bằng tải.',               color:'#ffbb00' },
          { time: now(), msg:'VF-07 đang chờ chuyển sang CP-05.',                             color:'#00d4ff' },
        ])),
      ];
      await richOpts[Math.floor(Math.random() * richOpts.length)]();
    }, 1200);
    return;
  }

  const msgs = [
    [agId,    'all',    'Phát hiện cập nhật mới từ telemetry. SOC fleet trung bình hiện tại: <strong style="color:var(--n)">68%</strong>. 10/12 xe trong vùng an toàn.'],
    ['data',  'fleet',  'Xác nhận: T-Box VF-07 đã phục hồi kết nối. SOC đang cập nhật theo thời gian thực.'],
    ['route', 'all',    'Đã tối ưu lịch sạc buổi chiều. Dự kiến 8/12 xe đạt >70% SOC trước 13:30.'],
    ['engine','all',    'Phân tích L3 phase overload: <strong style="color:var(--amber)">87% tải</strong>. Đề xuất shift 1 phiên sang thấp điểm để giảm xuống <80%.'],
    ['cms',   'data',   'AMPECO API sync OK. 3 VETC chargers đang hoạt động bình thường. OCPI session count: 18 tháng này.'],
  ];
  const [from, to, text] = msgs[Math.floor(Math.random() * msgs.length)];
  addTyping(from);
  setTimeout(() => { removeTyping(from); addMsg(from, to, text); }, 1200);
}
