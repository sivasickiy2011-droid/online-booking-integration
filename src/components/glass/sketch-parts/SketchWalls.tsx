interface SketchWallsProps {
  showPerspective: boolean;
  hasBackWall: boolean;
  hasLeftWall: boolean;
  hasRightWall: boolean;
  partitionWidth: number;
  partitionHeight: number;
  perspectiveOffsetX: number;
  perspectiveOffsetY: number;
}

export default function SketchWalls({
  showPerspective,
  hasBackWall,
  hasLeftWall,
  hasRightWall,
  partitionWidth,
  partitionHeight,
  perspectiveOffsetX,
  perspectiveOffsetY
}: SketchWallsProps) {
  if (!showPerspective) return null;

  return (
    <g>
      {/* Задняя стена (если есть) */}
      {hasBackWall && (
        <polygon
          points={`
            ${perspectiveOffsetX},${perspectiveOffsetY}
            ${partitionWidth + perspectiveOffsetX},${perspectiveOffsetY}
            ${partitionWidth},0
            0,0
          `}
          fill="url(#wall-gradient)"
          stroke="#64748b"
          strokeWidth="3"
        />
      )}
      
      {/* Левая боковая стена (если есть) */}
      {hasLeftWall && (
        <polygon
          points={`
            0,0
            ${perspectiveOffsetX},${perspectiveOffsetY}
            ${perspectiveOffsetX},${partitionHeight + perspectiveOffsetY}
            0,${partitionHeight}
          `}
          fill="url(#wall-gradient)"
          stroke="#64748b"
          strokeWidth="3"
          opacity="0.85"
        />
      )}
      
      {/* Правая боковая стена (если есть) */}
      {hasRightWall && (
        <polygon
          points={`
            ${partitionWidth},0
            ${partitionWidth + perspectiveOffsetX},${perspectiveOffsetY}
            ${partitionWidth + perspectiveOffsetX},${partitionHeight + perspectiveOffsetY}
            ${partitionWidth},${partitionHeight}
          `}
          fill="url(#wall-gradient)"
          stroke="#64748b"
          strokeWidth="3"
          opacity="0.85"
        />
      )}
    </g>
  );
}
