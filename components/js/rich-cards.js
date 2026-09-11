// ── RICH CARD BUILDERS ───────────────────────────────────────

export function socColor(s) {
  return s >= 60 ? '#00ff88' : s >= 25 ? '#ffbb00' : '#ff3366';
}

// Stats row
export function makeStats(items) {
  const cols = items.length <= 3 ? items.length : 4;
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">📊 Thống kê tổng hợp</span><span class="rich-tag">LIVE</span></div>
    <div class="rich-body"><div class="r-stats" style="grid-template-columns:repeat(${cols},1fr)">
      ${items.map(i => `<div class="r-stat">
        <div class="r-stat-label">${i.label}</div>
        <div class="r-stat-val" style="color:${i.color || 'var(--n)'};text-shadow:0 0 8px ${i.color || '#00ff88'}40">${i.val}</div>
        ${i.sub ? `<div class="r-stat-sub">${i.sub}</div>` : ''}
      </div>`).join('')}
    </div></div>
  </div>`;
}

// Bar chart
export function makeBarChart(title, rows, color) {
  const max = Math.max(...rows.map(r => r.val));
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">📶 ${title}</span><span class="rich-tag">Chart</span></div>
    <div class="rich-body"><div class="r-barchart">
      ${rows.map(r => {
        const c   = color || socColor(r.val);
        const pct = (r.val / max * 100).toFixed(0);
        return `<div class="r-bar-row">
          <div class="r-bar-lbl">${r.label}</div>
          <div class="r-bar-track"><div class="r-bar-fill" data-w="${pct}%" style="width:0%;background:${c};box-shadow:0 0 4px ${c}60"></div></div>
          <div class="r-bar-val" style="color:${c}">${r.val}${r.unit || '%'}</div>
        </div>`;
      }).join('')}
    </div></div>
  </div>`;
}

// SVG line / area chart
export function makeLineChart(title, data, color = '#00ff88') {
  const W = 460, H = 90, pad = 8;
  const max = Math.max(...data.map(d => d.v)), min = 0;
  const pts = data.map((d, i) => {
    const x = pad + i / (data.length - 1) * (W - pad * 2);
    const y = H - pad - (d.v - min) / (max - min || 1) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaClose = `${(pad + (data.length - 1) / (data.length - 1) * (W - pad * 2)).toFixed(1)},${H} ${pad},${H}`;
  const labels    = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map(d => d.l);
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">📈 ${title}</span><span class="rich-tag">Time Series</span></div>
    <div class="rich-body" style="padding:10px 12px">
      <div class="r-svg-wrap">
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="height:${H}px">
          <defs>
            <linearGradient id="lg${color.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${color}" stop-opacity=".25"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${Array.from({ length: 5 }, (_, i) => {
            const y = pad + (i / 4) * (H - pad * 2);
            return `<line x1="${pad}" y1="${y.toFixed(0)}" x2="${W - pad}" y2="${y.toFixed(0)}" stroke="rgba(42,42,58,.6)" stroke-width="1"/>`;
          }).join('')}
          <polygon points="${pts} ${areaClose}" fill="url(#lg${color.replace('#', '')})" />
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 3px ${color})"/>
          ${data.map((d, i) => {
            const x = pad + i / (data.length - 1) * (W - pad * 2);
            const y = H - pad - (d.v - min) / (max - min || 1) * (H - pad * 2);
            return d.highlight ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}" style="filter:drop-shadow(0 0 4px ${color})"/>` : '';
          }).join('')}
        </svg>
      </div>
      <div class="r-chart-labels">${labels.map(l => `<span>${l}</span>`).join('')}</div>
    </div>
  </div>`;
}

// Donut chart
export function makeDonut(title, items) {
  const total = items.reduce((s, i) => s + i.val, 0);
  let offset  = 0;
  const r = 38, circ = 2 * Math.PI * r;
  const segs = items.map(i => {
    const len = (i.val / total) * circ;
    const seg = `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${i.color}" stroke-width="10"
      stroke-dasharray="${len.toFixed(1)} ${circ.toFixed(1)}"
      stroke-dashoffset="${(-offset).toFixed(1)}"
      transform="rotate(-90 50 50)" style="filter:drop-shadow(0 0 3px ${i.color}60)"/>`;
    offset += len;
    return seg;
  }).join('');
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">◎ ${title}</span><span class="rich-tag">Donut</span></div>
    <div class="rich-body"><div class="r-donut-wrap">
      <svg viewBox="0 0 100 100" style="width:90px;height:90px;flex-shrink:0">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(42,42,58,.6)" stroke-width="10"/>
        ${segs}
        <text x="50" y="46" text-anchor="middle" font-family="Orbitron" font-size="13" font-weight="900" fill="var(--fg)">${total}</text>
        <text x="50" y="57" text-anchor="middle" font-family="Share Tech Mono" font-size="6" fill="var(--muted-fg)">TOTAL</text>
      </svg>
      <div class="r-donut-legend">
        ${items.map(i => `<div class="r-donut-item">
          <div class="r-donut-swatch" style="background:${i.color}"></div>
          <span class="r-donut-name">${i.label}</span>
          <span class="r-donut-pct" style="color:${i.color}">${i.val} <span style="color:var(--muted-fg)">(${(i.val / total * 100).toFixed(0)}%)</span></span>
        </div>`).join('')}
      </div>
    </div></div>
  </div>`;
}

// Heatmap grid
export function makeHeatmap(title, cells, cols = 4) {
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">🔥 ${title}</span><span class="rich-tag">Heatmap</span></div>
    <div class="rich-body">
      <div class="r-heatmap" style="grid-template-columns:repeat(${cols},1fr)">
        ${cells.map(c => {
          const col   = socColor(c.val);
          const alpha = 0.1 + (c.val / 100) * 0.35;
          return `<div class="r-hm-cell" style="background:rgba(${c.val >= 60 ? '0,255,136' : c.val >= 25 ? '255,187,0' : '255,51,102'},${alpha.toFixed(2)});border:1px solid ${col}40" title="${c.id}: ${c.val}%">
            <div class="r-hm-id" style="color:${col}">${c.id}</div>
            <div class="r-hm-val" style="color:${col}">${c.val}<span style="font-size:6px">%</span></div>
            ${c.icon ? `<div style="font-size:8px">${c.icon}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;font-size:7px;color:var(--muted-fg)">
        <span>🟢 ≥60% Tốt</span><span>🟡 25–59% TB</span><span>🔴 &lt;25% Thấp</span>
      </div>
    </div>
  </div>`;
}

// Video card with CSS route visualization
export function makeVideo(title, duration, tags = []) {
  return `<div class="rich-card">
    <div class="rich-video r-video" onclick="this.querySelector('.r-play').style.display='none';this.querySelector('.r-playing').style.display='flex'">
      <div class="r-video-thumb r-img-content">
        <div class="r-video-bg"></div>
        <div class="r-video-scanlines"></div>
        <svg viewBox="0 0 400 140" style="position:absolute;inset:0;width:100%;height:100%;opacity:.6">
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#00ff88"/>
            </linearGradient>
          </defs>
          <path d="M40,70 C80,30 120,110 180,60 C220,20 260,90 320,50 C350,35 370,55 380,70" fill="none" stroke="url(#routeGrad)" stroke-width="2" stroke-dasharray="4,3" style="filter:drop-shadow(0 0 4px #00ff88)"/>
          <path d="M40,90 C90,120 150,50 220,100 C270,130 310,80 380,70" fill="none" stroke="#cc44ff" stroke-width="1.5" stroke-dasharray="3,4" opacity=".6"/>
          <rect x="25" y="60" width="20" height="20" rx="2" fill="rgba(0,255,136,.2)" stroke="#00ff88" stroke-width="1"/>
          <text x="35" y="73" text-anchor="middle" font-size="7" fill="#00ff88">D</text>
          <circle cx="180" cy="60" r="4" fill="#00d4ff" style="filter:drop-shadow(0 0 4px #00d4ff)"/>
          <circle cx="320" cy="50" r="4" fill="#00ff88" style="filter:drop-shadow(0 0 4px #00ff88)"/>
          <circle cx="220" cy="100" r="4" fill="#ffbb00" style="filter:drop-shadow(0 0 4px #ffbb00)"/>
          <polygon points="370,62 380,55 380,65" fill="#ff3366" opacity=".8"/>
          ${Array.from({ length: 6 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="140" stroke="rgba(42,42,58,.2)" stroke-width="1"/>`).join('')}
          ${Array.from({ length: 4 }, (_, i) => `<line x1="0" y1="${i * 46}" x2="400" y2="${i * 46}" stroke="rgba(42,42,58,.2)" stroke-width="1"/>`).join('')}
        </svg>
        <div class="r-play">▶</div>
        <div class="r-playing" style="display:none;flex-direction:column;align-items:center;gap:6px;z-index:5">
          <div style="font-size:9px;letter-spacing:.15em;color:var(--n)">▶ PLAYING</div>
          <div style="width:120px;height:2px;background:var(--muted);position:relative">
            <div style="height:100%;width:0%;background:var(--n);animation:progress-play 60s linear forwards"></div>
          </div>
        </div>
        <div class="r-video-badge"><span class="badge bg-c">REPLAY</span></div>
      </div>
      <div class="r-video-meta">
        <div class="r-video-title">▶ ${title}</div>
        <div style="display:flex;gap:6px;align-items:center">
          ${tags.map(t => `<span class="badge bg-m">${t}</span>`).join('')}
          <span class="r-video-dur">${duration}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// Data table
export function makeTable(title, headers, rows) {
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">☍ ${title}</span><span class="rich-tag">Table</span></div>
    <div style="overflow-x:auto">
      <table class="r-table">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td style="${i === 0 ? 'color:var(--muted-fg);font-family:Share Tech Mono,monospace' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

// Alert timeline
export function makeTimeline(title, items) {
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">⚡ ${title}</span><span class="rich-tag">Timeline</span></div>
    <div class="rich-body"><div class="r-timeline">
      ${items.map(i => `<div class="r-tl-item">
        <div class="r-tl-dot-wrap"><div class="r-tl-dot" style="background:${i.color}20;color:${i.color};box-shadow:0 0 4px ${i.color}60"></div></div>
        <div class="r-tl-body">
          <div class="r-tl-time">${i.time}</div>
          <div class="r-tl-msg">${i.msg}</div>
        </div>
      </div>`).join('')}
    </div></div>
  </div>`;
}

// SOC ring gauges
export function makeRings(title, items) {
  const circ = 2 * Math.PI * 16;
  return `<div class="rich-card">
    <div class="rich-header"><span class="rich-title">◎ ${title}</span><span class="rich-tag">SOC</span></div>
    <div class="rich-body"><div class="r-ring-wrap">
      ${items.map(it => {
        const c    = socColor(it.val);
        const fill = (it.val / 100) * circ;
        return `<div class="r-ring-cell">
          <svg viewBox="0 0 40 40" style="width:48px;height:48px">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(42,42,58,.7)" stroke-width="4"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="${c}" stroke-width="4"
              stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"
              stroke-dashoffset="${(circ * 0.25).toFixed(1)}"
              style="filter:drop-shadow(0 0 3px ${c}80)" transform="rotate(-90 20 20)"/>
            <text x="20" y="23" text-anchor="middle" font-family="Orbitron" font-size="8" font-weight="900" fill="${c}">${it.val}</text>
          </svg>
          <div class="r-ring-label" style="color:${c}">${it.label}</div>
          ${it.icon ? `<div style="font-size:8px">${it.icon}</div>` : ''}
        </div>`;
      }).join('')}
    </div></div>
  </div>`;
}
