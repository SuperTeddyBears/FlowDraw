import React, { useRef, useEffect } from 'react';
import './Canvas.css';

const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Tutaj można dodać logikę rysowania siatki za pomocą canvas API
        // Na razie używamy CSS do prostej wizualizacji
    }, []);

    return (
        <div className="canvas-container">
            <div className="canvas-grid" ref={canvasRef}>
                {/* Grid będzie wygenerowany przez CSS */}
            </div>
        </div>
    );
};

export default Canvas;