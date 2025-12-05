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
    const margin = 100;
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

  // КРИТИЧНО: Дверь всегда от НИЖНЕГО края (пола)
  const doorY = partitionHeight - doorHeight;

  const displayUnit = (value: number) => {
    if (unit === 'cm') {
      return `${(value / 10).toFixed(0)} см`;
    }
    return `${value.toFixed(0)} мм`;
  };

  // Определяем где петли в зависимости от позиции
  const hingesOnLeft = doorPosition === 'left' || doorPosition === 'center';

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-6">
      <div className="text-center mb-3">
        <h4 className="font-semibold text-base text-slate-700">Эскиз изделия (вид спереди)</h4>
        <p className="text-xs text-slate-500 mt-1">Дверь от пола вверх</p>
      </div>
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        style={{ maxHeight: '450px' }}
      >
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
          
          {/* Стрелки для размеров */}
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="0,0 10,5 0,10" fill="#1e293b" />
          </marker>
        </defs>

        {/* Основная перегородка (голубое стекло) */}
        <rect
          x="0"
          y="0"
          width={partitionWidth}
          height={partitionHeight}
          fill="url(#glass-gradient)"
          stroke="#0ea5e9"
          strokeWidth="4"
          rx="4"
        />

        {/* Дверь (желтая, ВСЕГДА ОТ НИЖНЕГО КРАЯ) */}
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
                  strokeWidth="5"
                  rx="4"
                />
                
                {/* Петли (2 шт) - слева или справа от двери */}
                {hingesOnLeft ? (
                  <>
                    {/* Петли слева */}
                    <rect
                      x={doorX + 15}
                      y={doorY + doorHeight * 0.15}
                      width="35"
                      height="55"
                      fill="#78716c"
                      stroke="#44403c"
                      strokeWidth="3"
                      rx="8"
                    />
                    <rect
                      x={doorX + 15}
                      y={doorY + doorHeight * 0.75}
                      width="35"
                      height="55"
                      fill="#78716c"
                      stroke="#44403c"
                      strokeWidth="3"
                      rx="8"
                    />
                    {/* Ручка справа */}
                    <rect
                      x={doorX + doorWidth - 60}
                      y={doorY + doorHeight / 2 - 80}
                      width="15"
                      height="160"
                      fill="#57534e"
                      stroke="#292524"
                      strokeWidth="2"
                      rx="7"
                    />
                  </>
                ) : (
                  <>
                    {/* Петли справа */}
                    <rect
                      x={doorX + doorWidth - 50}
                      y={doorY + doorHeight * 0.15}
                      width="35"
                      height="55"
                      fill="#78716c"
                      stroke="#44403c"
                      strokeWidth="3"
                      rx="8"
                    />
                    <rect
                      x={doorX + doorWidth - 50}
                      y={doorY + doorHeight * 0.75}
                      width="35"
                      height="55"
                      fill="#78716c"
                      stroke="#44403c"
                      strokeWidth="3"
                      rx="8"
                    />
                    {/* Ручка слева */}
                    <rect
                      x={doorX + 45}
                      y={doorY + doorHeight / 2 - 80}
                      width="15"
                      height="160"
                      fill="#57534e"
                      stroke="#292524"
                      strokeWidth="2"
                      rx="7"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {/* Две створки (только при центральном расположении) */}
                <rect
                  x={doorX}
                  y={doorY}
                  width={doorWidth / 2 - 2}
                  height={doorHeight}
                  fill="url(#door-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  rx="4"
                />
                <rect
                  x={doorX + doorWidth / 2 + 2}
                  y={doorY}
                  width={doorWidth / 2 - 2}
                  height={doorHeight}
                  fill="url(#door-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  rx="4"
                />
                
                {/* Петли на краях (левая створка - петли слева, правая - справа) */}
                <rect
                  x={doorX + 15}
                  y={doorY + doorHeight * 0.15}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="3"
                  rx="8"
                />
                <rect
                  x={doorX + 15}
                  y={doorY + doorHeight * 0.75}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="3"
                  rx="8"
                />
                
                <rect
                  x={doorX + doorWidth - 45}
                  y={doorY + doorHeight * 0.15}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="3"
                  rx="8"
                />
                <rect
                  x={doorX + doorWidth - 45}
                  y={doorY + doorHeight * 0.75}
                  width="30"
                  height="50"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="3"
                  rx="8"
                />
                
                {/* Ручки в центре каждой створки */}
                <rect
                  x={doorX + doorWidth / 4 - 7}
                  y={doorY + doorHeight / 2 - 70}
                  width="14"
                  height="140"
                  fill="#57534e"
                  stroke="#292524"
                  strokeWidth="2"
                  rx="7"
                />
                <rect
                  x={doorX + doorWidth * 3 / 4 - 7}
                  y={doorY + doorHeight / 2 - 70}
                  width="14"
                  height="140"
                  fill="#57534e"
                  stroke="#292524"
                  strokeWidth="2"
                  rx="7"
                />
              </>
            )}


          </>
        )}

        {/* Размерные линии */}
        {/* Ширина изделия */}
        <g>
          <line
            x1="0"
            y1={partitionHeight + 100}
            x2="0"
            y2={partitionHeight + 120}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1={partitionHeight + 110}
            x2={partitionWidth}
            y2={partitionHeight + 110}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <line
            x1={partitionWidth}
            y1={partitionHeight + 100}
            x2={partitionWidth}
            y2={partitionHeight + 120}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <text
            x={partitionWidth / 2}
            y={partitionHeight + 155}
            textAnchor="middle"
            fontSize="38"
            fill="#1e293b"
            fontWeight="600"
          >
            {displayUnit(partitionWidth)}
          </text>
        </g>

        {/* Высота изделия */}
        <g>
          <line
            x1={partitionWidth + 100}
            y1="0"
            x2={partitionWidth + 120}
            y2="0"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <line
            x1={partitionWidth + 110}
            y1="0"
            x2={partitionWidth + 110}
            y2={partitionHeight}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <line
            x1={partitionWidth + 100}
            y1={partitionHeight}
            x2={partitionWidth + 120}
            y2={partitionHeight}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <text
            x={partitionWidth + 180}
            y={partitionHeight / 2 + 15}
            textAnchor="middle"
            fontSize="38"
            fill="#1e293b"
            fontWeight="600"
            transform={`rotate(-90, ${partitionWidth + 180}, ${partitionHeight / 2})`}
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
                y1={doorY - 40}
                x2={doorX}
                y2={doorY - 60}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <line
                x1={doorX}
                y1={doorY - 50}
                x2={doorX + doorWidth}
                y2={doorY - 50}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <line
                x1={doorX + doorWidth}
                y1={doorY - 40}
                x2={doorX + doorWidth}
                y2={doorY - 60}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x={doorX + doorWidth / 2}
                y={doorY - 75}
                textAnchor="middle"
                fontSize="32"
                fill="#f59e0b"
                fontWeight="600"
              >
                Дверь: {displayUnit(doorWidth)}
              </text>
            </g>

            {/* Высота двери */}
            <g>
              <line
                x1={doorX - 40}
                y1={doorY}
                x2={doorX - 60}
                y2={doorY}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <line
                x1={doorX - 50}
                y1={doorY}
                x2={doorX - 50}
                y2={doorY + doorHeight}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <line
                x1={doorX - 40}
                y1={doorY + doorHeight}
                x2={doorX - 60}
                y2={doorY + doorHeight}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x={doorX - 100}
                y={doorY + doorHeight / 2 + 12}
                textAnchor="middle"
                fontSize="32"
                fill="#f59e0b"
                fontWeight="600"
                transform={`rotate(-90, ${doorX - 100}, ${doorY + doorHeight / 2})`}
              >
                {displayUnit(doorHeight)}
              </text>
            </g>
          </>
        )}

        {/* Линия пола (без надписи) */}
        <line
          x1="-50"
          y1={partitionHeight}
          x2={partitionWidth + 50}
          y2={partitionHeight}
          stroke="#1e293b"
          strokeWidth="4"
          strokeDasharray="15,10"
        />
      </svg>
      
      {/* Легенда */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-200 border-2 border-sky-500 rounded"></div>
          <span className="text-slate-600">Стекло</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border-2 border-amber-500 rounded"></div>
          <span className="text-slate-600">Дверь</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-500 border-2 border-stone-700 rounded"></div>
          <span className="text-slate-600">Крепления</span>
        </div>
      </div>
    </div>
  );
}