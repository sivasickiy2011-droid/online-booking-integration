import { useMemo } from 'react';

interface SimpleModeDoorSketchProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth: number;
  doorHeight: number;
  doorPosition: 'left' | 'center' | 'right';
  doorOffset: number;
  doorPanels: 1 | 2;
  unit: 'mm' | 'cm';
}

export default function SimpleModeDoorSketch({
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  doorPosition,
  doorOffset,
  doorPanels,
  unit
}: SimpleModeDoorSketchProps) {
  const viewBox = useMemo(() => {
    const margin = 50;
    const width = Math.max(partitionWidth, 100);
    const height = Math.max(partitionHeight, 100);
    return `${-margin} ${-margin} ${width + margin * 2} ${height + margin * 2}`;
  }, [partitionWidth, partitionHeight]);

  const doorX = useMemo(() => {
    if (doorPosition === 'center') {
      return (partitionWidth - doorWidth) / 2;
    } else if (doorPosition === 'left') {
      return doorOffset;
    } else {
      return partitionWidth - doorWidth - doorOffset;
    }
  }, [doorPosition, partitionWidth, doorWidth, doorOffset]);

  const doorY = 0;

  const displayUnit = (value: number) => {
    if (unit === 'cm') {
      return `${(value / 10).toFixed(0)} см`;
    }
    return `${value.toFixed(0)} мм`;
  };

  return (
    <div className="w-full bg-white border-2 border-slate-300 rounded-lg p-4">
      <div className="text-center mb-2">
        <h4 className="font-semibold text-sm text-slate-700">Эскиз (вид спереди)</h4>
      </div>
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        style={{ maxHeight: '400px' }}
      >
        <defs>
          <pattern id="glass-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#93c5fd" opacity="0.3" />
          </pattern>
          <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#bfdbfe', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="door-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#fde68a', stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>

        {/* Основная перегородка */}
        <rect
          x="0"
          y="0"
          width={partitionWidth}
          height={partitionHeight}
          fill="url(#glass-gradient)"
          stroke="#3b82f6"
          strokeWidth="3"
        />
        <rect
          x="0"
          y="0"
          width={partitionWidth}
          height={partitionHeight}
          fill="url(#glass-pattern)"
          opacity="0.4"
        />

        {/* Дверь */}
        {doorWidth > 0 && doorHeight > 0 && doorX >= 0 && (doorX + doorWidth) <= partitionWidth && (
          <>
            {doorPanels === 1 ? (
              <>
                {/* Одна створка */}
                <rect
                  x={doorX}
                  y={doorY}
                  width={doorWidth}
                  height={doorHeight}
                  fill="url(#door-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="4"
                />
                
                {/* Ручка */}
                <circle
                  cx={doorX + doorWidth - 100}
                  cy={doorHeight / 2}
                  r="15"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                />
                
                {/* Петли */}
                <rect
                  x={doorX + 20}
                  y={doorHeight * 0.15}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                  rx="5"
                />
                <rect
                  x={doorX + 20}
                  y={doorHeight * 0.75}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                  rx="5"
                />
                
                {/* Разделитель между створками (визуальный) */}
                <line
                  x1={doorX + doorWidth / 2}
                  y1={doorY}
                  x2={doorX + doorWidth / 2}
                  y2={doorY + doorHeight}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  opacity="0.5"
                />
              </>
            ) : (
              <>
                {/* Две створки */}
                <rect
                  x={doorX}
                  y={doorY}
                  width={doorWidth / 2}
                  height={doorHeight}
                  fill="url(#door-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="4"
                />
                <rect
                  x={doorX + doorWidth / 2}
                  y={doorY}
                  width={doorWidth / 2}
                  height={doorHeight}
                  fill="url(#door-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="4"
                />
                
                {/* Ручки на обеих створках */}
                <circle
                  cx={doorX + doorWidth / 2 - 80}
                  cy={doorHeight / 2}
                  r="15"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                />
                <circle
                  cx={doorX + doorWidth / 2 + 80}
                  cy={doorHeight / 2}
                  r="15"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                />
                
                {/* Петли на обеих створках */}
                <rect
                  x={doorX + 20}
                  y={doorHeight * 0.15}
                  width="25"
                  height="40"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                  rx="5"
                />
                <rect
                  x={doorX + doorWidth - 45}
                  y={doorHeight * 0.15}
                  width="25"
                  height="40"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="2"
                  rx="5"
                />
              </>
            )}

            {/* Стрелка указывающая, что это дверь (внизу) */}
            <g>
              <text
                x={doorX + doorWidth / 2}
                y={doorHeight + 100}
                textAnchor="middle"
                fontSize="60"
                fill="#f59e0b"
                fontWeight="bold"
              >
                ↑ ВХОД
              </text>
            </g>
          </>
        )}

        {/* Размеры */}
        {/* Ширина изделия */}
        <g>
          <line
            x1="0"
            y1={partitionHeight + 80}
            x2={partitionWidth}
            y2={partitionHeight + 80}
            stroke="#1e293b"
            strokeWidth="2"
            markerStart="url(#arrow-start)"
            markerEnd="url(#arrow-end)"
          />
          <text
            x={partitionWidth / 2}
            y={partitionHeight + 120}
            textAnchor="middle"
            fontSize="40"
            fill="#1e293b"
            fontWeight="600"
          >
            {displayUnit(partitionWidth)}
          </text>
        </g>

        {/* Высота изделия */}
        <g>
          <line
            x1={partitionWidth + 80}
            y1="0"
            x2={partitionWidth + 80}
            y2={partitionHeight}
            stroke="#1e293b"
            strokeWidth="2"
            markerStart="url(#arrow-start)"
            markerEnd="url(#arrow-end)"
          />
          <text
            x={partitionWidth + 120}
            y={partitionHeight / 2}
            textAnchor="start"
            fontSize="40"
            fill="#1e293b"
            fontWeight="600"
            transform={`rotate(90, ${partitionWidth + 120}, ${partitionHeight / 2})`}
          >
            {displayUnit(partitionHeight)}
          </text>
        </g>

        {/* Размеры двери */}
        {doorWidth > 0 && doorHeight > 0 && (
          <>
            {/* Ширина двери */}
            <g>
              <line
                x1={doorX}
                y1={doorHeight + 30}
                x2={doorX + doorWidth}
                y2={doorHeight + 30}
                stroke="#f59e0b"
                strokeWidth="2"
                markerStart="url(#arrow-door-start)"
                markerEnd="url(#arrow-door-end)"
              />
              <text
                x={doorX + doorWidth / 2}
                y={doorHeight + 70}
                textAnchor="middle"
                fontSize="35"
                fill="#f59e0b"
                fontWeight="600"
              >
                {displayUnit(doorWidth)}
              </text>
            </g>

            {/* Высота двери */}
            <g>
              <line
                x1={doorX - 30}
                y1={doorY}
                x2={doorX - 30}
                y2={doorY + doorHeight}
                stroke="#f59e0b"
                strokeWidth="2"
                markerStart="url(#arrow-door-start)"
                markerEnd="url(#arrow-door-end)"
              />
              <text
                x={doorX - 70}
                y={doorY + doorHeight / 2}
                textAnchor="end"
                fontSize="35"
                fill="#f59e0b"
                fontWeight="600"
              >
                {displayUnit(doorHeight)}
              </text>
            </g>
          </>
        )}

        {/* Стрелки для размеров */}
        <defs>
          <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="0,5 10,0 10,10" fill="#1e293b" />
          </marker>
          <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="10,5 0,0 0,10" fill="#1e293b" />
          </marker>
          <marker id="arrow-door-start" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="0,5 10,0 10,10" fill="#f59e0b" />
          </marker>
          <marker id="arrow-door-end" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="10,5 0,0 0,10" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-sm font-semibold">ℹ️</span>
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">Условные обозначения:</p>
            <ul className="space-y-1 ml-3">
              <li>🔵 Голубой контур — стеклянная перегородка</li>
              <li>🟡 Желтый контур — дверь (всегда от нижнего края)</li>
              <li>⚫ Серые элементы — фурнитура (ручки, петли)</li>
              {doorPanels === 2 && <li>↔️ Две створки — открываются в обе стороны от центра</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
