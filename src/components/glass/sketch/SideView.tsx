interface SideViewProps {
  partitionHeight: number;
  partitionCount: number;
  index: number;
}

export default function SideView({
  partitionHeight,
  partitionCount,
  index
}: SideViewProps) {
  const scale = 0.12;
  const svgWidth = 350;
  const svgHeight = 280;
  const glassThickness = 12;
  
  const wallHeight = partitionHeight * scale;
  const depth = 100;
  
  const offsetX = (svgWidth - depth) / 2;
  const offsetY = 30;
  const maxHeight = svgHeight - 80;
  const actualHeight = Math.min(wallHeight, maxHeight);

  return (
    <svg 
      key={`side-${index}`}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={`side-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: '#dbeafe', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 0.7 }} />
        </linearGradient>
      </defs>

      <text
        x={svgWidth / 2}
        y={18}
        textAnchor="middle"
        fill="#1e40af"
        fontSize="13"
        fontWeight="700"
      >
        Вид сбоку {partitionCount > 1 ? `(секция ${index + 1})` : ''}
      </text>

      <rect 
        x={offsetX} 
        y={offsetY} 
        width={glassThickness} 
        height={actualHeight}
        fill={`url(#side-gradient-${index})`}
        stroke="#2563eb"
        strokeWidth="2.5"
        rx="1"
      />

      <rect 
        x={offsetX + glassThickness} 
        y={offsetY} 
        width={depth - glassThickness} 
        height={actualHeight}
        fill="#f0f9ff"
        stroke="#93c5fd"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        opacity="0.5"
      />

      <line
        x1={offsetX}
        y1={offsetY + actualHeight + 12}
        x2={offsetX + depth}
        y2={offsetY + actualHeight + 12}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-side)"
        markerEnd="url(#arrow-end-side)"
      />
      <text
        x={offsetX + depth / 2}
        y={offsetY + actualHeight + 26}
        textAnchor="middle"
        fill="#1e293b"
        fontSize="10"
        fontWeight="500"
      >
        Глубина {depth} мм
      </text>

      <line
        x1={offsetX - 12}
        y1={offsetY}
        x2={offsetX - 12}
        y2={offsetY + actualHeight}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-side)"
        markerEnd="url(#arrow-end-side)"
      />
      <text
        x={offsetX - 22}
        y={offsetY + actualHeight / 2}
        textAnchor="middle"
        fill="#1e293b"
        fontSize="10"
        fontWeight="500"
        transform={`rotate(-90, ${offsetX - 22}, ${offsetY + actualHeight / 2})`}
      >
        {partitionHeight} мм ({(partitionHeight / 10).toFixed(0)} см)
      </text>

      <text
        x={offsetX + glassThickness / 2}
        y={offsetY + actualHeight / 2}
        textAnchor="middle"
        fill="#1e40af"
        fontSize="9"
        fontWeight="600"
        transform={`rotate(-90, ${offsetX + glassThickness / 2}, ${offsetY + actualHeight / 2})`}
      >
        Стекло
      </text>

      <defs>
        <marker id="arrow-start-side" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 0 2 L 4 4 L 0 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
        <marker id="arrow-end-side" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 8 2 L 4 4 L 8 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
      </defs>
    </svg>
  );
}
