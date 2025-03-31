import React from 'react';
import './Navbar.css';
import { handleHelpClick } from './utils';

const Navbar: React.FC = () => {
    return (
        <div className="navbar">
            <div className="navbar-left">
                <div className="logo">flow<span>draw</span>.</div>
                <div className="drawing-title">
                    <h1>Title of the drawing</h1>
                    <div className="drawing-buttons">
                        <button className="btn btn-primary" onClick={handleHelpClick}>File</button>
                        <button className="btn btn-primary" onClick={handleHelpClick} >Edit</button>
                        <button className="btn btn-primary" onClick={handleHelpClick} >View</button>
                        <button className="btn btn-primary" onClick={handleHelpClick} >Help</button>
                    </div>
                </div>
            </div>
            <div className="navbar-right">
                <button className="btn btn-share">Share</button>
            </div>
        </div>
    );
};

export default Navbar;