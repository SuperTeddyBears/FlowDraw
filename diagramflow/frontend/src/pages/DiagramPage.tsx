import React, { useRef } from 'react';
import '../components/DiagramPage/App.css';
import Navbar from '../components/DiagramPage/Navbar/Navbar';
import Toolbar from '../components/DiagramPage/Toolbar/Toolbar';
import Sidebar from '../components/DiagramPage/Sidebar/Sidebar';
import Canvas from '../components/DiagramPage/Canvas/Canvas';
import Footer from '../components/DiagramPage/Footer/Footer';

export const DiagramPage: React.FC = () => {
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    const clearCanvasRef = useRef<(() => void) | null>(null);
    const zoomInRef = useRef<(() => void) | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);

    return (
        <div className="app">
            <Navbar />
            <div className="main-content">
                <Toolbar onDelete={() => clearCanvasRef.current?.()} onZoomIn={() => zoomInRef.current?.()} onZoomOut={() => zoomOutRef.current?.()}/>
                <div className="workspace">
                    <Sidebar ref={sidebarRef} />
                    <Canvas sidebarRef={sidebarRef} onClearRef={clearCanvasRef} onZoomInRef={zoomInRef} onZoomOutRef={zoomOutRef}/>
                </div>
            </div>
            <Footer />
        </div>
    );
};

