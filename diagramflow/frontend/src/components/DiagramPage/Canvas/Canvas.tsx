import './Canvas.css';
import {Stage, Layer} from "react-konva";
import {FC, useRef, useState, DragEvent} from "react";
import {DiagramElement} from "../DiagramElement.tsx";

const Canvas: FC = () => {
  const [elements, setElements] = useState<{ path: string; x: number; y: number }[]>([
    { path: 'src/assets/diagram-elements/UML/hcAfXP01.svg', x: 100, y: 100 },
  ]);
  
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedPath = e.dataTransfer?.getData('text/plain');
    if (droppedPath && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
      const y = e.clientY - rect.top + canvasRef.current.scrollTop;
      setElements((prev) => [...prev, { path: droppedPath, x, y }]);
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  return (
    <div
      className="canvas-container"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="canvas-grid">
        <Stage
          width={3000} 
          height={3000}
        >
          <Layer>
            {elements.map((element, index) => (
              <DiagramElement
                key={index}
                path={element.path}
                x={element.x}
                y={element.y}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;