import { StructureConfig } from './StructureConfigurator';

interface Structure3DViewProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function Structure3DView({ config, unit }: Structure3DViewProps) {
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
  const maxWidth = 900;
  const maxHeight = 700;
  
  // Изометрическая проекция (перспектива)
  const depth = 500; // глубина помещения в пикселях
  const scale = 0.25; // масштаб для умещения всего
  
  const scaledHeight = height * scale;
  const scaledDepth = depth;

  // Точки для изометрии (более выраженная перспектива)
  const to3D = (x: number, y: number, z: number) => {
    // x - ширина (вправо), y - высота (вверх), z - глубина (вглубь)
    const isoX = x - z * 0.6; // перспектива глубины влево
    const isoY = y + x * 0.2 + z * 0.3; // небольшой подъем
    return { x: isoX, y: isoY };
  };

  // Генерируем путь стеклянных секций
  let currentX = 0;
  const sections = config.sections.map((section, index) => {
    const sectionWidth = convertToMm(section.width) * scale;
    const startX = currentX;
    
    const result = {
      id: section.id,
      type: section.type,
      width: sectionWidth,
      doorWidth: section.doorWidth ? convertToMm(section.doorWidth) * scale : 0,
      startX,
      endX: currentX + sectionWidth,
      angle: index > 0 ? config.sections[index - 1].angleToNext : 0
    };
    
    if (index === 0 || config.sections[index - 1].angleToNext === 180) {
      currentX += sectionWidth;
    }
    
    return result;
  });

  const totalWidth = sections.length > 0 ? sections[sections.length - 1].endX : 0;
  
  // Центрируем по экрану с учётом перспективы
  const offsetX = maxWidth / 2 + scaledDepth * 0.2;
  const offsetY = maxHeight - 150;

  // Цвета
  const glassColor = '#60a5fa'; // синее стекло
  const wallColor = '#94a3b8'; // серая стена
  const doorColor = '#fbbf24'; // желтая дверь

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border-2">
      <div className="text-sm font-medium mb-4 text-center text-muted-foreground">
        3D визуализация (вид в перспективе)
      </div>
      <svg
        width="100%"
        height={maxHeight}
        viewBox={`0 0 ${maxWidth} ${maxHeight}`}
        className="mx-auto"
      >
        <defs>
          {/* Градиент для стекла */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.6" />
          </linearGradient>
          
          {/* Градиент для стены */}
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={wallColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={wallColor} stopOpacity="0.5" />
          </linearGradient>

          {/* Паттерн для двери */}
          <pattern id="doorPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={doorColor} opacity="0.3" />
            <path d="M0,10 L20,10" stroke={doorColor} strokeWidth="2" opacity="0.6" />
          </pattern>
        </defs>

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Пол (для ориентации) */}
          <path
            d={`
              M ${to3D(-100, 0, -100).x} ${to3D(-100, 0, -100).y}
              L ${to3D(totalWidth + 100, 0, -100).x} ${to3D(totalWidth + 100, 0, -100).y}
              L ${to3D(totalWidth + 100, 0, scaledDepth + 100).x} ${to3D(totalWidth + 100, 0, scaledDepth + 100).y}
              L ${to3D(-100, 0, scaledDepth + 100).x} ${to3D(-100, 0, scaledDepth + 100).y}
              Z
            `}
            fill="#e2e8f0"
            opacity="0.3"
          />

          {/* ЗАДНЯЯ СТЕНА (если есть) */}
          {config.solidWalls.includes('back') && (
            <>
              <path
                d={`
                  M ${to3D(0, 0, scaledDepth).x} ${to3D(0, 0, scaledDepth).y}
                  L ${to3D(totalWidth, 0, scaledDepth).x} ${to3D(totalWidth, 0, scaledDepth).y}
                  L ${to3D(totalWidth, -scaledHeight, scaledDepth).x} ${to3D(totalWidth, -scaledHeight, scaledDepth).y}
                  L ${to3D(0, -scaledHeight, scaledDepth).x} ${to3D(0, -scaledHeight, scaledDepth).y}
                  Z
                `}
                fill="url(#wallGradient)"
                stroke={wallColor}
                strokeWidth="2"
              />
              <text
                x={to3D(totalWidth / 2, -scaledHeight / 2, scaledDepth).x}
                y={to3D(totalWidth / 2, -scaledHeight / 2, scaledDepth).y}
                textAnchor="middle"
                fontSize="12"
                fill={wallColor}
                fontWeight="600"
              >
                ГЛУХАЯ СТЕНА
              </text>
            </>
          )}

          {/* ЛЕВАЯ БОКОВАЯ СТЕНА (если есть) */}
          {config.solidWalls.includes('left') && (
            <>
              <path
                d={`
                  M ${to3D(0, 0, 0).x} ${to3D(0, 0, 0).y}
                  L ${to3D(0, 0, scaledDepth).x} ${to3D(0, 0, scaledDepth).y}
                  L ${to3D(0, -scaledHeight, scaledDepth).x} ${to3D(0, -scaledHeight, scaledDepth).y}
                  L ${to3D(0, -scaledHeight, 0).x} ${to3D(0, -scaledHeight, 0).y}
                  Z
                `}
                fill="url(#wallGradient)"
                stroke={wallColor}
                strokeWidth="2"
              />
              <text
                x={to3D(0, -scaledHeight / 2, scaledDepth / 2).x + 10}
                y={to3D(0, -scaledHeight / 2, scaledDepth / 2).y}
                fontSize="10"
                fill={wallColor}
                fontWeight="600"
                transform={`rotate(-30, ${to3D(0, -scaledHeight / 2, scaledDepth / 2).x}, ${to3D(0, -scaledHeight / 2, scaledDepth / 2).y})`}
              >
                СТЕНА
              </text>
            </>
          )}

          {/* ПРАВАЯ БОКОВАЯ СТЕНА (если есть) */}
          {config.solidWalls.includes('right') && (
            <>
              <path
                d={`
                  M ${to3D(totalWidth, 0, 0).x} ${to3D(totalWidth, 0, 0).y}
                  L ${to3D(totalWidth, 0, scaledDepth).x} ${to3D(totalWidth, 0, scaledDepth).y}
                  L ${to3D(totalWidth, -scaledHeight, scaledDepth).x} ${to3D(totalWidth, -scaledHeight, scaledDepth).y}
                  L ${to3D(totalWidth, -scaledHeight, 0).x} ${to3D(totalWidth, -scaledHeight, 0).y}
                  Z
                `}
                fill="url(#wallGradient)"
                stroke={wallColor}
                strokeWidth="2"
              />
              <text
                x={to3D(totalWidth, -scaledHeight / 2, scaledDepth / 2).x - 10}
                y={to3D(totalWidth, -scaledHeight / 2, scaledDepth / 2).y}
                fontSize="10"
                fill={wallColor}
                fontWeight="600"
                transform={`rotate(30, ${to3D(totalWidth, -scaledHeight / 2, scaledDepth / 2).x}, ${to3D(totalWidth, -scaledHeight / 2, scaledDepth / 2).y})`}
              >
                СТЕНА
              </text>
            </>
          )}

          {/* СТЕКЛЯННЫЕ СЕКЦИИ (лицевая сторона) */}
          {sections.map((section, index) => {
            // Координаты углов лицевой панели
            const bottomLeft = to3D(section.startX, 0, 0);
            const bottomRight = to3D(section.endX, 0, 0);
            const topRight = to3D(section.endX, -scaledHeight, 0);
            const topLeft = to3D(section.startX, -scaledHeight, 0);

            // Для объёма - задняя грань
            const bottomLeftBack = to3D(section.startX, 0, 10);
            const bottomRightBack = to3D(section.endX, 0, 10);
            const topRightBack = to3D(section.endX, -scaledHeight, 10);
            const topLeftBack = to3D(section.startX, -scaledHeight, 10);

            const hasDoor = section.type === 'door' || section.type === 'glass-with-door';
            const doorWidth = section.doorWidth || section.width * 0.6;
            const doorStart = section.startX + (section.width - doorWidth) / 2;
            const doorEnd = doorStart + doorWidth;

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
                  fillOpacity="0.2"
                  stroke="none"
                />
                
                {/* ВЕРХНЯЯ ГРАНЬ (для объёма) */}
                <path
                  d={`
                    M ${topLeft.x} ${topLeft.y}
                    L ${topRight.x} ${topRight.y}
                    L ${topRightBack.x} ${topRightBack.y}
                    L ${topLeftBack.x} ${topLeftBack.y}
                    Z
                  `}
                  fill={section.type === 'glass' || section.type === 'glass-with-door' ? glassColor : doorColor}
                  fillOpacity="0.15"
                  stroke="none"
                />
                {/* Стеклянная панель или дверь */}
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
                    {/* Блики на стекле */}
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
                        M ${to3D(doorStart, 0, 0).x} ${to3D(doorStart, 0, 0).y}
                        L ${to3D(doorEnd, 0, 0).x} ${to3D(doorEnd, 0, 0).y}
                        L ${to3D(doorEnd, -scaledHeight, 0).x} ${to3D(doorEnd, -scaledHeight, 0).y}
                        L ${to3D(doorStart, -scaledHeight, 0).x} ${to3D(doorStart, -scaledHeight, 0).y}
                        Z
                      `}
                      fill="url(#doorPattern)"
                      stroke={doorColor}
                      strokeWidth="4"
                    />
                    {/* Ручка двери */}
                    <circle
                      cx={to3D(doorStart + doorWidth * 0.8, -scaledHeight * 0.5, 0).x}
                      cy={to3D(doorStart + doorWidth * 0.8, -scaledHeight * 0.5, 0).y}
                      r="6"
                      fill={doorColor}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  </>
                )}

                {section.type === 'glass-with-door' && (
                  <>
                    {/* Глухое стекло */}
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
                    {/* Дверь поверх */}
                    <path
                      d={`
                        M ${to3D(doorStart, 0, 0).x} ${to3D(doorStart, 0, 0).y}
                        L ${to3D(doorEnd, 0, 0).x} ${to3D(doorEnd, 0, 0).y}
                        L ${to3D(doorEnd, -scaledHeight, 0).x} ${to3D(doorEnd, -scaledHeight, 0).y}
                        L ${to3D(doorStart, -scaledHeight, 0).x} ${to3D(doorStart, -scaledHeight, 0).y}
                        Z
                      `}
                      fill="url(#doorPattern)"
                      stroke={doorColor}
                      strokeWidth="4"
                    />
                    {/* Ручка двери */}
                    <circle
                      cx={to3D(doorStart + doorWidth * 0.8, -scaledHeight * 0.5, 0).x}
                      cy={to3D(doorStart + doorWidth * 0.8, -scaledHeight * 0.5, 0).y}
                      r="6"
                      fill={doorColor}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Номер секции */}
                <text
                  x={to3D((section.startX + section.endX) / 2, -scaledHeight - 20, 0).x}
                  y={to3D((section.startX + section.endX) / 2, -scaledHeight - 20, 0).y}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#475569"
                  fontWeight="600"
                >
                  Секция {index + 1}
                </text>
                <text
                  x={to3D((section.startX + section.endX) / 2, -scaledHeight - 5, 0).x}
                  y={to3D((section.startX + section.endX) / 2, -scaledHeight - 5, 0).y}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {config.sections[index].width} {unit}
                </text>
              </g>
            );
          })}

          {/* Размеры */}
          <g>
            {/* Общая ширина */}
            <line
              x1={to3D(0, 10, 0).x}
              y1={to3D(0, 10, 0).y}
              x2={to3D(totalWidth, 10, 0).x}
              y2={to3D(totalWidth, 10, 0).y}
              stroke="#64748b"
              strokeWidth="2"
              markerStart="url(#arrowStart)"
              markerEnd="url(#arrowEnd)"
            />
            
            {/* Высота */}
            <line
              x1={to3D(totalWidth + 20, 0, 0).x}
              y1={to3D(totalWidth + 20, 0, 0).y}
              x2={to3D(totalWidth + 20, -scaledHeight, 0).x}
              y2={to3D(totalWidth + 20, -scaledHeight, 0).y}
              stroke="#64748b"
              strokeWidth="2"
            />
            <text
              x={to3D(totalWidth + 35, -scaledHeight / 2, 0).x}
              y={to3D(totalWidth + 35, -scaledHeight / 2, 0).y}
              fontSize="11"
              fill="#64748b"
            >
              H: {config.height} {unit}
            </text>
          </g>
        </g>

        {/* Легенда */}
        <g transform={`translate(20, ${maxHeight - 60})`}>
          <rect x="0" y="0" width="15" height="15" fill="url(#glassGradient)" stroke={glassColor} strokeWidth="2" />
          <text x="20" y="12" fontSize="11" fill="#475569">Стекло</text>
          
          <rect x="80" y="0" width="15" height="15" fill="url(#doorPattern)" stroke={doorColor} strokeWidth="2" />
          <text x="100" y="12" fontSize="11" fill="#475569">Дверь</text>
          
          <rect x="160" y="0" width="15" height="15" fill="url(#wallGradient)" stroke={wallColor} strokeWidth="2" />
          <text x="180" y="12" fontSize="11" fill="#475569">Глухая стена</text>
        </g>
      </svg>

      {/* Итоги */}
      <div className="mt-4 pt-4 border-t text-sm text-center space-y-1">
        <div className="text-muted-foreground">
          Конфигурация: <span className="font-medium text-foreground">
            {config.sections.length === 1 && 'Прямая'}
            {config.sections.length === 2 && config.sections[0].angleToNext === 90 && 'Угловая (90°)'}
            {config.sections.length === 2 && config.sections[0].angleToNext !== 90 && 'Составная'}
            {config.sections.length === 3 && 'П-образная'}
            {config.sections.length > 3 && 'Нестандартная'}
          </span>
        </div>
        <div className="text-muted-foreground">
          Секций: <span className="font-medium text-foreground">{config.sections.length}</span>
          {config.solidWalls.length > 0 && (
            <> | Глухих стен: <span className="font-medium text-foreground">{config.solidWalls.length}</span></>
          )}
        </div>
      </div>
    </div>
  );
}