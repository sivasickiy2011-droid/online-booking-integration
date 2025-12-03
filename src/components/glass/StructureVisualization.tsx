import { StructureConfig } from './StructureConfigurator';

interface StructureVisualizationProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function StructureVisualization({ config, unit }: StructureVisualizationProps) {
  const convertToMm = (value: string) => {
    const num = parseFloat(value) || 0;
    return unit === 'cm' ? num * 10 : num;
  };

  const totalWidth = config.sections.reduce((sum, s) => sum + convertToMm(s.width), 0);
  const height = convertToMm(config.height);
  
  // Масштабируем для отображения (max 600px width, 400px height)
  const scale = Math.min(600 / (totalWidth || 1000), 400 / (height || 1900));
  
  const scaledWidth = totalWidth * scale;
  const scaledHeight = height * scale;

  // Генерируем путь для линии секций с учётом углов
  const generatePath = () => {
    let x = 0;
    let y = scaledHeight;
    const points: { x: number; y: number }[] = [{ x, y }];

    config.sections.forEach((section, index) => {
      const sectionWidth = convertToMm(section.width) * scale;
      
      if (index === 0) {
        // Первая секция - всегда горизонтально
        x += sectionWidth;
        points.push({ x, y });
      } else {
        const angle = config.sections[index - 1].angleToNext || 180;
        
        if (angle === 180) {
          // Прямо
          x += sectionWidth;
          points.push({ x, y });
        } else if (angle === 90) {
          // Поворот на 90° (вглубь)
          y -= sectionWidth;
          points.push({ x, y });
        } else if (angle === 135) {
          // Поворот на 135°
          const dx = sectionWidth * Math.cos((135 * Math.PI) / 180);
          const dy = sectionWidth * Math.sin((135 * Math.PI) / 180);
          x += dx;
          y += dy;
          points.push({ x, y });
        }
      }
    });

    return points;
  };

  const pathPoints = generatePath();
  const pathD = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const hasSolidWalls = config.solidWalls.length > 0;

  return (
    <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed">
      <div className="text-sm font-medium mb-4 text-center text-muted-foreground">
        Схема вид сверху
      </div>
      <svg
        width="100%"
        height="300"
        viewBox={`-50 -50 ${Math.max(scaledWidth, 400) + 100} ${Math.max(scaledHeight, 300) + 100}`}
        className="mx-auto"
      >
        {/* Глухие стены */}
        {hasSolidWalls && (
          <g>
            {/* Левая стена */}
            {config.solidWalls.includes('left') && (
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={scaledHeight}
                stroke="#94a3b8"
                strokeWidth="8"
                strokeLinecap="round"
              />
            )}
            
            {/* Правая стена (для прямых конструкций) */}
            {config.solidWalls.includes('right') && pathPoints.length > 0 && (
              <line
                x1={pathPoints[pathPoints.length - 1].x}
                y1={0}
                x2={pathPoints[pathPoints.length - 1].x}
                y2={scaledHeight}
                stroke="#94a3b8"
                strokeWidth="8"
                strokeLinecap="round"
              />
            )}
            
            {/* Задняя стена */}
            {config.solidWalls.includes('back') && (
              <line
                x1={0}
                y1={0}
                x2={pathPoints[pathPoints.length - 1]?.x || scaledWidth}
                y2={0}
                stroke="#94a3b8"
                strokeWidth="8"
                strokeLinecap="round"
              />
            )}
          </g>
        )}

        {/* Стеклянные секции */}
        <g>
          <path
            d={pathD}
            stroke="#3b82f6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Точки соединения секций */}
          {pathPoints.slice(1, -1).map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
            />
          ))}
          
          {/* Маркеры секций */}
          {config.sections.map((section, index) => {
            const sectionWidth = convertToMm(section.width) * scale;
            const startX = pathPoints[index].x;
            const midX = (pathPoints[index].x + pathPoints[index + 1].x) / 2;
            const midY = (pathPoints[index].y + pathPoints[index + 1].y) / 2;
            
            // Иконка типа секции
            let icon = '▯'; // глухое стекло
            if (section.type === 'door') icon = '⇄';
            if (section.type === 'glass-with-door') icon = '⇄▯';
            
            return (
              <g key={section.id}>
                {/* Подсветка секции */}
                <rect
                  x={startX}
                  y={midY - 15}
                  width={sectionWidth}
                  height={30}
                  fill="#3b82f6"
                  fillOpacity="0.1"
                  rx="4"
                />
                
                {/* Номер и тип секции */}
                <text
                  x={midX}
                  y={midY - 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {index + 1}
                </text>
                <text
                  x={midX}
                  y={midY + 5}
                  textAnchor="middle"
                  fontSize="18"
                  fill="#3b82f6"
                >
                  {icon}
                </text>
                
                {/* Размер */}
                <text
                  x={midX}
                  y={midY + 35}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {section.width} {unit}
                </text>
                
                {/* Угол к следующей секции */}
                {index < config.sections.length - 1 && section.angleToNext !== 180 && (
                  <text
                    x={pathPoints[index + 1].x + 10}
                    y={pathPoints[index + 1].y - 10}
                    fontSize="10"
                    fill="#f59e0b"
                    fontWeight="600"
                  >
                    {section.angleToNext}°
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Легенда */}
        <g transform={`translate(0, ${Math.max(scaledHeight, 300) + 20})`}>
          <text x="0" y="0" fontSize="10" fill="#64748b">
            ▯ - Глухое стекло  |  ⇄ - Дверь  |  ⇄▯ - Стекло + дверь
          </text>
          {hasSolidWalls && (
            <text x="0" y="15" fontSize="10" fill="#94a3b8">
              ━ - Глухая стена
            </text>
          )}
        </g>
      </svg>

      {/* Итоговые размеры */}
      <div className="mt-4 pt-4 border-t text-sm text-center space-y-1">
        <div className="text-muted-foreground">
          Общая ширина лицевой части: <span className="font-medium text-foreground">{totalWidth.toFixed(0)} мм</span>
        </div>
        <div className="text-muted-foreground">
          Высота: <span className="font-medium text-foreground">{height.toFixed(0)} мм</span>
        </div>
        {hasSolidWalls && (
          <div className="text-xs text-muted-foreground mt-2">
            Глухие стены: {config.solidWalls.map(w => {
              if (w === 'left') return 'левая';
              if (w === 'right') return 'правая';
              return 'задняя';
            }).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
