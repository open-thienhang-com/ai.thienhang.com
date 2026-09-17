// ── AGENT DEFINITIONS ────────────────────────────────────────
export const AGENTS = {
  nexus:    { id:'nexus',    name:'NEXUS',        role:'Orchestrator',       icon:'◈', color:'#00ff88', bg:'rgba(0,255,136,.12)',  border:'rgba(0,255,136,.25)' },
  schedule: { id:'schedule', name:'Lập lịch sạc', role:'Schedule · Optimize',icon:'⏱', color:'#ffbb00', bg:'rgba(255,187,0,.08)',  border:'rgba(255,187,0,.2)'   },
  monitor:  { id:'monitor',  name:'Giám sát',      role:'Telemetry · SOC',   icon:'◉', color:'#88ff44', bg:'rgba(136,255,68,.08)', border:'rgba(136,255,68,.2)'  },
  manage:   { id:'manage',   name:'Quản lí',       role:'Control · API',     icon:'⬡', color:'#cc44ff', bg:'rgba(204,68,255,.08)', border:'rgba(204,68,255,.2)'  },
};

// agent status: active / idle / thinking
export const STATUS = {
  nexus:'active', schedule:'active', monitor:'thinking', manage:'active',
};
