import { useState, useEffect, useRef } from 'react';
import { StructureConfig } from './StructureConfigurator';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Structure3DViewProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function Structure3DView({ config, unit }: Structure3DViewProps) {
  const [rotation, setRotation] = useState(30); // начальный угол (лицевая панель + правый угол)
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const convertToMm = (value: string) => {
    const num = parseFloat(value) || 0;
    return unit === 'cm' ? num * 10 : num;
  };

  // Проверка на пустую конфигурацию
  if (!config.sections || config.sections.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 border-2 text-center text-muted-foreground">
        Добавьте хотя бы одну секцию для отображения 3D-визуализации
      </div>
    );
  }

  const height = convertToMm(config.height) || 1900;
  const depthMm = 1200;
  
  // Вычисляем размеры для автомасштабирования
  const totalWidthMm = config.sections.reduce((sum, s) => sum + convertToMm(s.width), 0);
  
  const maxWidth = 800;
  const maxHeight = 600;
  const viewPadding = 100; // отступ от краёв
  
  // Автоматический масштаб чтобы всё умещалось
  const scale = Math.min(
    (maxWidth - viewPadding * 2) / Math.max(totalWidthMm, depthMm),
    (maxHeight - viewPadding * 2) / height
  );
  
  const scaledWidth = totalWidthMm * scale;
  const scaledHeight = height * scale;
  const scaledDepth = depthMm * scale;

  // 3D трансформация с вращением
  const to3D = (x: number, y: number, z: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    
    // Поворот вокруг вертикальной оси Y
    const rotatedX = x * cosA - z * sinA;
    const rotatedZ = x * sinA + z * cosA;
    
    // Изометрическая проекция
    const isoX = rotatedX - rotatedZ * 0.5;
    const isoY = y + rotatedX * 0.25 + rotatedZ * 0.25;
    
    return { x: isoX, y: isoY };
  };

  // Генерируем секции с учетом углов
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
      // Первая секция всегда горизонтальная
      endX = currentX + sectionWidth;
      currentX = endX;
    } else {
      if (angle === 180) {
        // Прямо
        endX = currentX + sectionWidth;
        currentX = endX;
      } else if (angle === 90) {
        // Поворот на 90° вглубь (правая боковая секция)
        endZ = currentZ + sectionWidth;
        currentZ = endZ;
      } else if (angle === 135) {
        // Поворот на 135°
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
  
  // Проверяем, есть ли секция с углом 90° (она заменяет правую стену)
  const hasRightAngleSection = config.sections.some((s, i) => i > 0 && config.sections[i - 1].angleToNext === 90);

  // Центрирование с учетом вращения
  const offsetX = maxWidth / 2;
  const offsetY = maxHeight / 2 + scaledHeight / 3;

  // Цвета
  const glassColor = '#60a5fa';
  const wallColor = '#94a3b8';
  const doorColor = '#fbbf24';

  // Автовращение
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
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.6" />
          </linearGradient>
          
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={wallColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={wallColor} stopOpacity="0.5" />
          </linearGradient>

          <pattern id="doorPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={doorColor} opacity="0.3" />
            <path d="M0,10 L20,10" stroke={doorColor} strokeWidth="2" opacity="0.6" />
          </pattern>
        </defs>

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Пол (для ориентации) */}
          <path
            d={`
              M ${to3D(-scaledWidth * 0.2, 0, -scaledDepth * 0.2, rotation).x} ${to3D(-scaledWidth * 0.2, 0, -scaledDepth * 0.2, rotation).y}
              L ${to3D(scaledWidth * 1.2, 0, -scaledDepth * 0.2, rotation).x} ${to3D(scaledWidth * 1.2, 0, -scaledDepth * 0.2, rotation).y}
              L ${to3D(scaledWidth * 1.2, 0, scaledDepth * 1.2, rotation).x} ${to3D(scaledWidth * 1.2, 0, scaledDepth * 1.2, rotation).y}
              L ${to3D(-scaledWidth * 0.2, 0, scaledDepth * 1.2, rotation).x} ${to3D(-scaledWidth * 0.2, 0, scaledDepth * 1.2, rotation).y}
              Z
            `}
            fill="#e2e8f0"
            opacity="0.3"
          />

          {/* ЗАДНЯЯ СТЕНА (теперь спереди - z=0) */}
          {config.solidWalls.includes('back') && (
            <>
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
                strokeWidth="2"
              />
            </>
          )}

          {/* ЛЕВАЯ БОКОВАЯ СТЕНА (от переда до стекла) */}
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
              strokeWidth="2"
              opacity="0.9"
            />
          )}

          {/* ПРАВАЯ БОКОВАЯ СТЕНА (не рисуется если есть секция под углом 90°) */}
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
              strokeWidth="2"
              opacity="0.9"
            />
          )}

          {/* СТЕКЛЯННЫЕ СЕКЦИИ */}
          {sections.map((section, index) => {
            // Используем реальные координаты секции
            const bottomLeft = to3D(section.startX, 0, scaledDepth - section.startZ, rotation);
            const bottomRight = to3D(section.endX, 0, scaledDepth - section.endZ, rotation);
            const topRight = to3D(section.endX, -scaledHeight, scaledDepth - section.endZ, rotation);
            const topLeft = to3D(section.startX, -scaledHeight, scaledDepth - section.startZ, rotation);

            const bottomLeftBack = to3D(section.startX, 0, scaledDepth - section.startZ + 15, rotation);
            const bottomRightBack = to3D(section.endX, 0, scaledDepth - section.endZ + 15, rotation);
            const topRightBack = to3D(section.endX, -scaledHeight, scaledDepth - section.endZ + 15, rotation);
            const topLeftBack = to3D(section.startX, -scaledHeight, scaledDepth - section.startZ + 15, rotation);

            const hasDoor = section.type === 'door' || section.type === 'glass-with-door';
            const doorWidth = section.doorWidth || section.width * 0.6;
            
            // Дверь для угловых секций
            let doorStartX, doorStartZ, doorEndX, doorEndZ;
            if (section.angle === 90) {
              // Вертикальная секция
              const doorOffset = (section.endZ - section.startZ - doorWidth) / 2;
              doorStartX = section.startX;
              doorStartZ = section.startZ + doorOffset;
              doorEndX = section.endX;
              doorEndZ = section.startZ + doorOffset + doorWidth;
            } else {
              // Горизонтальная секция
              const doorOffset = (section.endX - section.startX - doorWidth) / 2;
              doorStartX = section.startX + doorOffset;
              doorStartZ = section.startZ;
              doorEndX = section.startX + doorOffset + doorWidth;
              doorEndZ = section.endZ;
            }

            return (
              <g key={section.id}>
                {/* БОКОВАЯ ГРАНЬ (для объёма) */}
                <path
                  d={`
                    M ${bottomRight.x} ${bottomRight.y}
                    L ${bottomRightBack.x} ${bottomRightBack.y}
                    L ${topRightBack.x} ${topRightBack.y}
                    L ${topRight.x} ${topRight.y}
                    Z
                  `}
                  fill={section.type === 'glass' || section.type === 'glass-with-door' ? glassColor : doorColor}
                  fillOpacity="0.15"
                  stroke="none"
                />
                
                {/* ВЕРХНЯЯ ГРАНЬ */}
                <path
                  d={`
                    M ${topLeft.x} ${topLeft.y}
                    L ${topRight.x} ${topRight.y}
                    L ${topRightBack.x} ${topRightBack.y}
                    L ${topLeftBack.x} ${topLeftBack.y}
                    Z
                  `}
                  fill={section.type === 'glass' || section.type === 'glass-with-door' ? glassColor : doorColor}
                  fillOpacity="0.1"
                  stroke="none"
                />

                {/* ЛИЦЕВАЯ ПАНЕЛЬ */}
                {section.type === 'glass' && (
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
                      strokeWidth="3"
                    />
                    <line
                      x1={topLeft.x + 10}
                      y1={topLeft.y + 10}
                      x2={topLeft.x + 30}
                      y2={topLeft.y + 40}
                      stroke="white"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  </>
                )}

                {section.type === 'door' && (
                  <>
                    <path
                      d={`
                        M ${to3D(doorStartX, 0, scaledDepth - doorStartZ, rotation).x} ${to3D(doorStartX, 0, scaledDepth - doorStartZ, rotation).y}
                        L ${to3D(doorEndX, 0, scaledDepth - doorEndZ, rotation).x} ${to3D(doorEndX, 0, scaledDepth - doorEndZ, rotation).y}
                        L ${to3D(doorEndX, -scaledHeight, scaledDepth - doorEndZ, rotation).x} ${to3D(doorEndX, -scaledHeight, scaledDepth - doorEndZ, rotation).y}
                        L ${to3D(doorStartX, -scaledHeight, scaledDepth - doorStartZ, rotation).x} ${to3D(doorStartX, -scaledHeight, scaledDepth - doorStartZ, rotation).y}
                        Z
                      `}
                      fill="url(#doorPattern)"
                      stroke={doorColor}
                      strokeWidth="4"
                    />
                    <circle
                      cx={to3D((doorStartX + doorEndX) / 2, -scaledHeight * 0.5, scaledDepth - (doorStartZ + doorEndZ) / 2, rotation).x}
                      cy={to3D((doorStartX + doorEndX) / 2, -scaledHeight * 0.5, scaledDepth - (doorStartZ + doorEndZ) / 2, rotation).y}
                      r="6"
                      fill={doorColor}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  </>
                )}

                {section.type === 'glass-with-door' && (
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
                      strokeWidth="3"
                    />
                    <path
                      d={`
                        M ${to3D(doorStartX, 0, scaledDepth - doorStartZ, rotation).x} ${to3D(doorStartX, 0, scaledDepth - doorStartZ, rotation).y}
                        L ${to3D(doorEndX, 0, scaledDepth - doorEndZ, rotation).x} ${to3D(doorEndX, 0, scaledDepth - doorEndZ, rotation).y}
                        L ${to3D(doorEndX, -scaledHeight, scaledDepth - doorEndZ, rotation).x} ${to3D(doorEndX, -scaledHeight, scaledDepth - doorEndZ, rotation).y}
                        L ${to3D(doorStartX, -scaledHeight, scaledDepth - doorStartZ, rotation).x} ${to3D(doorStartX, -scaledHeight, scaledDepth - doorStartZ, rotation).y}
                        Z
                      `}
                      fill="url(#doorPattern)"
                      stroke={doorColor}
                      strokeWidth="4"
                    />
                    <circle
                      cx={to3D((doorStartX + doorEndX) / 2, -scaledHeight * 0.5, scaledDepth - (doorStartZ + doorEndZ) / 2, rotation).x}
                      cy={to3D((doorStartX + doorEndX) / 2, -scaledHeight * 0.5, scaledDepth - (doorStartZ + doorEndZ) / 2, rotation).y}
                      r="6"
                      fill={doorColor}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  </>
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
          
          <rect x="70" y="0" width="12" height="12" fill="url(#doorPattern)" stroke={doorColor} strokeWidth="2" />
          <text x="88" y="10" fontSize="10" fill="#475569">Дверь</text>
          
          <rect x="140" y="0" width="12" height="12" fill="url(#wallGradient)" stroke={wallColor} strokeWidth="2" />
          <text x="158" y="10" fontSize="10" fill="#475569">Стена</text>
        </g>
      </svg>

      <div className="mt-3 pt-3 border-t text-xs text-center text-muted-foreground">
        Угол обзора: {Math.round(rotation)}° | Используйте стрелки для вращения или Play для автоповорота
      </div>
    </div>
  );
}