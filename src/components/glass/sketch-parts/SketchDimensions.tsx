interface SketchDimensionsProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth: number;
  doorHeight: number;
  doorX: number;
  doorY: number;
  displayUnit: (value: number) => string;
}

export default function SketchDimensions({
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  doorX,
  doorY,
  displayUnit
}: SketchDimensionsProps) {
  const isDoorVisible = doorWidth > 0 && doorHeight > 0 && doorX >= 0 && (doorX + doorWidth) <= partitionWidth;

  return (
    <>
      {/* Размерная линия ШИРИНЫ перегородки (внизу, ПОД полом) */}
      <g>
        {/* Вертикальные засечки */}
        <line
          x1="0"
          y1={partitionHeight + 30}
          x2="0"
          y2={partitionHeight + 70}
          stroke="#1e293b"
          strokeWidth="2"
        />
        <line
          x1={partitionWidth}
          y1={partitionHeight + 30}
          x2={partitionWidth}
          y2={partitionHeight + 70}
          stroke="#1e293b"
          strokeWidth="2"
        />
        {/* Горизонтальная линия со стрелками */}
        <line
          x1="0"
          y1={partitionHeight + 50}
          x2={partitionWidth}
          y2={partitionHeight + 50}
          stroke="#1e293b"
          strokeWidth="2"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        {/* Текст размера */}
        <text
          x={partitionWidth / 2}
          y={partitionHeight + 45}
          textAnchor="middle"
          fill="#1e293b"
          fontSize="28"
          fontWeight="bold"
        >
          {displayUnit(partitionWidth)}
        </text>
      </g>

      {/* Размерная линия ВЫСОТЫ перегородки (справа) */}
      <g>
        {/* Горизонтальные засечки */}
        <line
          x1={partitionWidth + 30}
          y1="0"
          x2={partitionWidth + 70}
          y2="0"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <line
          x1={partitionWidth + 30}
          y1={partitionHeight}
          x2={partitionWidth + 70}
          y2={partitionHeight}
          stroke="#1e293b"
          strokeWidth="2"
        />
        {/* Вертикальная линия со стрелками */}
        <line
          x1={partitionWidth + 50}
          y1="0"
          x2={partitionWidth + 50}
          y2={partitionHeight}
          stroke="#1e293b"
          strokeWidth="2"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        {/* Текст размера (повернут) */}
        <text
          x={partitionWidth + 55}
          y={partitionHeight / 2}
          textAnchor="middle"
          fill="#1e293b"
          fontSize="28"
          fontWeight="bold"
          transform={`rotate(90, ${partitionWidth + 55}, ${partitionHeight / 2})`}
        >
          {displayUnit(partitionHeight)}
        </text>
      </g>

      {/* Размеры двери (если видна) */}
      {isDoorVisible && (
        <>
          {/* Ширина двери (над дверью) */}
          <g>
            <line
              x1={doorX}
              y1={doorY - 30}
              x2={doorX}
              y2={doorY - 70}
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <line
              x1={doorX + doorWidth}
              y1={doorY - 30}
              x2={doorX + doorWidth}
              y2={doorY - 70}
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
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <text
              x={doorX + doorWidth / 2}
              y={doorY - 55}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="24"
              fontWeight="bold"
            >
              {displayUnit(doorWidth)}
            </text>
          </g>

          {/* Высота двери (слева от двери) */}
          <g>
            <line
              x1={doorX - 30}
              y1={doorY}
              x2={doorX - 70}
              y2={doorY}
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <line
              x1={doorX - 30}
              y1={partitionHeight}
              x2={doorX - 70}
              y2={partitionHeight}
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <line
              x1={doorX - 50}
              y1={doorY}
              x2={doorX - 50}
              y2={partitionHeight}
              stroke="#f59e0b"
              strokeWidth="2"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <text
              x={doorX - 55}
              y={(doorY + partitionHeight) / 2}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="24"
              fontWeight="bold"
              transform={`rotate(90, ${doorX - 55}, ${(doorY + partitionHeight) / 2})`}
            >
              {displayUnit(doorHeight)}
            </text>
          </g>
        </>
      )}
    </>
  );
}
