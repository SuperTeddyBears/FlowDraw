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
      {
        diagramElements: [...diagramElements], 
        connectionElements: connectionElements.map(conn => conn.clone()),
      },
    ]);
    setRedoStack([]);
  };
  
  useEffect(() => {
  console.log('🔧 Setting up export function...'); // ← DODAJ

  onExportRef.current = async () => {
    console.log('🚀 EXPORT FUNCTION CALLED!'); // ← DODAJ
    console.log('Current stage ref:', stageRef.current); // ← DODAJ

    const token = localStorage.getItem('flow_auth_token');
    console.log('Auth token:', token ? 'EXISTS' : 'MISSING'); // ← DODAJ

    if (!token) {
      console.log('❌ No auth token found');
      return;
    }

    try {
      console.log('Checking Google Drive auth...'); // ← DODAJ

      // First check if user is authenticated with Google Drive
      const authCheck = await axios.get('/api/auth/check-google-drive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Auth check response:', authCheck.data); // ← DODAJ

      if (!authCheck.data.is_authorized) {
        console.log('Not authorized, showing prompt...'); // ← DODAJ
        if (confirm('You need to authenticate with Google Drive first. Would you like to do that now?')) {
          initiateGoogleDriveAuth();
        }
        return;
      }

      const stage = stageRef.current;
      if (!stage) {
        console.log('❌ No stage reference'); // ← DODAJ
        return;
      }

      console.log('Generating stage data...'); // ← DODAJ
      const box = stage.getClientRect({skipTransform: false});
      console.log('Stage box:', box); // ← DODAJ

      // Get the image data as base64
      const dataURL = stage.toDataURL({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        pixelRatio: 2,
        mimeType: 'image/png'
      });

      console.log('Generated PNG data length:', dataURL.length); // ← DODAJ
      console.log('PNG data preview:', dataURL.substring(0, 50)); // ← DODAJ

      console.log('Sending to backend...'); // ← DODAJ

      // ✅ SPRAWDŹ CZY TO JEST POPRAWNY ENDPOINT
      const response = await axios.post('/api/user/share_diagram', // ← POTWIERDŹ ŻE TO JEST UŻYWANE
        {
          name: diagramName,
          png: dataURL
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Backend response:', response.data); // ← DODAJ
      alert(`Diagram saved to Google Drive: ${response.data.file_name}`);

      return response.data;

    } catch (error) {
      console.error('❌ Export error:', error); // ← DODAJ
      if (axios.isAxiosError(error) && error.response?.data?.requires_auth) {
        if (confirm('You need to authenticate with Google Drive first. Would you like to do that now?')) {
          initiateGoogleDriveAuth();
        }
      } else {
        alert('Failed to save diagram to Google Drive');
      }
      throw error;
    }
  };

  console.log('✅ Export function set up complete'); // ← DODAJ
}, [onExportRef, diagramName]);

  useEffect(() => {
    onCopyRef.current = () => {
      if (!selectedElementId) return;

      const selected = diagramElements.find(element => element.id === selectedElementId);
      if (!selected) return;

      saveStateToUndoStack();

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
      {
        diagramElements: [...diagramElements],
        connectionElements: connectionElements.map((conn) => conn.clone()),
      },
    ]);

    if (lastState) {
      console.log('Restoring state:', {
        diagramElements: lastState.diagramElements,
        connectionElements: lastState.connectionElements.map((conn) => ({
          id: conn.id,
          startSnapped: conn.getStartSnappedElementId(),
          startWall: conn.getStartSnappedWall(),
          endSnapped: conn.getEndSnappedElementId(),
          endWall: conn.getEndSnappedWall(),
          start: conn.start,
          end: conn.end,
        })),
      });
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

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const scrollTop = canvasRef.current?.scrollTop || 0;
    const scrollLeft = canvasRef.current?.scrollLeft || 0;

    const clickX = e.evt.clientX - (canvasBounds?.left || 0) + scrollLeft;
    const clickY = e.evt.clientY - (canvasBounds?.top || 0) + scrollTop;

    setContextMenu({
      visible: true,
      x: clickX,
      y: clickY,
      targetId: index,
    });

    setTimeout(() => {
      const menu = document.querySelector('.context-menu') as HTMLElement | null;
      if (!menu || !canvasRef.current) return;

      const menuRect = menu.getBoundingClientRect();
      const canvasBounds = canvasRef.current.getBoundingClientRect();

      let adjustedX = clickX;
      let adjustedY = clickY;

      const wouldOverflowBottom = menuRect.bottom > canvasBounds.bottom;
      const wouldOverflowRight = menuRect.right > canvasBounds.right;

      if (wouldOverflowBottom && clickY - menuRect.height >= canvasBounds.top) {
        adjustedY = clickY - menuRect.height;
      }

      if (wouldOverflowRight && clickX - menuRect.width >= canvasBounds.left) {
        adjustedX = clickX - menuRect.width;
      }

      setContextMenu(prev => ({
        ...prev,
        x: adjustedX,
        y: adjustedY,
      }));
    }, 0);
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
                  onSaveState={saveStateToUndoStack}
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