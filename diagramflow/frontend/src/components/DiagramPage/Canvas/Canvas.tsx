import './Canvas.css';
import { Stage, Layer } from "react-konva";
import { FC, Fragment, useRef, useState, DragEvent } from "react";
import { DiagramElement } from "../DiagramElement";

const Canvas: FC = () => {
  const [elementPaths, setElementPaths] = useState([
    'src/assets/diagram-elements/UML/hcAfXP01.svg',
  ]);

  const [activeTextarea, setActiveTextarea] = useState<{ x: number, y: number, text: string, id: string } | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [textElements, setTextElements] = useState<{ id: string, text: string, x: number, y: number }[]>([]);

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

  const handleTextClick = (x: number, y: number, currentText: string, id: string) => {
    setActiveTextarea({ x, y, text: currentText, id });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTextarea) {
      setActiveTextarea({ ...activeTextarea, text: e.target.value });
    }
  };


  const handleTextareaBlur = () => {
    if (activeTextarea) {
      const updatedTextElements = textElements.map((item) =>
          item.id === activeTextarea.id
              ? { ...item, text: activeTextarea.text }
              : item
      );
      setTextElements(updatedTextElements);
      setActiveTextarea(null);
    }
  };

  const handleAddTextElement = (x: number, y: number) => {
    const newId = `text-${Date.now()}`;
    const newTextElement = {
      id: newId,
      text: 'Nowy tekst',
      x,
      y
    };
    setTextElements([...textElements, newTextElement]);
  };


  return (
      <div
          className="canvas-container"
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <div className="canvas-grid">
          <Stage width={3000} height={3000}>
            <Layer>
              {elementPaths.map((path, index) => (
                  <Fragment key={index}>
                    <DiagramElement
                        path={path}
                        onTextClick={handleTextClick}
                        textElements={textElements}
                        onAddTextElement={handleAddTextElement}
                    />
                  </Fragment>
              ))}
            </Layer>
          </Stage>
        </div>


        {activeTextarea && (
            <textarea
                value={activeTextarea.text}
                onChange={handleTextChange}
                onBlur={handleTextareaBlur}
                style={{
                  position: 'absolute',
                  top: activeTextarea.y,
                  left: activeTextarea.x,
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  padding: '2px',
                  background: 'white',
                  resize: 'none',
                  zIndex: 10,
                }}
                autoFocus
            />
        )}
      </div>
  );
};

export default Canvas;
