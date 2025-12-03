interface TopViewProps {
  partitionWidth: number;
  partitionCount: number;
  sectionWidths: number[];
}

export default function TopView({
  partitionWidth,
  partitionCount,
  sectionWidths
}: TopViewProps) {
  const scale = 0.12;
  const svgWidth = 350;
  const svgHeight = 280;
  const glassThickness = 12;
  
  const wallWidth = partitionWidth * scale;
  const depth = 100;
  const hasCustomWidths = sectionWidths.length === partitionCount && sectionWidths.some(w => w > 0);
  const scaledSectionWidths = hasCustomWidths 
    ? sectionWidths.map(w => w * scale)
    : Array(partitionCount).fill(wallWidth / partitionCount);
  
  const offsetX = (svgWidth - wallWidth) / 2;
  const offsetY = 50;

  return (
    <svg 
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="top-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
        Вид сверху
      </text>

      {Array.from({ length: partitionCount }, (_, i) => {
        const sectionX = i === 0 ? offsetX : offsetX + scaledSectionWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
        const sectionW = scaledSectionWidths[i];
        
        return (
          <g key={`section-${i}`}>
            <rect 
              x={sectionX} 
              y={offsetY} 
              width={sectionW} 
              height={depth}
              fill="url(#top-gradient)"
              stroke="#2563eb"
              strokeWidth="2.5"
              rx="1"
            />
            
            <rect 
              x={sectionX} 
              y={offsetY} 
              width={sectionW} 
              height={glassThickness}
              fill="#93c5fd"
              opacity="0.8"
            />
            
            <text
              x={sectionX + sectionW / 2}
              y={offsetY + depth / 2}
              textAnchor="middle"
              fill="#1e40af"
              fontSize="10"
              fontWeight="600"
            >
              {i + 1}
            </text>
            
            {hasCustomWidths && sectionWidths[i] > 0 && (
              <text
                x={sectionX + sectionW / 2}
                y={offsetY + depth / 2 + 12}
                textAnchor="middle"
                fill="#0369a1"
                fontSize="8"
                fontWeight="500"
              >
                {sectionWidths[i]} мм
              </text>
            )}
          </g>
        );
      })}

      <line
        x1={offsetX}
        y1={offsetY + depth + 15}
        x2={offsetX + wallWidth}
        y2={offsetY + depth + 15}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-top)"
        markerEnd="url(#arrow-end-top)"
      />
      <text
        x={offsetX + wallWidth / 2}
        y={offsetY + depth + 30}
        textAnchor="middle"
        fill="#1e293b"
        fontSize="10"
        fontWeight="500"
      >
        {partitionWidth} мм ({(partitionWidth / 10).toFixed(0)} см)
      </text>

      <line
        x1={offsetX - 12}
        y1={offsetY}
        x2={offsetX - 12}
        y2={offsetY + depth}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-top)"
        markerEnd="url(#arrow-end-top)"
      />
      <text
        x={offsetX - 22}
        y={offsetY + depth / 2}
        textAnchor="middle"
        fill="#1e293b"
        fontSize="10"
        fontWeight="500"
        transform={`rotate(-90, ${offsetX - 22}, ${offsetY + depth / 2})`}
      >
        Глубина {depth} мм
      </text>

      {partitionCount > 1 && !hasCustomWidths && (
        <text
          x={svgWidth / 2}
          y={offsetY + depth + 50}
          textAnchor="middle"
          fill="#475569"
          fontSize="9"
          fontStyle="italic"
        >
          {partitionCount} {partitionCount === 1 ? 'секция' : partitionCount < 5 ? 'секции' : 'секций'} по {(partitionWidth / partitionCount).toFixed(0)} мм
        </text>
      )}

      <defs>
        <marker id="arrow-start-top" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 0 2 L 4 4 L 0 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
        <marker id="arrow-end-top" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 8 2 L 4 4 L 8 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
      </defs>
    </svg>
  );
}
