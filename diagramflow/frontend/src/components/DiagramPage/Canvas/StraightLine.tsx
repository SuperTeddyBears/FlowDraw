import {Line} from "react-konva";
import Konva from "konva";
import {FC} from "react";
import {connection} from "../connection.ts";

interface StraightLineProps {
  coords: [number, number, number, number];
  element: connection;
  collisionRadius: number;
  handleKonvaContextMenu: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
}

const StraightLine: FC<StraightLineProps> = ({coords, element, collisionRadius, handleKonvaContextMenu}) => {
  return (
    <>
      {/*The visuals*/}
      <Line
        points={coords}
        stroke="black"
        strokeWidth={2}
      />
      
      {/*The collision detection*/}
      <Line
        points={coords}
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

export default StraightLine;