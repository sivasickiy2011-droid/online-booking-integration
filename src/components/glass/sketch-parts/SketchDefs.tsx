export default function SketchDefs() {
  return (
    <defs>
      {/* Градиенты */}
      <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 0.5 }} />
        <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 0.3 }} />
      </linearGradient>
      <linearGradient id="door-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 0.85 }} />
        <stop offset="100%" style={{ stopColor: '#fde047', stopOpacity: 0.6 }} />
      </linearGradient>
      <linearGradient id="wall-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#cbd5e1', stopOpacity: 0.9 }} />
        <stop offset="100%" style={{ stopColor: '#94a3b8', stopOpacity: 0.7 }} />
      </linearGradient>
      
      {/* Стрелки для размеров */}
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
        <polygon points="0,0 10,5 0,10" fill="#1e293b" />
      </marker>
    </defs>
  );
}
