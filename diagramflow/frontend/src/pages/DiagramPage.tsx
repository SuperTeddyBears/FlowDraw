import React from 'react';
import '../styles/App.css';
import Navbar from '../components/DiagramPage/Navbar/Navbar';
import Toolbar from '../components/DiagramPage/Toolbar/Toolbar';
import Sidebar from '../components/DiagramPage/Sidebar/Sidebar';
import Canvas from '../components/DiagramPage/Canvas/Canvas';
import Footer from '../components/DiagramPage/Footer/Footer';


export const DiagramPage: React.FC = () => {
    return (
        <div className="app">
            <Navbar />
            <div className="main-content">
                <Toolbar />
                <div className="workspace">
                    <Sidebar />
                    <Canvas />
                </div>
            </div>
            <Footer />
        </div>
    );
};

