import React from 'react';
import './Toolbar.css';
import './SVG.tsx';
import {ZoomInIcon,ZoomOutIcon, MoveBackwards, MoveForeward, Bin, Copy} from "./SVG";

interface ToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({onUndo, onRedo, onDelete, onCopy, onZoomIn, onZoomOut}) => {
    return (
        <div className="toolbar">
            <div className="toolbar-buttons">
                <button className="toolbar-btn" title="Zoom In" onClick={onZoomIn}>
                    <ZoomInIcon className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Zoom Out" onClick={onZoomOut}>
                    <ZoomOutIcon className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Delete" onClick={onDelete}>
                    <Bin className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Copy" onClick={onCopy}>
                    <Copy className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Undo" onClick={onUndo}>
                    <MoveBackwards className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Redo" onClick={onRedo}>
                    <MoveForeward className="toolbar-icon" />
                </button>
            </div>

        </div>
    );
};

export default Toolbar;