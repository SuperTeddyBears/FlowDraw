import {Image} from 'react-konva';
import {useState} from "react";
import {KonvaEventObject} from "konva/lib/Node";

export const DiagramElement = ({path}: {path: string}) => {
  const img = new window.Image();
  img.src = path;
  
  const [shape, setShape] = useState({
    x: 100,
    y: 100,
    width: img.width,
    height: img.height,
  });
  
  const updatePosition = (e: KonvaEventObject<DragEvent>) => {
    setShape({
      ...shape,
      x: e.target.x(),
      y: e.target.y(),
    });
  };
  
  return (
    <Image
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      draggable={true}
      onDragEnd={updatePosition}
    />
  );
}
