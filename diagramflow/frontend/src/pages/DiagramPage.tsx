import React, {useRef, useState} from 'react';
import '../components/DiagramPage/App.css';
import Navbar from '../components/DiagramPage/Navbar/Navbar';
import Toolbar from '../components/DiagramPage/Toolbar/Toolbar';
import Sidebar from '../components/DiagramPage/Sidebar/Sidebar';
import Canvas, {ExtendedDiagramElementProps} from '../components/DiagramPage/Canvas/Canvas';
import Footer from '../components/DiagramPage/Footer/Footer';
import {connection} from "../components/DiagramPage/connection.ts";

export const DiagramPage: React.FC = () => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  // Elementy – dodajemy dodatkowe pola: id, width, height. Początkowo width/height ustawiamy na 0.
  const [diagramElements, setDiagramElements] = useState<ExtendedDiagramElementProps[]>([]);
  // Połączenia między elementami
  const [connectionElements, setConnectionElements] = useState<connection[]>([]);
  
  return (
    <div className="app">
      <Navbar
        diagramElements={diagramElements}
        setDiagramElements={setDiagramElements}
        connectionElements={connectionElements}
        setConnectionElements={setConnectionElements}
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

