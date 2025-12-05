import { useMemo } from 'react';
import SketchDefs from './sketch-parts/SketchDefs';
import SketchWalls from './sketch-parts/SketchWalls';
import SketchDoor from './sketch-parts/SketchDoor';
import SketchDimensions from './sketch-parts/SketchDimensions';

interface SimpleModeDoorSketchProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth: number;
  doorHeight: number;
  doorPosition: 'left' | 'center' | 'right';
  doorOffset: number;
  doorPanels: 1 | 2;
  unit: 'mm' | 'cm';
  hasLeftWall?: boolean;
  hasRightWall?: boolean;
  hasBackWall?: boolean;
}

export default function SimpleModeDoorSketch({
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  doorPosition,
  doorOffset,
  doorPanels,
  unit,
  hasLeftWall = false,
  hasRightWall = false,
  hasBackWall = false
}: SimpleModeDoorSketchProps) {
  const viewBox = useMemo(() => {
    const margin = 100;
    const marginBottom = 200;
    const width = Math.max(partitionWidth, 100);
    const height = Math.max(partitionHeight, 100);
    return `${-margin} ${-margin} ${width + margin * 2} ${height + margin + marginBottom}`;
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

  const doorY = partitionHeight - doorHeight;

  const displayUnit = (value: number) => {
    if (unit === 'cm') {
      return `${(value / 10).toFixed(0)} см`;
    }
    return `${value.toFixed(0)} мм`;
  };

  const hingesOnLeft = doorPosition === 'left' || doorPosition === 'center';
  
  const showPerspective = hasLeftWall || hasRightWall || hasBackWall;
  
  const perspectiveDepth = partitionWidth * 0.3;
  const perspectiveOffsetX = perspectiveDepth * 0.7;
  const perspectiveOffsetY = -perspectiveDepth * 0.5;

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-6">
      <div className="text-center mb-3">
        <h4 className="font-semibold text-base text-slate-700">
          Эскиз изделия {showPerspective ? '(3D вид)' : '(вид спереди)'}
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          {showPerspective ? 'Упрощенная перспектива' : 'Дверь от пола вверх'}
        </p>
      </div>
      <svg
        viewBox={showPerspective 
          ? `${-100 - perspectiveOffsetX} ${-100 + perspectiveOffsetY} ${partitionWidth + 300 + perspectiveOffsetX} ${partitionHeight + 400}` 
          : viewBox
        }
        className="w-full h-auto"
        style={{ maxHeight: '450px' }}
      >
        <SketchDefs />

        <SketchWalls
          showPerspective={showPerspective}
          hasBackWall={hasBackWall}
          hasLeftWall={hasLeftWall}
          hasRightWall={hasRightWall}
          partitionWidth={partitionWidth}
          partitionHeight={partitionHeight}
          perspectiveOffsetX={perspectiveOffsetX}
          perspectiveOffsetY={perspectiveOffsetY}
        />

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

        <SketchDoor
          doorWidth={doorWidth}
          doorHeight={doorHeight}
          doorX={doorX}
          doorY={doorY}
          partitionWidth={partitionWidth}
          doorPanels={doorPanels}
          hingesOnLeft={hingesOnLeft}
        />

        <SketchDimensions
          partitionWidth={partitionWidth}
          partitionHeight={partitionHeight}
          doorWidth={doorWidth}
          doorHeight={doorHeight}
          doorX={doorX}
          doorY={doorY}
          displayUnit={displayUnit}
        />
      </svg>
    </div>
  );
}
