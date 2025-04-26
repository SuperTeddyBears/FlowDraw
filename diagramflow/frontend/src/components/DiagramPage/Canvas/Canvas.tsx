// Canvas.tsx
import './Canvas.css';
import { Layer, Stage } from "react-konva";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  Fragment,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";
import { DiagramElement, DiagramElementProps } from "./DiagramElement.tsx";
import { KonvaEventObject } from "konva/lib/Node";
import ContextMenu from "./ContextMenu.tsx";
import { connection, lineTypes } from "../connection.ts";
import ConnectionElement from "./ConnectionElement.tsx";
import Toolbar from "../Toolbar/Toolbar.tsx";

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

const Canvas = ({
  sidebarRef,
  diagramElements,
  setDiagramElements,
  connectionElements,
  setConnectionElements,
}: {
  sidebarRef: RefObject<HTMLDivElement | null>;
  diagramElements: ExtendedDiagramElementProps[];
  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>;
  connectionElements: connection[];
  setConnectionElements: Dispatch<SetStateAction<connection[]>>;
}) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [activeTextarea, setActiveTextarea] = useState<{
    x: number;
    y: number;
    text: string;
    id: string;
  } | null>(null);

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

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      setRedoStack((prev) => [
        ...prev,
        { diagramElements: [...diagramElements], connectionElements: [...connectionElements] },
      ]);
      setDiagramElements(lastState?.diagramElements || []);
      setConnectionElements(lastState?.connectionElements || []);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack((prev) => [
        ...prev,
        { diagramElements: [...diagramElements], connectionElements: [...connectionElements] },
      ]);
      setDiagramElements(nextState?.diagramElements || []);
      setConnectionElements(nextState?.connectionElements || []);
    }
  };

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
    setContextMenu((prev) => ({ ...prev, visible: false }));
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
      const connectionIndex = connectionElements.findIndex(
        (conn) => conn.id.toString() === id
      );
      if (connectionIndex === -1) return;

      const [connection] = connectionElements.splice(connectionIndex, 1);

      if (action === 'bringToFront') {
        setConnectionElements((prev) => [...prev, connection]);
      } else if (action === 'sendToBack') {
        setConnectionElements((prev) => [connection, ...prev]);
      } else if (action === 'delete') {
        setConnectionElements((prev) =>
          prev.filter((_, i) => i !== connectionIndex)
        );
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

    if (droppedPath.includes('conn')) {
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
          lineTypes.straight
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
        const newId = `element-${Date.now()}`;
        const newElement: ExtendedDiagramElementProps = {
          id: newId,
          path: droppedPath,
          posX:
            e.clientX -
            rect.left +
            canvasRef.current!.scrollLeft -
            width / 2,
          posY:
            e.clientY -
            rect.top +
            canvasRef.current!.scrollTop -
            height / 2,
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

  const handleTextClick = (
    x: number,
    y: number,
    currentText: string,
    id: string
  ) => {
    setActiveTextarea({ x, y, text: currentText, id });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTextarea) {
      setActiveTextarea({ ...activeTextarea, text: e.target.value });
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
            textElements: [newTextElement],
            hasText: true,
          };
        }

        return el;
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
      if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className="canvas-container"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <Toolbar onUndo={handleUndo} onRedo={handleRedo} />
      <div className="canvas-grid">
        <Stage width={3000} height={3000}>
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
                  onContextMenu={(e) =>
                    handleKonvaContextMenu(e, element.id)
                  }
                  onSaveState={saveStateToUndoStack}
                />
              </Fragment>
            ))}
          </Layer>
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
