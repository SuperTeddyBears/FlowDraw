// Canvas.tsx
import './Canvas.css';
import { Stage, Layer, Line, Arrow } from "react-konva";
import {FC, Fragment, useRef, useState, DragEvent, ChangeEvent} from "react";
import { DiagramElement, DiagramElementProps } from "../DiagramElement";

interface ExtendedDiagramElementProps extends DiagramElementProps {
  id: string; // dodany identyfikator
  posX: number;
  posY: number;
  width: number;
  height: number;
}

interface ConnectionLine {
  id: string;
  fromId: string;
  toId: string;
  type: "plain" | "arrow";
}

const Canvas: FC = () => {
  // Elementy – dodajemy dodatkowe pola: id, width, height. Początkowo width/height ustawiamy na 0.
  const [diagramElements, setDiagramElements] = useState<ExtendedDiagramElementProps[]>([]);
  // Połączenia między elementami
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const [activeTextarea, setActiveTextarea] = useState<{ x: number; y: number; text: string; id: string } | null>(null);

  // Stany dla trybu łączenia
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<{ id: string; centerX: number; centerY: number } | null>(null);
  const [connectionType, setConnectionType] = useState<"plain" | "arrow">("plain");

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedPath = e.dataTransfer?.getData('text/plain');
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
          // Przekaż dodatkowe propsy do łączenia:
          isConnecting: isConnecting,
          onConnect: handleElementConnect,
          onPositionChange: handlePositionChange
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
    setActiveTextarea({ x, y, text: currentText, id });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTextarea) {
      setActiveTextarea({ ...activeTextarea, text: e.target.value });
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
                  te.id === activeTextarea.id ? { ...te, text: activeTextarea.text } : te
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
      const updated = { ...last, textElements: [...last.textElements, newTextElement] };
      return [...prev.slice(0, prev.length - 1), updated];
    });
  };

  // Callback aktualizujący pozycję i rozmiar elementu – wywoływany z DiagramElement przy drag/transform
  const handlePositionChange = (id: string, x: number, y: number, width: number, height: number) => {
    setDiagramElements(prev =>
        prev.map(el => el.id === id ? { ...el, posX: x, posY: y, width, height } : el)
    );
  };

  // Callback wywoływany przy kliknięciu w element przy trybie łączenia
  const handleElementConnect = (id: string, centerX: number, centerY: number) => {
    if (!connectingFrom) {
      // Pierwsze kliknięcie – zapisujemy dane pierwszego elementu
      setConnectingFrom({ id, centerX, centerY });
    } else if (connectingFrom.id === id) {
      // Kliknięcie tego samego elementu – anulujemy wybór
      setConnectingFrom(null);
    } else {
      // Drugi element – tworzymy połączenie
      const newConnection: ConnectionLine = {
        id: `connection-${Date.now()}`,
        fromId: connectingFrom.id,
        toId: id,
        type: connectionType,
      };
      setConnections(prev => [...prev, newConnection]);
      setConnectingFrom(null);
      setIsConnecting(false);
    }
  };

  // Opcjonalnie – aktualizacja elementów przy zmianie trybu łączenia
  // Przekazujemy nową wartość isConnecting do wszystkich elementów
  const updateElementsConnectingFlag = (flag: boolean) => {
    setDiagramElements(prev =>
        prev.map(el => ({ ...el, isConnecting: flag }))
    );
  };

  return (
      <div
          className="canvas-container"
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* Kontrolki trybu łączenia */}
        <div style={{ marginBottom: '10px' }}>
          <button
              onClick={() => {
                setIsConnecting(prev => {
                  const newFlag = !prev;
                  updateElementsConnectingFlag(newFlag);
                  // Jeśli odłączamy tryb, kasujemy też pierwszy wybrany element
                  if (!newFlag) setConnectingFrom(null);
                  return newFlag;
                });
              }}
          >
            {isConnecting ? "Anuluj łączenie" : "Połącz elementy"}
          </button>
          {isConnecting && (
              <label style={{ marginLeft: '10px' }}>
                Rodzaj połączenia:&nbsp;
                <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value as "plain" | "arrow")}
                >
                  <option value="plain">Linia</option>
                  <option value="arrow">Strzałka</option>
                </select>
              </label>
          )}
          {isConnecting && connectingFrom && (
              <span style={{ marginLeft: '10px' }}>
            Wybrano pierwszy element – kliknij drugi element, aby połączyć.
          </span>
          )}
        </div>

        <div className="canvas-grid">
          <Stage width={3000} height={3000}>
            {/* Warstwa rysująca połączenia – rysujemy je najpierw, aby były za elementami */}
            <Layer>
              {connections.map(conn => {
                const fromEl = diagramElements.find(el => el.id === conn.fromId);
                const toEl = diagramElements.find(el => el.id === conn.toId);
                if (!fromEl || !toEl) return null;
                const fromCenterX = fromEl.posX + fromEl.width / 2;
                const fromCenterY = fromEl.posY + fromEl.height / 2;
                const toCenterX = toEl.posX + toEl.width / 2;
                const toCenterY = toEl.posY + toEl.height / 2;
                return conn.type === "arrow" ? (
                    <Arrow
                        key={conn.id}
                        points={[fromCenterX, fromCenterY, toCenterX, toCenterY]}
                        pointerLength={10}
                        pointerWidth={10}
                        fill="black"
                        stroke="black"
                        strokeWidth={2}
                    />
                ) : (
                    <Line
                        key={conn.id}
                        points={[fromCenterX, fromCenterY, toCenterX, toCenterY]}
                        stroke="black"
                        strokeWidth={2}
                    />
                );
              })}
            </Layer>
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
                        isConnecting={isConnecting}
                        onConnect={handleElementConnect}
                        onPositionChange={handlePositionChange}
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
