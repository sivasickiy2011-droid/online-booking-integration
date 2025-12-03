interface PartitionSketchProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth?: number;
  doorHeight?: number;
  hasDoor: boolean;
  partitionCount?: number;
  sectionWidths?: number[];
}

export default function PartitionSketch({
  partitionWidth,
  partitionHeight,
  doorWidth = 0,
  doorHeight = 0,
  hasDoor,
  partitionCount = 1,
  sectionWidths = []
}: PartitionSketchProps) {
  const renderFrontView = () => {
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

        {hasDoor && dWidth > 0 && dHeight > 0 && (
          <>
            <rect 
              x={offsetX + (wallWidth - dWidth) / 2} 
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
              x1={offsetX + (wallWidth - dWidth) / 2 + dWidth / 2}
              y1={offsetY + actualHeight - (dHeight * heightScale)}
              x2={offsetX + (wallWidth - dWidth) / 2 + dWidth / 2}
              y2={offsetY + actualHeight}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />

            <text
              x={offsetX + wallWidth / 2}
              y={offsetY + actualHeight - (dHeight * heightScale) / 2}
              textAnchor="middle"
              fill="#92400e"
              fontSize="11"
              fontWeight="600"
            >
              Дверь
            </text>
          </>
        )}

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

        {hasDoor && dWidth > 0 && dHeight > 0 && (
          <>
            <line
              x1={offsetX + (wallWidth - dWidth) / 2}
              y1={offsetY + actualHeight + 35}
              x2={offsetX + (wallWidth + dWidth) / 2}
              y2={offsetY + actualHeight + 35}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />
            <text
              x={offsetX + wallWidth / 2}
              y={offsetY + actualHeight + 46}
              textAnchor="middle"
              fill="#92400e"
              fontSize="9"
              fontWeight="500"
            >
              Дверь: {doorWidth}×{doorHeight} мм
            </text>
          </>
        )}

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
  };

  const renderSideView = (index: number) => {
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
  };

  const renderTopView = () => {
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
  };

  const sideViews = Array.from({ length: partitionCount }, (_, i) => renderSideView(i));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-center">
          {renderFrontView()}
        </div>
        <div className="flex items-center justify-center">
          {renderTopView()}
        </div>
        {sideViews.map((view, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {view}
          </div>
        ))}
      </div>
    </div>
  );
}