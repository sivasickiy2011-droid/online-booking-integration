import { StructureConfig } from './StructureConfigurator';

interface StructureTopViewProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function StructureTopView({ config, unit }: StructureTopViewProps) {
  const convertToMm = (value: string) => {
    const num = parseFloat(value) || 0;
    return unit === 'cm' ? num * 10 : num;
  };

  if (!config.sections || config.sections.length === 0) {
    return null;
  }

  const depthMm = 1200; // глубина помещения 1200мм по умолчанию
  const maxSize = 400;
  
  // Вычисляем общую ширину
  const totalWidthMm = config.sections.reduce((sum, s) => sum + convertToMm(s.width), 0);
  const scale = Math.min(maxSize / totalWidthMm, maxSize / depthMm) * 0.7;
  
  const scaledDepth = depthMm * scale;

  // Генерируем секции с углами
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
      // Первая секция всегда горизонтальна
      endX = currentX + sectionWidth;
      currentX = endX;
    } else {
      if (angle === 180) {
        // Прямо
        endX = currentX + sectionWidth;
        currentX = endX;
      } else if (angle === 90) {
        // Поворот на 90° вглубь
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
      startX,
      startZ,
      endX,
      endZ,
      width: sectionWidth,
      doorWidth: section.doorWidth ? convertToMm(section.doorWidth) * scale : 0
    };
  });

  const maxX = Math.max(...sections.map(s => Math.max(s.startX, s.endX)));
  const maxZ = Math.max(...sections.map(s => Math.max(s.startZ, s.endZ)));
  
  // Проверяем, есть ли секция с углом 90° (она заменяет правую стену)
  const hasRightAngleSection = config.sections.some((s, i) => i > 0 && config.sections[i - 1].angleToNext === 90);
  
  const offsetX = 50;
  // Стекло всегда внизу (большой Y = низ)
  const offsetY = 50;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-4 border-2">
      <div className="text-sm font-medium mb-3 text-center text-muted-foreground">
        Вид сверху (схема)
      </div>
      <svg
        width="100%"
        height={maxSize}
        viewBox={`0 0 ${maxSize} ${maxSize}`}
        className="mx-auto"
      >
        <defs>
          <pattern id="topDoorPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#fbbf24" opacity="0.2" />
            <line x1="0" y1="5" x2="10" y2="5" stroke="#fbbf24" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Глухие стены */}
          {config.solidWalls.includes('back') && (
            <>
              <line
                x1={0}
                y1={scaledDepth}
                x2={maxX}
                y2={scaledDepth}
                stroke="#94a3b8"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <text
                x={maxX / 2}
                y={scaledDepth + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontWeight="600"
              >
                СТЕНА
              </text>
            </>
          )}
          
          {config.solidWalls.includes('left') && (
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={scaledDepth}
              stroke="#94a3b8"
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
          
          {/* Правая стена не рисуется если есть секция под углом 90° */}
          {config.solidWalls.includes('right') && !hasRightAngleSection && (
            <line
              x1={maxX}
              y1={0}
              x2={maxX}
              y2={scaledDepth}
              stroke="#94a3b8"
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}

          {/* Стеклянные секции */}
          {sections.map((section, index) => {
            const hasDoor = section.type === 'door' || section.type === 'glass-with-door';
            
            return (
              <g key={section.id}>
                {/* Линия секции */}
                <line
                  x1={section.startX}
                  y1={section.startZ}
                  x2={section.endX}
                  y2={section.endZ}
                  stroke={hasDoor ? "#fbbf24" : "#3b82f6"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Дверь (если есть) */}
                {hasDoor && section.doorWidth > 0 && (
                  <line
                    x1={section.startX + (section.endX - section.startX) * 0.3}
                    y1={section.startZ + (section.endZ - section.startZ) * 0.3}
                    x2={section.startX + (section.endX - section.startX) * 0.7}
                    y2={section.startZ + (section.endZ - section.startZ) * 0.7}
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="4,4"
                  />
                )}
                
                {/* Номер секции */}
                <circle
                  cx={(section.startX + section.endX) / 2}
                  cy={(section.startZ + section.endZ) / 2}
                  r="12"
                  fill="white"
                  stroke={hasDoor ? "#fbbf24" : "#3b82f6"}
                  strokeWidth="2"
                />
                <text
                  x={(section.startX + section.endX) / 2}
                  y={(section.startZ + section.endZ) / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                  fontWeight="600"
                >
                  {index + 1}
                </text>
                
                {/* Размер секции */}
                <text
                  x={(section.startX + section.endX) / 2}
                  y={(section.startZ + section.endZ) / 2 - 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {config.sections[index].width} {unit}
                </text>
              </g>
            );
          })}

          {/* Помещение (пунктир) */}
          <rect
            x="-10"
            y="-10"
            width={maxX + 20}
            height={scaledDepth + 20}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </g>

        {/* Легенда */}
        <g transform={`translate(10, ${maxSize - 35})`}>
          <line x1="0" y1="8" x2="20" y2="8" stroke="#3b82f6" strokeWidth="4" />
          <text x="25" y="12" fontSize="10" fill="#64748b">Стекло</text>
          
          <line x1="80" y1="8" x2="100" y2="8" stroke="#fbbf24" strokeWidth="4" />
          <text x="105" y="12" fontSize="10" fill="#64748b">Дверь</text>
          
          <line x1="160" y1="8" x2="180" y2="8" stroke="#94a3b8" strokeWidth="6" />
          <text x="185" y="12" fontSize="10" fill="#64748b">Стена</text>
        </g>
      </svg>
    </div>
  );
}