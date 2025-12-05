interface FrontViewProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth: number;
  doorHeight: number;
  hasDoor: boolean;
  doorPosition?: 'center' | 'left';
  doorLeftOffset?: number;
}

export default function FrontView({
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  hasDoor,
  doorPosition = 'center',
  doorLeftOffset = 0
}: FrontViewProps) {
  const scale = 0.12;
  const svgWidth = 350;
  const svgHeight = 280;
  
  const wallWidth = partitionWidth * scale;
  const wallHeight = partitionHeight * scale;
  const dWidth = doorWidth * scale;
  const dHeight = doorHeight * scale;
  
  const offsetX = (svgWidth - wallWidth) / 2;
  const offsetY = 30;
  const maxHeight = svgHeight - 80;
  const actualHeight = Math.min(wallHeight, maxHeight);
  const heightScale = actualHeight / wallHeight;

  return (
    <svg 
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      className="w-full h-full"
    >
      <defs>
        <pattern id="glass-pattern-front" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#93c5fd" opacity="0.3"/>
        </pattern>
        <linearGradient id="glass-gradient-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#dbeafe', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.8 }} />
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
        Вид спереди
      </text>

      <rect 
        x={offsetX} 
        y={offsetY} 
        width={wallWidth} 
        height={actualHeight}
        fill="url(#glass-gradient-front)"
        stroke="#2563eb"
        strokeWidth="2.5"
        rx="2"
      />
      
      <rect 
        x={offsetX} 
        y={offsetY} 
        width={wallWidth} 
        height={actualHeight}
        fill="url(#glass-pattern-front)"
      />

      {hasDoor && dWidth > 0 && dHeight > 0 && (() => {
        const doorX = doorPosition === 'center' 
          ? offsetX + (wallWidth - dWidth) / 2
          : offsetX + (doorLeftOffset * scale);
        
        return (
          <>
            <rect 
              x={doorX} 
              y={offsetY + actualHeight - (dHeight * heightScale)}
              width={dWidth} 
              height={dHeight * heightScale}
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,2"
              rx="2"
            />
            
            <line
              x1={doorX + dWidth / 2}
              y1={offsetY + actualHeight - (dHeight * heightScale)}
              x2={doorX + dWidth / 2}
              y2={offsetY + actualHeight}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />

            <text
              x={doorX + dWidth / 2}
              y={offsetY + actualHeight - (dHeight * heightScale) / 2}
              textAnchor="middle"
              fill="#92400e"
              fontSize="11"
              fontWeight="600"
            >
              Дверь
            </text>
            
            {doorPosition === 'left' && doorLeftOffset > 0 && (
              <>
                <line
                  x1={offsetX}
                  y1={offsetY + actualHeight + 50}
                  x2={doorX}
                  y2={offsetY + actualHeight + 50}
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                />
                <text
                  x={(offsetX + doorX) / 2}
                  y={offsetY + actualHeight + 61}
                  textAnchor="middle"
                  fill="#7e22ce"
                  fontSize="9"
                  fontWeight="500"
                >
                  Отступ: {doorLeftOffset} мм
                </text>
              </>
            )}
          </>
        );
      })()}

      <line
        x1={offsetX}
        y1={offsetY + actualHeight + 12}
        x2={offsetX + wallWidth}
        y2={offsetY + actualHeight + 12}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-front)"
        markerEnd="url(#arrow-end-front)"
      />
      <text
        x={offsetX + wallWidth / 2}
        y={offsetY + actualHeight + 26}
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
        y2={offsetY + actualHeight}
        stroke="#64748b"
        strokeWidth="1.5"
        markerStart="url(#arrow-start-front)"
        markerEnd="url(#arrow-end-front)"
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

      {hasDoor && dWidth > 0 && dHeight > 0 && (() => {
        const doorX = doorPosition === 'center' 
          ? offsetX + (wallWidth - dWidth) / 2
          : offsetX + (doorLeftOffset * scale);
        
        return (
          <>
            <line
              x1={doorX}
              y1={offsetY + actualHeight + 35}
              x2={doorX + dWidth}
              y2={offsetY + actualHeight + 35}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />
            <text
              x={doorX + dWidth / 2}
              y={offsetY + actualHeight + 46}
              textAnchor="middle"
              fill="#92400e"
              fontSize="9"
              fontWeight="500"
            >
              Дверь: {doorWidth}×{doorHeight} мм
            </text>
          </>
        );
      })()}

      <defs>
        <marker id="arrow-start-front" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 0 2 L 4 4 L 0 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
        <marker id="arrow-end-front" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 8 2 L 4 4 L 8 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
        </marker>
      </defs>
    </svg>
  );
}