import { useMemo } from 'react';

interface MiniDoorPreviewProps {
  doorPosition: 'left' | 'center' | 'right';
  doorPanels: 1 | 2;
  doorHeightPercent?: number;
}

export default function MiniDoorPreview({
  doorPosition,
  doorPanels,
  doorHeightPercent = 85
}: MiniDoorPreviewProps) {
  const partitionWidth = 200;
  const partitionHeight = 250;
  const doorHeight = (partitionHeight * doorHeightPercent) / 100;
  const doorWidth = partitionWidth * 0.4;
  
  const doorX = useMemo(() => {
    if (doorPosition === 'center') {
      return (partitionWidth - doorWidth) / 2;
    } else if (doorPosition === 'left') {
      return 0;
    } else {
      return partitionWidth - doorWidth;
    }
  }, [doorPosition, doorWidth]);

  const doorY = partitionHeight - doorHeight;
  const hingesOnLeft = doorPosition === 'left' || doorPosition === 'center';

  return (
    <div className="w-full max-w-[280px] mx-auto bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <svg
        viewBox={`0 0 ${partitionWidth} ${partitionHeight}`}
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="mini-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 0.4 }} />
          </linearGradient>
          <linearGradient id="mini-door" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#fde047', stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>

        {/* Перегородка */}
        <rect
          x="0"
          y="0"
          width={partitionWidth}
          height={partitionHeight}
          fill="url(#mini-glass)"
          stroke="#0ea5e9"
          strokeWidth="2"
          rx="2"
        />

        {/* Дверь */}
        {doorPanels === 1 ? (
          <>
            <rect
              x={doorX}
              y={doorY}
              width={doorWidth}
              height={doorHeight}
              fill="url(#mini-door)"
              stroke="#f59e0b"
              strokeWidth="2.5"
              rx="2"
            />
            
            {/* Петли */}
            {hingesOnLeft ? (
              <>
                <rect
                  x={doorX + 5}
                  y={doorY + doorHeight * 0.2}
                  width="8"
                  height="12"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="1"
                  rx="2"
                />
                <rect
                  x={doorX + 5}
                  y={doorY + doorHeight * 0.75}
                  width="8"
                  height="12"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="1"
                  rx="2"
                />
                {/* Ручка */}
                <rect
                  x={doorX + doorWidth - 15}
                  y={doorY + doorHeight / 2 - 15}
                  width="4"
                  height="30"
                  fill="#57534e"
                  stroke="#292524"
                  strokeWidth="1"
                  rx="2"
                />
              </>
            ) : (
              <>
                <rect
                  x={doorX + doorWidth - 13}
                  y={doorY + doorHeight * 0.2}
                  width="8"
                  height="12"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="1"
                  rx="2"
                />
                <rect
                  x={doorX + doorWidth - 13}
                  y={doorY + doorHeight * 0.75}
                  width="8"
                  height="12"
                  fill="#78716c"
                  stroke="#44403c"
                  strokeWidth="1"
                  rx="2"
                />
                {/* Ручка */}
                <rect
                  x={doorX + 11}
                  y={doorY + doorHeight / 2 - 15}
                  width="4"
                  height="30"
                  fill="#57534e"
                  stroke="#292524"
                  strokeWidth="1"
                  rx="2"
                />
              </>
            )}
          </>
        ) : (
          <>
            {/* Две створки */}
            <rect
              x={doorX}
              y={doorY}
              width={doorWidth / 2 - 1}
              height={doorHeight}
              fill="url(#mini-door)"
              stroke="#f59e0b"
              strokeWidth="2.5"
              rx="2"
            />
            <rect
              x={doorX + doorWidth / 2 + 1}
              y={doorY}
              width={doorWidth / 2 - 1}
              height={doorHeight}
              fill="url(#mini-door)"
              stroke="#f59e0b"
              strokeWidth="2.5"
              rx="2"
            />
            
            {/* Петли на краях */}
            <rect
              x={doorX + 5}
              y={doorY + doorHeight * 0.2}
              width="7"
              height="10"
              fill="#78716c"
              stroke="#44403c"
              strokeWidth="1"
              rx="2"
            />
            <rect
              x={doorX + 5}
              y={doorY + doorHeight * 0.75}
              width="7"
              height="10"
              fill="#78716c"
              stroke="#44403c"
              strokeWidth="1"
              rx="2"
            />
            
            <rect
              x={doorX + doorWidth - 12}
              y={doorY + doorHeight * 0.2}
              width="7"
              height="10"
              fill="#78716c"
              stroke="#44403c"
              strokeWidth="1"
              rx="2"
            />
            <rect
              x={doorX + doorWidth - 12}
              y={doorY + doorHeight * 0.75}
              width="7"
              height="10"
              fill="#78716c"
              stroke="#44403c"
              strokeWidth="1"
              rx="2"
            />
            
            {/* Ручки в центре */}
            <rect
              x={doorX + doorWidth / 4 - 2}
              y={doorY + doorHeight / 2 - 12}
              width="4"
              height="24"
              fill="#57534e"
              stroke="#292524"
              strokeWidth="1"
              rx="2"
            />
            <rect
              x={doorX + doorWidth * 3 / 4 - 2}
              y={doorY + doorHeight / 2 - 12}
              width="4"
              height="24"
              fill="#57534e"
              stroke="#292524"
              strokeWidth="1"
              rx="2"
            />
          </>
        )}

        {/* Линия пола */}
        <line
          x1="0"
          y1={partitionHeight}
          x2={partitionWidth}
          y2={partitionHeight}
          stroke="#1e293b"
          strokeWidth="2"
          strokeDasharray="5,3"
        />
      </svg>
      
      <div className="mt-2 text-center text-xs text-slate-500">
        {doorPosition === 'left' && 'Дверь слева'}
        {doorPosition === 'center' && 'Дверь по центру'}
        {doorPosition === 'right' && 'Дверь справа'}
        {' • '}
        {doorPanels === 1 ? '1 створка' : '2 створки'}
      </div>
    </div>
  );
}