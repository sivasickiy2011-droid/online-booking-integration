import Structure3DDoor from './Structure3DDoor';

interface Point3D {
  x: number;
  y: number;
}

interface Section3D {
  id: string;
  type: string;
  width: number;
  doorWidth: number;
  doorType?: 'single' | 'double';
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  angle: number;
}

interface Structure3DSceneProps {
  maxWidth: number;
  maxHeight: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scaledWidth: number;
  scaledHeight: number;
  scaledDepth: number;
  sections: Section3D[];
  solidWalls: string[];
  hasRightAngleSection: boolean;
  maxX: number;
  maxZ: number;
  to3D: (x: number, y: number, z: number, angle: number) => Point3D;
  glassColor: string;
  wallColor: string;
  doorFrameColor: string;
  doorGlassColor: string;
  handleColor: string;
}

export default function Structure3DScene({
  maxWidth,
  maxHeight,
  offsetX,
  offsetY,
  rotation,
  scaledWidth,
  scaledHeight,
  scaledDepth,
  sections,
  solidWalls,
  hasRightAngleSection,
  maxX,
  maxZ,
  to3D,
  glassColor,
  wallColor,
  doorFrameColor,
  doorGlassColor,
  handleColor
}: Structure3DSceneProps) {
  const renderDoorComponent = (
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

    const doorBL = to3D(doorStartX, 0, doorStartZ, rotation);
    const doorBR = to3D(doorEndX, 0, doorEndZ, rotation);
    const doorTR = to3D(doorEndX, scaledHeight, doorEndZ, rotation);
    const doorTL = to3D(doorStartX, scaledHeight, doorStartZ, rotation);

    return (
      <Structure3DDoor
        doorBL={doorBL}
        doorBR={doorBR}
        doorTR={doorTR}
        doorTL={doorTL}
        doorWidthPx={doorWidthPx}
        isDouble={isDouble}
        doorFrameColor={doorFrameColor}
        doorGlassColor={doorGlassColor}
        handleColor={handleColor}
      />
    );
  };

  return (
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
        <path
          d={`
            M ${to3D(-maxX * 0.2, 0, -maxZ * 0.2, rotation).x} ${to3D(-maxX * 0.2, 0, -maxZ * 0.2, rotation).y}
            L ${to3D(maxX * 1.2, 0, -maxZ * 0.2, rotation).x} ${to3D(maxX * 1.2, 0, -maxZ * 0.2, rotation).y}
            L ${to3D(maxX * 1.2, 0, maxZ * 1.2, rotation).x} ${to3D(maxX * 1.2, 0, maxZ * 1.2, rotation).y}
            L ${to3D(-maxX * 0.2, 0, maxZ * 1.2, rotation).x} ${to3D(-maxX * 0.2, 0, maxZ * 1.2, rotation).y}
            Z
          `}
          fill="#e2e8f0"
          opacity="0.2"
        />

        {solidWalls.includes('back') && (
          <path
            d={`
              M ${to3D(0, 0, maxZ, rotation).x} ${to3D(0, 0, maxZ, rotation).y}
              L ${to3D(maxX, 0, maxZ, rotation).x} ${to3D(maxX, 0, maxZ, rotation).y}
              L ${to3D(maxX, scaledHeight, maxZ, rotation).x} ${to3D(maxX, scaledHeight, maxZ, rotation).y}
              L ${to3D(0, scaledHeight, maxZ, rotation).x} ${to3D(0, scaledHeight, maxZ, rotation).y}
              Z
            `}
            fill="url(#wallGradient)"
            stroke={wallColor}
            strokeWidth="1"
          />
        )}

        {solidWalls.includes('left') && (
          <path
            d={`
              M ${to3D(0, 0, 0, rotation).x} ${to3D(0, 0, 0, rotation).y}
              L ${to3D(0, 0, maxZ, rotation).x} ${to3D(0, 0, maxZ, rotation).y}
              L ${to3D(0, scaledHeight, maxZ, rotation).x} ${to3D(0, scaledHeight, maxZ, rotation).y}
              L ${to3D(0, scaledHeight, 0, rotation).x} ${to3D(0, scaledHeight, 0, rotation).y}
              Z
            `}
            fill="url(#wallGradient)"
            stroke={wallColor}
            strokeWidth="1"
            opacity="0.9"
          />
        )}

        {solidWalls.includes('right') && !hasRightAngleSection && (
          <path
            d={`
              M ${to3D(maxX, 0, 0, rotation).x} ${to3D(maxX, 0, 0, rotation).y}
              L ${to3D(maxX, 0, maxZ, rotation).x} ${to3D(maxX, 0, maxZ, rotation).y}
              L ${to3D(maxX, scaledHeight, maxZ, rotation).x} ${to3D(maxX, scaledHeight, maxZ, rotation).y}
              L ${to3D(maxX, scaledHeight, 0, rotation).x} ${to3D(maxX, scaledHeight, 0, rotation).y}
              Z
            `}
            fill="url(#wallGradient)"
            stroke={wallColor}
            strokeWidth="1"
            opacity="0.9"
          />
        )}

        {sections.map((section, index) => {
          const bottomLeft = to3D(section.startX, 0, section.startZ, rotation);
          const bottomRight = to3D(section.endX, 0, section.endZ, rotation);
          const topRight = to3D(section.endX, scaledHeight, section.endZ, rotation);
          const topLeft = to3D(section.startX, scaledHeight, section.startZ, rotation);

          const hasDoor = section.type === 'door' || section.type === 'glass-with-door';
          const doorWidth = section.doorWidth || section.width * 0.6;
          const isDouble = section.doorType === 'double';

          return (
            <g key={section.id}>
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
                  
                  <rect
                    x={bottomLeft.x - 4}
                    y={bottomLeft.y + (topLeft.y - bottomLeft.y) * 0.05}
                    width="8"
                    height={Math.abs(topLeft.y - bottomLeft.y) * 0.08}
                    fill="#334155"
                    rx="2"
                  />
                  <rect
                    x={bottomLeft.x - 4}
                    y={bottomLeft.y + (topLeft.y - bottomLeft.y) * 0.87}
                    width="8"
                    height={Math.abs(topLeft.y - bottomLeft.y) * 0.08}
                    fill="#334155"
                    rx="2"
                  />
                  <rect
                    x={bottomRight.x - 4}
                    y={bottomRight.y + (topRight.y - bottomRight.y) * 0.05}
                    width="8"
                    height={Math.abs(topRight.y - bottomRight.y) * 0.08}
                    fill="#334155"
                    rx="2"
                  />
                  <rect
                    x={bottomRight.x - 4}
                    y={bottomRight.y + (topRight.y - bottomRight.y) * 0.87}
                    width="8"
                    height={Math.abs(topRight.y - bottomRight.y) * 0.08}
                    fill="#334155"
                    rx="2"
                  />
                  
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

              {hasDoor && renderDoorComponent(
                section.startX,
                section.startZ,
                section.endX,
                section.endZ,
                doorWidth,
                isDouble
              )}

              <text
                x={to3D((section.startX + section.endX) / 2, scaledHeight + 20, (section.startZ + section.endZ) / 2, rotation).x}
                y={to3D((section.startX + section.endX) / 2, scaledHeight + 20, (section.startZ + section.endZ) / 2, rotation).y}
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

      <g transform={`translate(20, ${maxHeight - 50})`}>
        <rect x="0" y="0" width="12" height="12" fill="url(#glassGradient)" stroke={glassColor} strokeWidth="2" />
        <text x="18" y="10" fontSize="10" fill="#475569">Стекло</text>
        
        <rect x="70" y="0" width="12" height="12" fill={doorGlassColor} fillOpacity="0.5" stroke={doorFrameColor} strokeWidth="2" />
        <text x="88" y="10" fontSize="10" fill="#475569">Дверь</text>
        
        <rect x="140" y="0" width="12" height="12" fill="url(#wallGradient)" stroke={wallColor} strokeWidth="1" />
        <text x="158" y="10" fontSize="10" fill="#475569">Стена</text>
      </g>
    </svg>
  );
}