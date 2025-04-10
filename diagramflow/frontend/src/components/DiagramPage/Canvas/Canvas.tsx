import './Canvas.css';
import {Stage, Layer} from "react-konva";
import {FC, Fragment, useRef, useState, DragEvent} from "react";
import {DiagramElement} from "../DiagramElement.tsx";

const Canvas: FC = () => {
  const [elementPaths, setElementPaths] = useState([
    'src/assets/diagram-elements/UML/hcAfXP01.svg',
  ]);
  
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedPath = e.dataTransfer?.getData('text/plain');
    if (droppedPath) {
      setElementPaths((prev) => [...prev, droppedPath]);
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
        <Stage width={3000} height={3000}>
          <Layer>
            {elementPaths.map((path, index) => (
              <Fragment key={index}>
                <DiagramElement path={path} />
              </Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;