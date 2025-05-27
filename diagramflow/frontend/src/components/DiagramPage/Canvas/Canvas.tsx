// Canvas.tsx
import './Canvas.css';
import {Layer, Stage} from "react-konva";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  Fragment,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {DiagramElement, DiagramElementProps} from "./DiagramElement.tsx";
import {KonvaEventObject} from "konva/lib/Node";
import ContextMenu from "./ContextMenu.tsx";
import {connection, lineTypes} from "../connection.ts";
import ConnectionElement from "./ConnectionElement.tsx";
import Konva from 'konva';
import {getConnectionTypeFromPath} from "./ConnectionUtils.ts";
import axios from "axios";


export interface ExtendedDiagramElementProps extends DiagramElementProps {
  id: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  hasText: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  targetId: string | null;
}

const initiateGoogleDriveAuth = async () => {
  const token = localStorage.getItem('flow_auth_token');
  if (!token) return;

  try {
    const response = await axios.get('/api/auth/google-drive', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Redirect the user to Google's authorization page
    if (response.data.authorization_url) {
      window.location.href = response.data.authorization_url;
    }
  } catch (error) {
    console.error('Failed to initiate Google Drive authorization:', error);
  }
};

const Canvas = ({sidebarRef, diagramName, diagramElements, setDiagramElements, connectionElements, setConnectionElements, onUndoRef, onRedoRef, onClearRef, onZoomInRef, onZoomOutRef, onCopyRef, onExportRef}:
                {
                  sidebarRef: RefObject<HTMLDivElement | null>,
                  diagramName: string,
                  diagramElements: ExtendedDiagramElementProps[],
                  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
                  connectionElements: connection[],
                  setConnectionElements: Dispatch<SetStateAction<connection[]>>
                  onUndoRef: RefObject<(() => void) | null>,
                  onRedoRef: RefObject<(() => void) | null>,
                  onClearRef: RefObject<(() => void) | null>,
                  onZoomInRef: RefObject<(() => void) | null>,
                  onZoomOutRef: RefObject<(() => void) | null>,
                  onCopyRef: RefObject<(() => void) | null>,
                  onExportRef: RefObject<(() => void) | null>,
                }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Stan zooma
  const [scale, setScale] = useState(1);
  //Stan tła (siatki) canvas
  const [backgroundSize, setBackgroundSize] = useState(20);
  // Stan zaznaczenia
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleSelectElement = (id: string) => {
    setSelectedElementId(id);
  };

  useEffect(() => {
    //Czyszczenie canvasu
    onClearRef.current = () => {
      setDiagramElements([]);
      setConnectionElements([]);
    };
  }, [onClearRef, setConnectionElements, setDiagramElements]);


  //Zoom canvasu
  const zoomInCanvas = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
    setBackgroundSize((prev) => Math.min(prev + 1, 30));
  };

  useEffect(() => {
    onZoomInRef.current = zoomInCanvas;
  }, [onZoomInRef]);

  const zoomOutCanvas = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.2));
    setBackgroundSize((prev) => Math.max(prev - 1, 12));
  };

  useEffect(() => {
    onZoomOutRef.current = zoomOutCanvas;
  }, [onZoomOutRef]);
  
  // Stan aktywnego elementu do wprowadzania tekstu
  const [activeTextarea, setActiveTextarea] = useState<{ x: number; y: number; text: string; id: string } | null>(null);
  // Stan menu kontekstowego
  const [contextMenu, setContextMenu] = useState<ContextMenuProps>({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  const [undoStack, setUndoStack] = useState<{ diagramElements: ExtendedDiagramElementProps[]; connectionElements: connection[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ diagramElements: ExtendedDiagramElementProps[]; connectionElements: connection[] }[]>([]);

  const saveStateToUndoStack = () => {
    setUndoStack((prev) => [
      ...prev,
      { diagramElements: [...diagramElements], connectionElements: [...connectionElements] },
    ]);
    setRedoStack([]);
  };
  
  useEffect(() => {
    onExportRef.current = async () => {
      const token = localStorage.getItem('flow_auth_token');
      if (!token) return;
      
      const stage = stageRef.current;
      if (!stage) return;
      
      const box = stage.getClientRect({skipTransform: false});
      
      const dataURL = stage.toDataURL({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        pixelRatio: 2,
        mimeType: 'image/png'
      });

      // Convert base64 to blob
      const base64Data = dataURL.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
    
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
    
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/png' });
      
      // Create FormData and append the file with the correct field name
      const formData = new FormData();
      formData.append('png', blob, `${diagramName}.png`); // Backend expects 'png' field
      formData.append('name', diagramName);

      try {
        await axios.post('/api/user/share_diagram', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Zapisano do Google Drive");
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.error === 'Google Drive authentication required') {
          if (confirm('You need to authenticate with Google Drive first. Would you like to do that now?')) {
            initiateGoogleDriveAuth();
          }
        } else {
          const errorMessage = axios.isAxiosError(error)
            ? error.response?.data || error.message
            : 'An unknown error occurred';
          console.error("Error uploading diagram:", errorMessage);
        }
      }
    };
  }, [onExportRef, diagramName]);

  useEffect(() => {
    onCopyRef.current = () => {
      if (!selectedElementId) return;

      const selected = diagramElements.find(element => element.id === selectedElementId);
      if (!selected) return;

      const copiedElement: ExtendedDiagramElementProps = {
        ...selected,
        id: `element-${Date.now()}`,
        posX: selected.posX + 10,
        posY: selected.posY + 10,
        textElements: selected.textElements.map(textElement => ({
          ...textElement,
          id: `text-${Date.now()}-${Math.random()}`,
          x: textElement.x + 10,
          y: textElement.y + 10,
        })),
      };

      setDiagramElements(prev => [...prev, copiedElement]);
      setSelectedElementId(null);
    };
  }, [selectedElementId, diagramElements, onCopyRef]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const newUndoStack = [...undoStack];
      const lastState = newUndoStack.pop();

      setUndoStack(newUndoStack);
      setRedoStack((prev) => [
        ...prev,
        { diagramElements: [...diagramElements], connectionElements: [...connectionElements] },
      ]);

      if (lastState) {
        setDiagramElements(lastState.diagramElements);
        setConnectionElements(lastState.connectionElements);
      }
    }
  }, [undoStack, diagramElements, connectionElements, setDiagramElements, setConnectionElements]);
  
  useEffect(() => {
    onUndoRef.current = handleUndo;
  }, [handleUndo, onUndoRef]);
  
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();
  
      setRedoStack(newRedoStack);
      setUndoStack((prev) => [
        ...prev,
        { diagramElements: [...diagramElements], connectionElements: [...connectionElements] },
      ]);
  
      if (nextState) {
        setDiagramElements(nextState.diagramElements);
        setConnectionElements(nextState.connectionElements);
      }
    }
  }, [redoStack, diagramElements, connectionElements, setDiagramElements, setConnectionElements]);
  
  useEffect(() => {
    onRedoRef.current = handleRedo;
  }, [handleRedo, onRedoRef]);

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
      targetId: index,
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
    saveStateToUndoStack(); // Save state before performing menu actions
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
    saveStateToUndoStack(); // Save state before adding a new element
    const droppedPath = e.dataTransfer?.getData('text/plain');
    
    if (droppedPath.includes('Entity-Relationship')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (droppedPath && canvasRef.current && rect) {
        const offset = 50;
        let x = e.clientX - rect.left + canvasRef.current.scrollLeft;
        let y = e.clientY - rect.top + canvasRef.current.scrollTop;
        
        x = Math.max(offset, Math.min(3000 - offset, x));
        y = Math.max(offset, Math.min(3000 - offset, y));
        
        const newConnection: connection = new connection(
          Date.now(),
          x - 50,
          y + 50,
          x + 50,
          y - 50,
          lineTypes.jagged,
          getConnectionTypeFromPath(droppedPath)
        );
        
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
          onContextMenu: handleKonvaContextMenu,
          hasText: false,
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
      saveStateToUndoStack();
      setDiagramElements((prev) =>
        prev.map((el) => {
          return {
            ...el,
            textElements: el.textElements.map((te) =>
              te.id === activeTextarea.id
                ? { ...te, text: activeTextarea.text }
                : te
            ),
          };
        })
      );
      setActiveTextarea(null);
    }
  };
  
  const handleAddTextElement = (x: number, y: number) => {
    saveStateToUndoStack();
    const newId = `text-${Date.now()}`;
    const newTextElement = {
      id: newId,
      text: 'Nowy tekst',
      x,
      y,
    };
    
    setDiagramElements((prev) => {
      return prev.map((el) => {
        if (el.hasText) {
          return el;
        }
        
        const isWithinBounds =
          x >= el.posX &&
          x <= el.posX + el.width &&
          y >= el.posY &&
          y <= el.posY + el.height;
        
        if (isWithinBounds) {
          return {
            ...el,
            textElements: [newTextElement], // Replace any existing text element
            hasText: true, // Mark as having text
          };
        }
        
        return el; // Return the element unchanged if no conditions are met
      });
    });
  };
  

  const handlePositionChange = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    setDiagramElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            posX: x,
            posY: y,
            width,
            height,
            textElements: el.textElements.map((te) => ({
              ...te,
              x: x + width / 2 - 50,
              y: y + height / 2 - 10,
            })),
          };
        }
        return el;
      })
    );
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  return (
    <div
      className="canvas-container"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{position: 'relative', width: '100%', height: '100%'}}
    >
      <div className="canvas-grid" style = {{backgroundSize: `${backgroundSize}px ${backgroundSize}px`}}>
        <Stage ref={stageRef} width={3000} height={3000} scaleX={scale} scaleY={scale}>
          {/* Warstwa rysująca elementy diagramu */}
          <Layer>
            {diagramElements.map((element) => (
              <Fragment key={element.id}>
                <DiagramElement
                  id={element.id}
                  path={element.path}
                  posX={element.posX}
                  posY={element.posY}
                  width={element.width}
                  height={element.height}
                  onTextClick={handleTextClick}
                  textElements={element.textElements}
                  onAddTextElement={handleAddTextElement}
                  onPositionChange={handlePositionChange}
                  onContextMenu={(e) =>
                    handleKonvaContextMenu(e, element.id)
                  }
                  onSaveState={saveStateToUndoStack}
                  onSelect={() => handleSelectElement(element.id)}
                />
              </Fragment>
            ))}
          </Layer>
          
          {/* Warstwa rysująca połączenia */}
          <Layer>
            {connectionElements.map((element) => (
              <Fragment key={element.id}>
                <ConnectionElement
                  element={element}
                  diagramElements={diagramElements}
                  handleKonvaContextMenu={handleKonvaContextMenu}
                />
              </Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
      
      {activeTextarea && (
        <textarea
          ref={(textarea) => {
            if (textarea && textarea.value === 'Nowy tekst') {
              textarea.select();
            }
          }}
          value={activeTextarea.text}
          onChange={handleTextChange}
          onBlur={handleTextareaBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTextareaBlur();
            }
          }}
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