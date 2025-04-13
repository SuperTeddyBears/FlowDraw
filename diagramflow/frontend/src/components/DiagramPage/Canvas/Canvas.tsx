import './Canvas.css';
import { Stage, Layer } from "react-konva";
import { FC, Fragment, useRef, useState, DragEvent } from "react";
import { DiagramElement } from "../DiagramElement";
import ContextMenu from './ContextMenu';
import './ContextMenu.css';
import { useEffect } from 'react';

type ElementEntry = {
  id: string;
  path: string;
};

interface CanvasProps {
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}

const Canvas: FC<CanvasProps> = ({ sidebarRef }) => {
  const [elementPaths, setElementPaths] = useState<ElementEntry[]>([
    { id: 'init-1', path: 'src/assets/diagram-elements/UML/hcAfXP01.svg' },
  ]);


  const [activeTextarea, setActiveTextarea] = useState<{ x: number, y: number, text: string, id: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [textElements, setTextElements] = useState<{ id: string, text: string, x: number, y: number }[]>([]);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetId: string | null;
  }>({ visible: false, x: 0, y: 0, targetId: null });

  const handleContextMenu = (e: any, index: number) => {
    e.evt.preventDefault();

    const sidebarWidth = sidebarRef.current?.offsetWidth || 0;
    const sidebarTop = sidebarRef.current?.getBoundingClientRect().top || 0;

    const clickX = e.evt.clientX - sidebarWidth;
    const clickY = e.evt.clientY - sidebarTop;

    const posX = clickX;
    const posY = clickY;

    setContextMenu({
      visible: true,
      x: posX,
      y: posY,
      targetId: elementPaths[index].id,
    });
  };


  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.querySelector('.context-menu');
      if (menu && !menu.contains(event.target as Node)) {
        handleCloseContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const handleMenuAction = (action: 'bringToFront' | 'sendToBack' | 'delete') => {
    const id = contextMenu.targetId;
    if (!id) return;

    const updated = [...elementPaths];
    const index = updated.findIndex(item => item.id === id);
    if (index === -1) return;

    const [item] = updated.splice(index, 1);

    if (action === 'bringToFront') updated.push(item);
    else if (action === 'sendToBack') updated.unshift(item);

    setElementPaths(updated);
    handleCloseContextMenu();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedPath = e.dataTransfer?.getData('text/plain');
    if (droppedPath) {
      const newId = `element-${Date.now()}-${Math.random()}`;
      const newEntry: ElementEntry = { id: newId, path: droppedPath };
      setElementPaths((prev) => [...prev, newEntry]);
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
          onContextMenu={(e) => e.preventDefault()}
          style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <div className="canvas-grid">
          <Stage width={3000} height={3000} onContextMenu={(e) => e.evt.preventDefault()}>
            <Layer>
              {elementPaths.map((entry, index) => (
                  <Fragment key={entry.id}>
                    <div
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        onContextMenu={(e) => handleContextMenu(e, index)}
                    >
                      <DiagramElement
                          path={entry.path}
                          onTextClick={handleTextClick}
                          textElements={textElements}
                          onAddTextElement={handleAddTextElement}
                      />
                    </div>
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

        {contextMenu.visible && (
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                //onClose={handleCloseContextMenu}
                onAction={handleMenuAction}
            />
        )}
      </div>
  );
};

export default Canvas;
