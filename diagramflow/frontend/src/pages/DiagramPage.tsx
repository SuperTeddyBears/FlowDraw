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
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  // Elementy diagramu
  const [diagramElements, setDiagramElements] = useState<ExtendedDiagramElementProps[]>([]);
  // Połączenia między elementami
  const [connectionElements, setConnectionElements] = useState<connection[]>([]);
  // Nazwa diagramu
  const [diagramName, setDiagramName] = useState<string>(location.state?.name || 'New Diagram');

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
      />
      <div className="main-content">
        <Toolbar/>
        <div className="workspace">
          <Sidebar ref={sidebarRef}/>
          <Canvas
            sidebarRef={sidebarRef}
            diagramElements={diagramElements}
            setDiagramElements={setDiagramElements}
            connectionElements={connectionElements}
            setConnectionElements={setConnectionElements}
          />
        </div>
      </div>
      <Footer/>
    </div>
  );
};

