import { useState, useEffect, useRef } from 'react';
import { StructureConfig } from './StructureConfigurator';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Structure3DViewProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function Structure3DView({ config, unit }: Structure3DViewProps) {
  const [rotation, setRotation] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const convertToMm = (value: string) => {
    const num = parseFloat(value) || 0;
    return unit === 'cm' ? num * 10 : num;
  };

  if (!config.sections || config.sections.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 border-2 text-center text-muted-foreground">
        Добавьте хотя бы одну секцию для отображения 3D-визуализации
      </div>
    );
  }

  const height = convertToMm(config.height) || 1900;
  const depthMm = 1200;
  
  const totalWidthMm = config.sections.reduce((sum, s) => sum + convertToMm(s.width), 0);
  
  const maxWidth = 800;
  const maxHeight = 600;
  const viewPadding = 100;
  
  const scale = Math.min(
    (maxWidth - viewPadding * 2) / Math.max(totalWidthMm, depthMm),
    (maxHeight - viewPadding * 2) / height
  );
  
  const scaledWidth = totalWidthMm * scale;
  const scaledHeight = height * scale;
  const scaledDepth = depthMm * scale;

  const to3D = (x: number, y: number, z: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    
    const rotatedX = x * cosA - z * sinA;
    const rotatedZ = x * sinA + z * cosA;
    
    const isoX = rotatedX - rotatedZ * 0.5;
    const isoY = y + rotatedX * 0.25 + rotatedZ * 0.25;
    
    return { x: isoX, y: isoY };
  };

  let currentX = 0;
  let currentZ = 0;
  const sections = config.sections.map((section, index) => {
    const sectionWidth = convertToMm(section.width) * scale;
    const angle = index > 0 ? config.sections[index - 1].angleToNext || 180 : 0;
    
    const startX = currentX;
    const startZ = currentZ;
    let endX = currentX;
    let endZ = currentZ;
    
    if (index === 0) {
      endX = currentX + sectionWidth;
      currentX = endX;
    } else {
      if (angle === 180) {
        endX = currentX + sectionWidth;
        currentX = endX;
      } else if (angle === 90) {
        endZ = currentZ + sectionWidth;
        currentZ = endZ;
      } else if (angle === 135) {
        const rad = (135 * Math.PI) / 180;
        endX = currentX + sectionWidth * Math.cos(rad);
        endZ = currentZ + sectionWidth * Math.sin(rad);
        currentX = endX;
        currentZ = endZ;
      }
    }
    
    return {
      id: section.id,
      type: section.type,
      width: sectionWidth,
      doorWidth: section.doorWidth ? convertToMm(section.doorWidth) * scale : 0,
      startX,
      startZ,
      endX,
      endZ,
      angle
    };
  });
  
  const hasRightAngleSection = config.sections.some((s, i) => i > 0 && config.sections[i - 1].angleToNext === 90);

  const offsetX = maxWidth / 2;
  const offsetY = maxHeight / 2 + scaledHeight / 3;

  const glassColor = '#60a5fa';
  const wallColor = '#94a3b8';
  const doorFrameColor = '#1e293b';
  const doorGlassColor = '#e0f2fe';
  const handleColor = '#475569';

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setRotation(prev => (prev + 0.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handleRotate = (delta: number) => {
    setRotation(prev => (prev + delta + 360) % 360);
  };

  const renderDoor = (
    startX: number,
    startZ: number,
    endX: number,
    endZ: number,
    doorWidthPx: number,
    isDouble: boolean
  ) => {
    const isVertical = Math.abs(endZ - startZ) > Math.abs(endX - startX);
    const sectionLength = isVertical ? Math.abs(endZ - startZ) : Math.abs(endX - startX);
    const doorOffset = (sectionLength - doorWidthPx) / 2;
    
    let doorStartX, doorStartZ, doorEndX, doorEndZ;
    
    if (isVertical) {
      doorStartX = startX;
      doorStartZ = startZ + doorOffset;
      doorEndX = endX;
      doorEndZ = startZ + doorOffset + doorWidthPx;
    } else {
      doorStartX = startX + doorOffset;
      doorStartZ = startZ;
      doorEndX = startX + doorOffset + doorWidthPx;
      doorEndZ = endZ;
    }

    const doorBL = to3D(doorStartX, 0, scaledDepth - doorStartZ, rotation);
    const doorBR = to3D(doorEndX, 0, scaledDepth - doorEndZ, rotation);
    const doorTR = to3D(doorEndX, -scaledHeight, scaledDepth - doorEndZ, rotation);
    const doorTL = to3D(doorStartX, -scaledHeight, scaledDepth - doorStartZ, rotation);

    const frameThickness = 8;
    
    return (
      <g>
        {/* Рамка двери */}
        <path
          d={`
            M ${doorBL.x} ${doorBL.y}
            L ${doorBR.x} ${doorBR.y}
            L ${doorTR.x} ${doorTR.y}
            L ${doorTL.x} ${doorTL.y}
            Z
          `}
          fill={doorFrameColor}
          stroke={doorFrameColor}
          strokeWidth="4"
        />

        {/* Стекло двери */}
        {isDouble ? (
          <>
            {/* Две створки */}
            <path
              d={`
                M ${doorBL.x + frameThickness} ${doorBL.y + frameThickness}
                L ${(doorBL.x + doorBR.x) / 2 - 2} ${(doorBL.y + doorBR.y) / 2 + frameThickness}
                L ${(doorTL.x + doorTR.x) / 2 - 2} ${(doorTL.y + doorTR.y) / 2 - frameThickness}
                L ${doorTL.x + frameThickness} ${doorTL.y - frameThickness}
                Z
              `}
              fill={doorGlassColor}
              fillOpacity="0.5"
              stroke={doorFrameColor}
              strokeWidth="2"
            />
            <path
              d={`
                M ${(doorBL.x + doorBR.x) / 2 + 2} ${(doorBL.y + doorBR.y) / 2 + frameThickness}
                L ${doorBR.x - frameThickness} ${doorBR.y + frameThickness}
                L ${doorTR.x - frameThickness} ${doorTR.y - frameThickness}
                L ${(doorTL.x + doorTR.x) / 2 + 2} ${(doorTL.y + doorTR.y) / 2 - frameThickness}
                Z
              `}
              fill={doorGlassColor}
              fillOpacity="0.5"
              stroke={doorFrameColor}
              strokeWidth="2"
            />
            
            {/* Ручки для двух створок */}
            <circle
              cx={(doorBL.x + doorBR.x) / 2 - doorWidthPx * 0.1}
              cy={(doorBL.y + doorBR.y) / 2}
              r="4"
              fill={handleColor}
            />
            <circle
              cx={(doorBL.x + doorBR.x) / 2 + doorWidthPx * 0.1}
              cy={(doorBL.y + doorBR.y) / 2}
              r="4"
              fill={handleColor}
            />
          </>
        ) : (
          <>
            {/* Одна створка */}
            <path
              d={`
                M ${doorBL.x + frameThickness} ${doorBL.y + frameThickness}
                L ${doorBR.x - frameThickness} ${doorBR.y + frameThickness}
                L ${doorTR.x - frameThickness} ${doorTR.y - frameThickness}
                L ${doorTL.x + frameThickness} ${doorTL.y - frameThickness}
                Z
              `}
              fill={doorGlassColor}
              fillOpacity="0.5"
              stroke={doorFrameColor}
              strokeWidth="2"
            />
            
            {/* Ручка для одной створки */}
            <circle
              cx={doorBR.x - doorWidthPx * 0.15}
              cy={(doorBR.y + doorTR.y) / 2}
              r="4"
              fill={handleColor}
            />
          </>
        )}

        {/* Петли (крепления) слева */}
        <rect
          x={doorBL.x - 3}
          y={doorBL.y - scaledHeight * 0.15}
          width="6"
          height={scaledHeight * 0.08}
          fill={handleColor}
          rx="2"
        />
        <rect
          x={doorBL.x - 3}
          y={doorBL.y - scaledHeight * 0.85}
          width="6"
          height={scaledHeight * 0.08}
          fill={handleColor}
          rx="2"
        />
      </g>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          3D визуализация (вид в перспективе)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(-15)}
            className="h-8 w-8 p-0"
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={14} className="mr-1" />
            {isPlaying ? 'Стоп' : 'Play'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(15)}
            className="h-8 w-8 p-0"
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation(30)}
            className="h-8 px-2 text-xs"
          >
            Сброс
          </Button>
        </div>
      </div>

      <svg
        width="100%"
        height={maxHeight}
        viewBox={`0 0 ${maxWidth} ${maxHeight}`}
        className="mx-auto"
      >
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={wallColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={wallColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Пол */}
          <path
            d={`
              M ${to3D(-scaledWidth * 0.2, 0, -scaledDepth * 0.2, rotation).x} ${to3D(-scaledWidth * 0.2, 0, -scaledDepth * 0.2, rotation).y}
              L ${to3D(scaledWidth * 1.2, 0, -scaledDepth * 0.2, rotation).x} ${to3D(scaledWidth * 1.2, 0, -scaledDepth * 0.2, rotation).y}
              L ${to3D(scaledWidth * 1.2, 0, scaledDepth * 1.2, rotation).x} ${to3D(scaledWidth * 1.2, 0, scaledDepth * 1.2, rotation).y}
              L ${to3D(-scaledWidth * 0.2, 0, scaledDepth * 1.2, rotation).x} ${to3D(-scaledWidth * 0.2, 0, scaledDepth * 1.2, rotation).y}
              Z
            `}
            fill="#e2e8f0"
            opacity="0.2"
          />

          {/* ЗАДНЯЯ СТЕНА (передняя часть помещения) */}
          {config.solidWalls.includes('back') && (
            <path
              d={`
                M ${to3D(0, 0, 0, rotation).x} ${to3D(0, 0, 0, rotation).y}
                L ${to3D(scaledWidth, 0, 0, rotation).x} ${to3D(scaledWidth, 0, 0, rotation).y}
                L ${to3D(scaledWidth, -scaledHeight, 0, rotation).x} ${to3D(scaledWidth, -scaledHeight, 0, rotation).y}
                L ${to3D(0, -scaledHeight, 0, rotation).x} ${to3D(0, -scaledHeight, 0, rotation).y}
                Z
              `}
              fill="url(#wallGradient)"
              stroke={wallColor}
              strokeWidth="1"
            />
          )}

          {/* ЛЕВАЯ БОКОВАЯ СТЕНА */}
          {config.solidWalls.includes('left') && (
            <path
              d={`
                M ${to3D(0, 0, 0, rotation).x} ${to3D(0, 0, 0, rotation).y}
                L ${to3D(0, 0, scaledDepth, rotation).x} ${to3D(0, 0, scaledDepth, rotation).y}
                L ${to3D(0, -scaledHeight, scaledDepth, rotation).x} ${to3D(0, -scaledHeight, scaledDepth, rotation).y}
                L ${to3D(0, -scaledHeight, 0, rotation).x} ${to3D(0, -scaledHeight, 0, rotation).y}
                Z
              `}
              fill="url(#wallGradient)"
              stroke={wallColor}
              strokeWidth="1"
              opacity="0.9"
            />
          )}

          {/* ПРАВАЯ БОКОВАЯ СТЕНА */}
          {config.solidWalls.includes('right') && !hasRightAngleSection && (
            <path
              d={`
                M ${to3D(scaledWidth, 0, 0, rotation).x} ${to3D(scaledWidth, 0, 0, rotation).y}
                L ${to3D(scaledWidth, 0, scaledDepth, rotation).x} ${to3D(scaledWidth, 0, scaledDepth, rotation).y}
                L ${to3D(scaledWidth, -scaledHeight, scaledDepth, rotation).x} ${to3D(scaledWidth, -scaledHeight, scaledDepth, rotation).y}
                L ${to3D(scaledWidth, -scaledHeight, 0, rotation).x} ${to3D(scaledWidth, -scaledHeight, 0, rotation).y}
                Z
              `}
              fill="url(#wallGradient)"
              stroke={wallColor}
              strokeWidth="1"
              opacity="0.9"
            />
          )}

          {/* СТЕКЛЯННЫЕ СЕКЦИИ И ДВЕРИ */}
          {sections.map((section, index) => {
            const bottomLeft = to3D(section.startX, 0, scaledDepth - section.startZ, rotation);
            const bottomRight = to3D(section.endX, 0, scaledDepth - section.endZ, rotation);
            const topRight = to3D(section.endX, -scaledHeight, scaledDepth - section.endZ, rotation);
            const topLeft = to3D(section.startX, -scaledHeight, scaledDepth - section.startZ, rotation);

            const hasDoor = section.type === 'door' || section.type === 'glass-with-door';
            const doorWidth = section.doorWidth || section.width * 0.6;

            return (
              <g key={section.id}>
                {/* Основная стеклянная панель */}
                {(section.type === 'glass' || section.type === 'glass-with-door') && (
                  <>
                    <path
                      d={`
                        M ${bottomLeft.x} ${bottomLeft.y}
                        L ${bottomRight.x} ${bottomRight.y}
                        L ${topRight.x} ${topRight.y}
                        L ${topLeft.x} ${topLeft.y}
                        Z
                      `}
                      fill="url(#glassGradient)"
                      stroke={glassColor}
                      strokeWidth="2"
                    />
                    
                    {/* Рамка стекла */}
                    <path
                      d={`
                        M ${bottomLeft.x} ${bottomLeft.y}
                        L ${bottomRight.x} ${bottomRight.y}
                        L ${topRight.x} ${topRight.y}
                        L ${topLeft.x} ${topLeft.y}
                        Z
                      `}
                      fill="none"
                      stroke="#1e40af"
                      strokeWidth="3"
                    />
                    
                    {/* Крепления по бокам */}
                    <rect
                      x={bottomLeft.x - 4}
                      y={bottomLeft.y - scaledHeight * 0.15}
                      width="8"
                      height={scaledHeight * 0.08}
                      fill="#334155"
                      rx="2"
                    />
                    <rect
                      x={bottomLeft.x - 4}
                      y={bottomLeft.y - scaledHeight * 0.85}
                      width="8"
                      height={scaledHeight * 0.08}
                      fill="#334155"
                      rx="2"
                    />
                    <rect
                      x={bottomRight.x - 4}
                      y={bottomRight.y - scaledHeight * 0.15}
                      width="8"
                      height={scaledHeight * 0.08}
                      fill="#334155"
                      rx="2"
                    />
                    <rect
                      x={bottomRight.x - 4}
                      y={bottomRight.y - scaledHeight * 0.85}
                      width="8"
                      height={scaledHeight * 0.08}
                      fill="#334155"
                      rx="2"
                    />
                    
                    {/* Блик на стекле */}
                    <line
                      x1={topLeft.x + 10}
                      y1={topLeft.y + 10}
                      x2={topLeft.x + 30}
                      y2={topLeft.y + 40}
                      stroke="white"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  </>
                )}

                {/* ДВЕРЬ */}
                {hasDoor && renderDoor(
                  section.startX,
                  section.startZ,
                  section.endX,
                  section.endZ,
                  doorWidth,
                  doorWidth > section.width * 0.65
                )}

                {/* Номер секции */}
                <text
                  x={to3D((section.startX + section.endX) / 2, -scaledHeight - 20, scaledDepth - (section.startZ + section.endZ) / 2, rotation).x}
                  y={to3D((section.startX + section.endX) / 2, -scaledHeight - 20, scaledDepth - (section.startZ + section.endZ) / 2, rotation).y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                  fontWeight="600"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* Легенда */}
        <g transform={`translate(20, ${maxHeight - 50})`}>
          <rect x="0" y="0" width="12" height="12" fill="url(#glassGradient)" stroke={glassColor} strokeWidth="2" />
          <text x="18" y="10" fontSize="10" fill="#475569">Стекло</text>
          
          <rect x="70" y="0" width="12" height="12" fill={doorGlassColor} fillOpacity="0.5" stroke={doorFrameColor} strokeWidth="2" />
          <text x="88" y="10" fontSize="10" fill="#475569">Дверь</text>
          
          <rect x="140" y="0" width="12" height="12" fill="url(#wallGradient)" stroke={wallColor} strokeWidth="1" />
          <text x="158" y="10" fontSize="10" fill="#475569">Стена</text>
        </g>
      </svg>

      <div className="mt-3 pt-3 border-t text-xs text-center text-muted-foreground">
        Угол обзора: {Math.round(rotation)}° | Используйте стрелки для вращения или Play для автоповорота
      </div>
    </div>
  );
}
