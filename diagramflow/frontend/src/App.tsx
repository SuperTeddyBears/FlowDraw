import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layer, Stage } from 'react-konva';
import { GridLayer } from './components/GridLayer.tsx';
import { AppSideBar } from './components/AppSideBar.tsx';
import { KonvaShape } from './components/KonvaShape.tsx';

const SIDEBAR_WIDTH = '0.1';

function HomePage() {
  return (
    <div className='HomePage'>
      <div className='Register/LoginButtons'>
        <Link to="/register">
          <button>Register</button>
        </Link>
        <Link to="/login">
          <button className="Login">Login</button> 
        </Link>
      </div>
      <div>
        <h1>Welcome to FlowDraw</h1>
        <p>Click below to start creating your diagrams!</p>
        <Link to="/app">
          <button>Go to App</button>
        </Link>
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