import {Line, Rect} from "react-konva";
import {shape} from "../types/shape.ts";
import {useState} from "react";
import {KonvaEventObject} from "konva/lib/Node";

export const KonvaShape = () => {
  const [shapeParams, setShapeParams] = useState<shape>({ x: 100, y: 100, width: 100, height: 100 });
  const [visibleInterface, setVisibleInterface] = useState<boolean>(false);
  
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    // Update shape position when the rectangle is dragged
    setShapeParams({
      ...shapeParams,
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  return (
    <>
      <Rect
        draggable={true}
        x={shapeParams.x}
        y={shapeParams.y}
        width={shapeParams.width}
        height={shapeParams.height}
        stroke={'black'}
        fill={'transparent'}
        onDragMove={handleDragMove}
        onCLick={() => setVisibleInterface(prevState => !prevState)}
      />
      <ShapeSizeInterface
        x={shapeParams.x}
        y={shapeParams.y}
        width={shapeParams.width}
        height={shapeParams.height}
        visible={visibleInterface}
      />
    </>
  )
}

const ShapeSizeInterface = ({ x, y, width, height, visible }: { x: number; y: number; width: number; height: number, visible: boolean }) => {
  const padding = 20;
  const points = [
    0,                    0,
    width + 2 * padding,  0,
    width + 2 * padding,  height + 2 * padding,
    0,                    height + 2 * padding,
    0,                    0,
  ]
  const interface_square_width: number = 10;
  
  return (
    <>
      <Rect visible={visible} draggable={true} x={x - padding - interface_square_width / 2} y={y - padding - interface_square_width / 2} width={interface_square_width} height={interface_square_width} fill="blue" />
      <Rect visible={visible} draggable={true} x={x + padding - interface_square_width / 2 + width} y={y - padding - interface_square_width / 2} width={interface_square_width} height={interface_square_width} fill="blue" />
      <Rect visible={visible} draggable={true} x={x - padding - interface_square_width / 2} y={y + padding - interface_square_width / 2 + height} width={interface_square_width} height={interface_square_width} fill="blue" />
      <Rect visible={visible} draggable={true} x={x + padding - interface_square_width / 2 + width} y={y + padding - interface_square_width / 2 + height} width={interface_square_width} height={interface_square_width} fill="blue" />
      <Line x={x - padding} y={y - padding} points={points} stroke="blue" visible={visible} />
    </>
  )
}