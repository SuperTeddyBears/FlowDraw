import './Canvas.css';
import {Stage, Layer} from "react-konva";
import {FC, Fragment, useState} from "react";
import {DiagramElement} from "../DiagramElement.tsx";

const Canvas: FC = () => {
  const [diagramElements] = useState([<DiagramElement path={'src/assets/diagram-elements/UML/hcAfXP01.svg'} />]);
  
  return (
    <div className="canvas-container">
      <div className="canvas-grid">
        <Stage width={3000} height={3000}>
          <Layer>
            {diagramElements.map((element, index) => (
              <Fragment key={index}>{element}</Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;