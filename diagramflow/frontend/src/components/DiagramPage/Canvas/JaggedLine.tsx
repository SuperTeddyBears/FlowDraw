import {Line} from "react-konva";
import {connection} from "../connection.ts";
import {FC} from "react";
import Konva from "konva";

interface JaggedLineProps {
  coords: [number, number, number, number, number, number,  string, string];
  element: connection;
  collisionRadius: number;
  handleKonvaContextMenu: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
}

const JaggedLine: FC<JaggedLineProps> = ({coords, element, collisionRadius, handleKonvaContextMenu}) => {
    let [x1, y1, x2, y2, startAngle, endAngle, imageStart, imageEnd] = coords;
    const margin = 20;


    //adjust the start and end points of the line to be at the start of the connection endpoints
    //If circle is an endpoint, nothing happened
    if (imageStart) {
        const moveX = Math.cos(startAngle * Math.PI / 180) * (50);
        const moveY = Math.sin(startAngle * Math.PI / 180) * (50);

        x1 = x1 - moveX;
        y1 = y1 - moveY;
    }

    if(imageEnd) {
        const moveX2 = Math.cos(endAngle * Math.PI / 180) * (50);
        const moveY2 = Math.sin(endAngle * Math.PI / 180) * (50);
        x2 = x2 - moveX2;
        y2 = y2 - moveY2;
    }
    //////////////////////////////////

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