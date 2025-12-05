interface SketchDoorProps {
  doorWidth: number;
  doorHeight: number;
  doorX: number;
  doorY: number;
  partitionWidth: number;
  doorPanels: 1 | 2;
  hingesOnLeft: boolean;
}

export default function SketchDoor({
  doorWidth,
  doorHeight,
  doorX,
  doorY,
  partitionWidth,
  doorPanels,
  hingesOnLeft
}: SketchDoorProps) {
  if (!(doorWidth > 0 && doorHeight > 0 && doorX >= 0 && (doorX + doorWidth) <= partitionWidth)) {
    return null;
  }

  return (
    <>
      {doorPanels === 1 ? (
        <>
          {/* Одна створка */}
          <rect
            x={doorX}
            y={doorY}
            width={doorWidth}
            height={doorHeight}
            fill="url(#door-gradient)"
            stroke="#f59e0b"
            strokeWidth="5"
            rx="4"
          />
          
          {/* Петли (2 шт) - слева или справа от двери */}
          {hingesOnLeft ? (
            <>
              {/* Петли слева */}
              <rect
                x={doorX + 15}
                y={doorY + doorHeight * 0.15}
                width="35"
                height="55"
                fill="#78716c"
                stroke="#44403c"
                strokeWidth="3"
                rx="8"
              />
              <rect
                x={doorX + 15}
                y={doorY + doorHeight * 0.75}
                width="35"
                height="55"
                fill="#78716c"
                stroke="#44403c"
                strokeWidth="3"
                rx="8"
              />
              {/* Ручка справа */}
              <rect
                x={doorX + doorWidth - 60}
                y={doorY + doorHeight / 2 - 80}
                width="15"
                height="160"
                fill="#57534e"
                stroke="#292524"
                strokeWidth="2"
                rx="7"
              />
            </>
          ) : (
            <>
              {/* Петли справа */}
              <rect
                x={doorX + doorWidth - 50}
                y={doorY + doorHeight * 0.15}
                width="35"
                height="55"
                fill="#78716c"
                stroke="#44403c"
                strokeWidth="3"
                rx="8"
              />
              <rect
                x={doorX + doorWidth - 50}
                y={doorY + doorHeight * 0.75}
                width="35"
                height="55"
                fill="#78716c"
                stroke="#44403c"
                strokeWidth="3"
                rx="8"
              />
              {/* Ручка слева */}
              <rect
                x={doorX + 45}
                y={doorY + doorHeight / 2 - 80}
                width="15"
                height="160"
                fill="#57534e"
                stroke="#292524"
                strokeWidth="2"
                rx="7"
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* Две створки (только при центральном расположении) */}
          <rect
            x={doorX}
            y={doorY}
            width={doorWidth / 2 - 2}
            height={doorHeight}
            fill="url(#door-gradient)"
            stroke="#f59e0b"
            strokeWidth="5"
            rx="4"
          />
          <rect
            x={doorX + doorWidth / 2 + 2}
            y={doorY}
            width={doorWidth / 2 - 2}
            height={doorHeight}
            fill="url(#door-gradient)"
            stroke="#f59e0b"
            strokeWidth="5"
            rx="4"
          />
          
          {/* Петли на краях (левая створка - петли слева, правая - справа) */}
          <rect
            x={doorX + 15}
            y={doorY + doorHeight * 0.15}
            width="30"
            height="50"
            fill="#78716c"
            stroke="#44403c"
            strokeWidth="3"
            rx="8"
          />
          <rect
            x={doorX + 15}
            y={doorY + doorHeight * 0.75}
            width="30"
            height="50"
            fill="#78716c"
            stroke="#44403c"
            strokeWidth="3"
            rx="8"
          />
          
          <rect
            x={doorX + doorWidth - 45}
            y={doorY + doorHeight * 0.15}
            width="30"
            height="50"
            fill="#78716c"
            stroke="#44403c"
            strokeWidth="3"
            rx="8"
          />
          <rect
            x={doorX + doorWidth - 45}
            y={doorY + doorHeight * 0.75}
            width="30"
            height="50"
            fill="#78716c"
            stroke="#44403c"
            strokeWidth="3"
            rx="8"
          />
          
          {/* Ручки в центре каждой створки */}
          <rect
            x={doorX + doorWidth / 4 - 7.5}
            y={doorY + doorHeight / 2 - 80}
            width="15"
            height="160"
            fill="#57534e"
            stroke="#292524"
            strokeWidth="2"
            rx="7"
          />
          <rect
            x={doorX + 3 * doorWidth / 4 - 7.5}
            y={doorY + doorHeight / 2 - 80}
            width="15"
            height="160"
            fill="#57534e"
            stroke="#292524"
            strokeWidth="2"
            rx="7"
          />
        </>
      )}
    </>
  );
}
