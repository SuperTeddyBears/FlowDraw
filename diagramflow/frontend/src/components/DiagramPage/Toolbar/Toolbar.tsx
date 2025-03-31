import React from 'react';
import './Toolbar.css';
import './SVG.tsx';
import {ZoomOutBtn, RedoBtn, UndoBtn, ZoomInBtn, DeleteBtn, CopyBtn} from './utils'
import {ZoomInIcon,ZoomOutIcon, MoveBackwards, MoveForeward, Bin, Copy} from "./SVG";

const Toolbar: React.FC = () => {
    return (
        <div className="toolbar">
            <div className="toolbar-buttons">
                <button className="toolbar-btn" title="Zoom In" onClick={ZoomInBtn}>
                    <ZoomInIcon className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Zoom Out" onClick={ZoomOutBtn}>
                    <ZoomOutIcon className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Delete" onClick={DeleteBtn}>
                    <Bin className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Copy" onClick={CopyBtn}>
                    <Copy className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Undo" onClick={UndoBtn}>
                    <MoveBackwards className="toolbar-icon" />
                </button>
                <button className="toolbar-btn" title="Redo" onClick={RedoBtn}>
                    <MoveForeward className="toolbar-icon" />
                </button>
            </div>

        </div>
    );
};

export default Toolbar;