interface PartitionSketchProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth?: number;
  doorHeight?: number;
  hasDoor: boolean;
}

export default function PartitionSketch({
  partitionWidth,
  partitionHeight,
  doorWidth = 0,
  doorHeight = 0,
  hasDoor
}: PartitionSketchProps) {
  const scale = 0.15;
  const svgWidth = 400;
  const svgHeight = 300;
  
  const wallWidth = partitionWidth * scale;
  const wallHeight = partitionHeight * scale;
  const dWidth = doorWidth * scale;
  const dHeight = doorHeight * scale;
  
  const offsetX = (svgWidth - wallWidth) / 2;
  const offsetY = (svgHeight - wallHeight) / 2 + 20;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full h-auto"
        style={{ maxHeight: '300px' }}
      >
        <defs>
          <pattern id="glass-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#93c5fd" opacity="0.3"/>
          </pattern>
          <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#dbeafe', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>

        <rect 
          x={offsetX} 
          y={offsetY} 
          width={wallWidth} 
          height={wallHeight}
          fill="url(#glass-gradient)"
          stroke="#2563eb"
          strokeWidth="3"
          rx="2"
        />
        
        <rect 
          x={offsetX} 
          y={offsetY} 
          width={wallWidth} 
          height={wallHeight}
          fill="url(#glass-pattern)"
        />

        {hasDoor && dWidth > 0 && dHeight > 0 && (
          <>
            <rect 
              x={offsetX + (wallWidth - dWidth) / 2} 
              y={offsetY + wallHeight - dHeight}
              width={dWidth} 
              height={dHeight}
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="5,3"
              rx="2"
            />
            
            <line
              x1={offsetX + (wallWidth - dWidth) / 2 + dWidth / 2}
              y1={offsetY + wallHeight - dHeight}
              x2={offsetX + (wallWidth - dWidth) / 2 + dWidth / 2}
              y2={offsetY + wallHeight - dHeight + dHeight}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />

            <text
              x={offsetX + wallWidth / 2}
              y={offsetY + wallHeight - dHeight / 2}
              textAnchor="middle"
              fill="#92400e"
              fontSize="12"
              fontWeight="600"
            >
              Дверь
            </text>
          </>
        )}

        <line
          x1={offsetX}
          y1={offsetY + wallHeight + 15}
          x2={offsetX + wallWidth}
          y2={offsetY + wallHeight + 15}
          stroke="#64748b"
          strokeWidth="1.5"
          markerStart="url(#arrow-start)"
          markerEnd="url(#arrow-end)"
        />
        <text
          x={offsetX + wallWidth / 2}
          y={offsetY + wallHeight + 30}
          textAnchor="middle"
          fill="#1e293b"
          fontSize="11"
          fontWeight="500"
        >
          {partitionWidth} мм ({(partitionWidth / 10).toFixed(0)} см)
        </text>

        <line
          x1={offsetX - 15}
          y1={offsetY}
          x2={offsetX - 15}
          y2={offsetY + wallHeight}
          stroke="#64748b"
          strokeWidth="1.5"
          markerStart="url(#arrow-start)"
          markerEnd="url(#arrow-end)"
        />
        <text
          x={offsetX - 25}
          y={offsetY + wallHeight / 2}
          textAnchor="middle"
          fill="#1e293b"
          fontSize="11"
          fontWeight="500"
          transform={`rotate(-90, ${offsetX - 25}, ${offsetY + wallHeight / 2})`}
        >
          {partitionHeight} мм ({(partitionHeight / 10).toFixed(0)} см)
        </text>

        {hasDoor && dWidth > 0 && dHeight > 0 && (
          <>
            <line
              x1={offsetX + (wallWidth - dWidth) / 2}
              y1={offsetY + wallHeight + 35}
              x2={offsetX + (wallWidth + dWidth) / 2}
              y2={offsetY + wallHeight + 35}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />
            <text
              x={offsetX + wallWidth / 2}
              y={offsetY + wallHeight + 48}
              textAnchor="middle"
              fill="#92400e"
              fontSize="10"
              fontWeight="500"
            >
              Дверь: {doorWidth}×{doorHeight} мм
            </text>
          </>
        )}

        <defs>
          <marker id="arrow-start" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M 0 2 L 4 4 L 0 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          </marker>
          <marker id="arrow-end" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M 8 2 L 4 4 L 8 6" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          </marker>
        </defs>

        <text
          x={svgWidth / 2}
          y={20}
          textAnchor="middle"
          fill="#1e40af"
          fontSize="14"
          fontWeight="700"
        >
          Эскиз перегородки
        </text>
      </svg>
    </div>
  );
}
