// Canvas.tsx
import './Canvas.css';
import {Stage, Layer} from "react-konva";
import {Fragment, useRef, useState, DragEvent, ChangeEvent, RefObject, useEffect} from "react";
import {DiagramElement, DiagramElementProps} from "../DiagramElement";
import {KonvaEventObject} from "konva/lib/Node";
import ContextMenu from "./ContextMenu.tsx";
import {connection} from "../connection.ts";
import ConnectionElement from "../ConnectionElement.tsx";

export interface ExtendedDiagramElementProps extends DiagramElementProps {
  id: string; // dodany identyfikator
  posX: number;
  posY: number;
  width: number;
  height: number;
}

const Canvas = ({sidebarRef}: { sidebarRef: RefObject<HTMLDivElement | null> }) => {
  // Elementy – dodajemy dodatkowe pola: id, width, height. Początkowo width/height ustawiamy na 0.
  const [diagramElements, setDiagramElements] = useState<ExtendedDiagramElementProps[]>([]);
  // Połączenia między elementami
  const [activeTextarea, setActiveTextarea] = useState<{ x: number; y: number; text: string; id: string } | null>(null);
  
  const [connectionElements, setConnectionElements] = useState<connection[]>([]);
  
  // Stan menu kontekstowego
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
  
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  const handleKonvaContextMenu = (
    e: KonvaEventObject<PointerEvent>,
    index: string
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
      targetId: index
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
    
    const updated = [...diagramElements];
    const index = updated.findIndex((item) => item.id === id);
    if (index === -1) {
      const connectionIndex = connectionElements.findIndex((conn) => conn.id.toString() === id);
      if (connectionIndex === -1) return;
      
      const [connection] = connectionElements.splice(connectionIndex, 1);
      
      if (action === 'bringToFront') {
        setConnectionElements((prev) => [...prev, connection]);
      } else if (action === 'sendToBack') {
        setConnectionElements((prev) => [connection, ...prev]);
      } else if (action === 'delete') {
        setConnectionElements((prev) => prev.filter((_, i) => i !== connectionIndex));
      }
      
      handleCloseContextMenu();
      return;
    }
    
    const [item] = updated.splice(index, 1);
    
    if (action === 'bringToFront') updated.push(item);
    else if (action === 'sendToBack') updated.unshift(item);
    
    setDiagramElements(updated);
    handleCloseContextMenu();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedPath = e.dataTransfer?.getData('text/plain');
    
    if (droppedPath.includes('conn')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (droppedPath && canvasRef.current && rect) {
        const offset = 50;
        let x = e.clientX - rect.left + canvasRef.current.scrollLeft;
        let y = e.clientY - rect.top + canvasRef.current.scrollTop;
        
        x = Math.max(offset, Math.min(3000 - offset, x));
        y = Math.max(offset, Math.min(3000 - offset, y));
        
        const newConnection: connection = new connection(Date.now(), x - 50, y + 50, x + 50, y - 50);
        setConnectionElements((prev) => [...prev, newConnection]);
      }
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (droppedPath && canvasRef.current && rect) {
      const img = new window.Image();
      img.src = droppedPath;
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        // Generujemy unikalne id
        const newId = `element-${Date.now()}`;
        const newElement: ExtendedDiagramElementProps = {
          id: newId,
          path: droppedPath,
          posX: e.clientX - rect.left + canvasRef.current!.scrollLeft - width / 2,
          posY: e.clientY - rect.top + canvasRef.current!.scrollTop - height / 2,
          width,
          height,
          onTextClick: handleTextClick,
          textElements: [],
          onAddTextElement: handleAddTextElement,
          onPositionChange: handlePositionChange,
          onContextMenu: handleKonvaContextMenu
        };
        setDiagramElements((prev) => [...prev, newElement]);
      };
      
      img.onerror = () => {
        console.error('Failed to load the image:', droppedPath);
      };
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleTextClick = (x: number, y: number, currentText: string, id: string) => {
    setActiveTextarea({x, y, text: currentText, id});
  };
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTextarea) {
      setActiveTextarea({...activeTextarea, text: e.target.value});
    }
  };
  
  const handleTextareaBlur = () => {
    if (activeTextarea) {
      // Aktualizujemy tekst w odpowiednim elemencie
      setDiagramElements(prev =>
        prev.map(el => {
          return {
            ...el,
            textElements: el.textElements.map(te =>
              te.id === activeTextarea.id ? {...te, text: activeTextarea.text} : te
            )
          };
        })
      );
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
    // Dodajemy tekst do ostatnio dodanego elementu lub w dowolny sposób – tutaj uproszczamy
    setDiagramElements(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = {...last, textElements: [...last.textElements, newTextElement]};
      return [...prev.slice(0, prev.length - 1), updated];
    });
  };
  
  // Callback aktualizujący pozycję i rozmiar elementu – wywoływany z DiagramElement przy drag/transform
  const handlePositionChange = (id: string, x: number, y: number, width: number, height: number) => {
    setDiagramElements(prev =>
      prev.map(el => el.id === id ? {...el, posX: x, posY: y, width, height} : el)
    );
  };
  
  return (
    <div
      className="canvas-container"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{position: 'relative', width: '100%', height: '100%'}}
    >
      <div className="canvas-grid">
        <Stage width={3000} height={3000}>
          {/* Warstwa rysująca elementy diagramu */}
          <Layer>
            {diagramElements.map((element) => (
              <Fragment key={element.id}>
                <DiagramElement
                  id={element.id}
                  path={element.path}
                  posX={element.posX}
                  posY={element.posY}
                  onTextClick={handleTextClick}
                  textElements={element.textElements}
                  onAddTextElement={handleAddTextElement}
                  onPositionChange={handlePositionChange}
                  onContextMenu={(e) => handleKonvaContextMenu(e, element.id)}
                />
              </Fragment>
            ))}
          </Layer>
          
          {/* Warstwa rysująca połączenia */}
          <Layer>
            {connectionElements.map((element) =>
              <Fragment key={element.id}>
                <ConnectionElement
                  element={element}
                  diagramElements={diagramElements}
                  handleKonvaContextMenu={handleKonvaContextMenu}
                />
              </Fragment>
            )}
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
