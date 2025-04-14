import './Canvas.css';
import './ContextMenu.css';
import React, {
  FC,
  Fragment,
  useState,
  useEffect,
  DragEvent,
} from 'react';
import {Stage, Layer} from 'react-konva';
import {KonvaEventObject} from 'konva/lib/Node';
import {DiagramElement} from '../DiagramElement';
import ContextMenu from './ContextMenu';

type ElementEntry = {
  id: string;
  path: string;
};

interface CanvasProps {
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}

const Canvas: FC<CanvasProps> = ({sidebarRef}) => {
  const [elementPaths, setElementPaths] = useState<ElementEntry[]>([
    {
      id: 'init-1',
      path: 'src/assets/diagram-elements/UML/hcAfXP01.svg',
    },
  ]);
  
  const [activeTextarea, setActiveTextarea] = useState<{
    x: number;
    y: number;
    text: string;
    id: string;
  } | null>(null);
  
  const [textElements, setTextElements] = useState<
    { id: string; text: string; x: number; y: number }[]
  >([]);
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
  });
  
  const handleKonvaContextMenu = (
    e: KonvaEventObject<PointerEvent>,
    index: number
  ) => {
    e.evt.preventDefault();
    
    const sidebarWidth = sidebarRef.current?.offsetWidth || 0;
    const sidebarTop = sidebarRef.current?.getBoundingClientRect().top || 0;
    
    const clickX = e.evt.clientX - sidebarWidth;
    const clickY = e.evt.clientY - sidebarTop;
    
    setContextMenu({
      visible: true,
      x: clickX,
      y: clickY,
      targetId: elementPaths[index].id,
    });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({...prev, visible: false}));
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
  
  const handleMenuAction = (
    action: 'bringToFront' | 'sendToBack' | 'delete'
  ) => {
    const id = contextMenu.targetId;
    if (!id) return;
    
    const updated = [...elementPaths];
    const index = updated.findIndex((item) => item.id === id);
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
      const newEntry: ElementEntry = {id: newId, path: droppedPath};
      setElementPaths((prev) => [...prev, newEntry]);
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleTextClick = (
    x: number,
    y: number,
    currentText: string,
    id: string
  ) => {
    setActiveTextarea({x, y, text: currentText, id});
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTextarea) {
      setActiveTextarea({...activeTextarea, text: e.target.value});
    }
  };
  
  const handleTextareaBlur = () => {
    if (activeTextarea) {
      const updatedTextElements = textElements.map((item) =>
        item.id === activeTextarea.id
          ? {...item, text: activeTextarea.text}
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
      y,
    };
    setTextElements([...textElements, newTextElement]);
  };
  
  return (
    <div
      className="canvas-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onContextMenu={(e) => e.preventDefault()} // Prevent global context menu
      style={{position: 'relative', width: '100%', height: '100%'}}
    >
      <div className="canvas-grid">
        <Stage width={3000} height={3000}>
          <Layer>
            {elementPaths.map((entry, index) => (
              <Fragment key={entry.id}>
                <DiagramElement
                  path={entry.path}
                  onTextClick={handleTextClick}
                  textElements={textElements}
                  onAddTextElement={handleAddTextElement}
                  onContextMenu={(e) => handleKonvaContextMenu(e, index)}
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
      
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleMenuAction}
        />
      )}
    </div>
  );
};

export default Canvas;
