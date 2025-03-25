import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layer, Stage } from 'react-konva';
import { AppSideBar } from './components/AppSideBar.tsx';
import { GridLayer } from './components/GridLayer.tsx';
import { KonvaShape } from './components/KonvaShape.tsx';

const SIDEBAR_WIDTH = '0.1';

function HomePage() {
  return (
    <div className='HomePage'>
      <div className='RegisterLoginButtons'> 
        <Link to="/register">
          <button>Register</button>
        </Link>
        <Link to="/login">
          <button className="Login">Login</button> 
        </Link>
      </div>
      <div className="WelcomeMessage">
        <h1> 
          <span className="welcome">Welcome to</span> 
          <span className="flow">flow</span>
          <span className="draw">draw</span>
          <span className="dot">.</span>
        </h1>
        <p>Click below to start creating your diagrams!</p>
        <Link to="/app">
          <button className='AppButton'>Go to App</button>
        </Link>
      </div>
      <div className="NewSection">
        <div className="LeftContent">
          <h1>
            <span className="flow">flow</span>
            <span className="draw">draw</span>
            <span className="dot">.</span>
          </h1>
          <div className='FeatureList'>
            <div className="FeatureItem">
              <span className="FeatureIcon">✏️</span>
              <span className="FeatureText">Easy drawing</span>
            </div>
            <div className="FeatureItem">
              <span className="FeatureIcon">🔗</span>
              <span className="FeatureText">Intuitive connections</span>
            </div>
            <div className="FeatureItem">
              <span className="FeatureIcon">📦</span>
              <span className="FeatureText">Export and share</span>
            </div>
            <div className="FeatureItem">
              <span className="FeatureIcon">🔒</span>
              <span className="FeatureText">Secure and private</span>
            </div>
          </div>
        </div>
          
        <div className="RightContent">
          <p>
            <span className="flow">flow</span>
            <span className="draw">draw</span>
            <span className="dot">.</span> is a modern online tool for creating diagrams. With a simple interface, you can quickly visualize your ideas, design business processes, and organize information. Create easy-to-read flowcharts, UML or Network diagrams – all in one place!
          </p>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/app"
          element={
            <div className="App">
              <div className={'sidebar'} style={{ width: SIDEBAR_WIDTH }}>
                <AppSideBar width={window.innerWidth * parseFloat(SIDEBAR_WIDTH)} />
              </div>

              <div className={'main'} style={{ marginLeft: SIDEBAR_WIDTH }}>
                <Stage
                  width={window.innerWidth * (1 - parseFloat(SIDEBAR_WIDTH))}
                  height={window.innerHeight}
                >
                  <GridLayer density={20} />

                  <Layer>
                    <KonvaShape />
                  </Layer>
                </Stage>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}