import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <div className="footer">
            <div className="footer-logo">flow<span>draw</span>.</div>
            <div className="footer-copyright">
                Copyright © 2025 FlowDraw. Wszystkie prawa zastrzeżone.
            </div>
        </div>
    );
};

export default Footer;