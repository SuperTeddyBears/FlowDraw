import React from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
    x: number;
    y: number;
    onAction: (action: 'bringToFront' | 'sendToBack' | 'delete') => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAction }) => {
    return (
        <ul className="context-menu" style={{ top: y, left: x, position: 'absolute' }}>
            <li onClick={() => onAction('bringToFront')}>Na wierzch</li>
            <li onClick={() => onAction('sendToBack')}>Na spód</li>
            <li onClick={() => onAction('delete')}>Usuń warstwę</li>
        </ul>
    );
};

export default ContextMenu;
