import {Line} from "react-konva";
import {connection} from "../connection.ts";
import {FC} from "react";
import Konva from "konva";

interface JaggedLineProps {
  coords: [number, number, number, number];
  element: connection;
  collisionRadius: number;
  handleKonvaContextMenu: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
}

const JaggedLine: FC<JaggedLineProps> = ({coords, element, collisionRadius, handleKonvaContextMenu}) => {
    const [x1, y1, x2, y2] = coords;
    const margin = 20;

    let points: number[];


    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
        const dir = x2 > x1 ? 1 : -1;
        const midX = x1 + dir * margin;
        points = [x1, y1, midX, y1, midX, y2, x2, y2];
    }

    else {
        const dir = y2 > y1 ? 1 : -1;
        const midY = y1 + dir * margin;
        points = [x1, y1, x1, midY, x2, midY, x2, y2];
    }
  
  return (
      <>
        {/*The visuals*/}
        <Line
            points={points}
            stroke="black"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
        />
        {/*The collision detection*/}
        <Line
            points={points}
            stroke="transparent"
            strokeWidth={collisionRadius}
            onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {
              e.evt.preventDefault();
              const stage = e.target.getStage();
              if (stage) {
                const pointerPosition = stage.getPointerPosition();
                if (pointerPosition) {
                  handleKonvaContextMenu(e, element.id.toString());
                }
              }
            }}
        />
      </>
  );
}

export default JaggedLine;