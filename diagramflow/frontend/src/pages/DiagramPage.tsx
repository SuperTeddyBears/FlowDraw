import {useEffect, useRef, useState} from 'react';
import '../components/DiagramPage/App.css';
import Navbar from '../components/DiagramPage/Navbar/Navbar';
import Toolbar from '../components/DiagramPage/Toolbar/Toolbar';
import Sidebar from '../components/DiagramPage/Sidebar/Sidebar';
import Canvas, {ExtendedDiagramElementProps} from '../components/DiagramPage/Canvas/Canvas';
import Footer from '../components/DiagramPage/Footer/Footer';
import {connection} from "../components/DiagramPage/connection.ts";
import {useLocation} from "react-router-dom";
import {deserializeDiagram} from "../components/DiagramPage/utils.ts";

export const DiagramPage = () => {
  const location = useLocation();
  const diagramType = location.state?.type || 'flowchart';
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  // Elementy diagramu
  const [diagramElements, setDiagramElements] = useState<ExtendedDiagramElementProps[]>([]);
  // Połączenia między elementami
  const [connectionElements, setConnectionElements] = useState<connection[]>([]);
  // Nazwa diagramu
  const [diagramName, setDiagramName] = useState<string>(location.state?.name || 'New Diagram');

    // Funkcje do obsługi przycisków z Toolbara
    const undoRef = useRef<(() => void) | null>(null);
    const redoRef = useRef<(() => void) | null>(null);
    const clearCanvasRef = useRef<(() => void) | null>(null);
    const zoomInRef = useRef<(() => void) | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);
    const exportRef = useRef<(() => void) | null>(null);

    useEffect(() => {
    if (!location.state?.diagram) {
      return;
    }
    deserializeDiagram(location.state?.diagram, setDiagramElements, setConnectionElements);
  }, [location.state?.diagram]);
  
  return (
    <div className="app">
      <Navbar
        diagramElements={diagramElements}
        setDiagramElements={setDiagramElements}
        connectionElements={connectionElements}
        setConnectionElements={setConnectionElements}
        diagramName={diagramName}
        setDiagramName={setDiagramName}
        onExport={() => exportRef.current?.()}
      />
      <div className="main-content">
          <Toolbar
            onUndo={() => undoRef.current?.()}
            onRedo={() => redoRef.current?.()}
            onDelete={() => clearCanvasRef.current?.()}
            onZoomIn={() => zoomInRef.current?.()}
            onZoomOut={() => zoomOutRef.current?.()}
          />
        <div className="workspace">
          <Sidebar ref={sidebarRef} selectedType={diagramType} />
          <Canvas
            sidebarRef={sidebarRef}
            diagramElements={diagramElements}
            setDiagramElements={setDiagramElements}
            connectionElements={connectionElements}
            setConnectionElements={setConnectionElements}
            onUndoRef={undoRef}
            onRedoRef={redoRef}
            onClearRef={clearCanvasRef}
            onZoomInRef={zoomInRef}
            onZoomOutRef={zoomOutRef}
            onExportRef={exportRef}
          />
        </div>
      </div>
      <Footer/>
    </div>
  );
};

