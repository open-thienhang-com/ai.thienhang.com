// ── AGENT DEFINITIONS ────────────────────────────────────────
export const AGENTS = {
  nexus:  { id:'nexus',  name:'Green Flash',     role:'Orchestrator',     icon:'◈', color:'#00ff88', bg:'rgba(0,255,136,.12)',  border:'rgba(0,255,136,.25)' },
  data:   { id:'data',   name:'Data Agent',      role:'Query · Retrieve', icon:'⟐', color:'#00d4ff', bg:'rgba(0,212,255,.1)',   border:'rgba(0,212,255,.25)' },
  fleet:  { id:'fleet',  name:'Fleet Monitor',   role:'Telemetry · SOC',  icon:'◉', color:'#88ff44', bg:'rgba(136,255,68,.08)', border:'rgba(136,255,68,.2)'  },
  route:  { id:'route',  name:'Route Optimizer', role:'Logistics · Plan', icon:'⟴', color:'#ffbb00', bg:'rgba(255,187,0,.08)',  border:'rgba(255,187,0,.2)'   },
  engine: { id:'engine', name:'Decision Engine', role:'Reason · Decide',  icon:'⬡', color:'#cc44ff', bg:'rgba(204,68,255,.08)', border:'rgba(204,68,255,.2)'  },
  cms:    { id:'cms',    name:'CMS Connector',   role:'API · OCPP',       icon:'☍', color:'#4499ff', bg:'rgba(68,153,255,.08)', border:'rgba(68,153,255,.2)'  },
  report: { id:'report', name:'Report Agent',    role:'Insight · Finance',icon:'📊', color:'#ff6622', bg:'rgba(255,102,34,.08)', border:'rgba(255,102,34,.2)'  },
};

// agent status: active / idle / thinking
export const STATUS = {
  nexus:'active', data:'active', fleet:'thinking',
  route:'active', engine:'active', cms:'idle', report:'idle',
};
