import {Image} from 'react-konva';
import {useState, useEffect} from "react";
import {KonvaEventObject} from "konva/lib/Node";

export const DiagramElement = ({path, x, y}: {path: string, x: number, y: number}) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    const img = new window.Image();
    img.src = path;
    img.onload = () => setImage(img);
  }, [path]);

  const updatePosition = (e: KonvaEventObject<DragEvent>) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  return (
    <Image
      image={image}
      x={position.x}
      y={position.y}
      draggable={true}
      onDragEnd={updatePosition}
    />
  );
};
