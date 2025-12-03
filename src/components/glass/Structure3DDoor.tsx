interface Structure3DDoorProps {
  doorBL: { x: number; y: number };
  doorBR: { x: number; y: number };
  doorTR: { x: number; y: number };
  doorTL: { x: number; y: number };
  doorWidthPx: number;
  isDouble: boolean;
  doorFrameColor: string;
  doorGlassColor: string;
  handleColor: string;
}

export default function Structure3DDoor({
  doorBL,
  doorBR,
  doorTR,
  doorTL,
  doorWidthPx,
  isDouble,
  doorFrameColor,
  doorGlassColor,
  handleColor
}: Structure3DDoorProps) {
  const frameThickness = 8;
  const doorHeight = Math.abs(doorTL.y - doorBL.y);

  return (
    <g>
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

      {isDouble ? (
        <>
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
          
          <circle
            cx={doorBR.x - doorWidthPx * 0.15}
            cy={(doorBR.y + doorTR.y) / 2}
            r="4"
            fill={handleColor}
          />
        </>
      )}

      <rect
        x={doorBL.x - 3}
        y={doorBL.y + (doorTL.y - doorBL.y) * 0.05}
        width="6"
        height={doorHeight * 0.08}
        fill={handleColor}
        rx="2"
      />
      <rect
        x={doorBL.x - 3}
        y={doorBL.y + (doorTL.y - doorBL.y) * 0.87}
        width="6"
        height={doorHeight * 0.08}
        fill={handleColor}
        rx="2"
      />
    </g>
  );
}