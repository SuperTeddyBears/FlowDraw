import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layer, Stage } from 'react-konva';
import { AppSideBar } from './components/AppSideBar.tsx';
import { GridLayer } from './components/GridLayer.tsx';
import { KonvaShape } from './components/KonvaShape.tsx';
import diagramImage from './images/uml-diagram.png';
import { motion } from 'framer-motion';

const SIDEBAR_WIDTH = '0.1';

function HomePage() {
  return (
    <div className='HomePage'>
      <motion.div
        className="WavingHand"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        whileHover={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
        whileTap={{ scale: 1.2 }}
      >
        👋
      </motion.div>

      <motion.div
        className='RegisterLoginButtons'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Link to="/register">
          <button>Register</button>
        </Link>
        <Link to="/login">
          <button className="Login">Login</button>
        </Link>
      </motion.div>

      <motion.div
        className="WelcomeMessage"
        initial={{ x: '-100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h1>
          <motion.span
            className="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Welcome to
          </motion.span>
          <motion.span
            className="flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            flow
          </motion.span>
          <motion.span
            className="draw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            draw
          </motion.span>
          <motion.span
            className="dot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
          >
            .
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          Click below to start creating your diagrams!
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3.5, duration: 0.5 }}
        >
          <Link to="/app">
            <button className='AppButton'>Go to App</button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="NewSection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1 }}
      >
        <div className="LeftContent">
          <h1>
            <span className="flow">flow</span>
            <span className="draw">draw</span>
            <span className="dot">.</span>
          </h1>
          <div className='FeatureList'>
            {[
              { icon: "✏️", text: "Easy drawing" },
              { icon: "🔗", text: "Intuitive connections" },
              { icon: "📦", text: "Export and share" },
              { icon: "🔒", text: "Secure and private" }
            ].map((feature, index) => (
              <motion.div
                className="FeatureItem"
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.5 + index * 0.3, duration: 0.5 }}
              >
                <motion.span
                  className="FeatureIcon"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                >
                  {feature.icon}
                </motion.span>
                <span className="FeatureText">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="RightContent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.5, duration: 1 }}
        >
          <p>
            <span className="flow">flow</span>
            <span className="draw">draw</span>
            <span className="dot">.</span> is a modern online tool for creating diagrams. With a simple interface, you can quickly visualize your ideas, design business processes, and organize information. Create easy-to-read flowcharts, UML or Network diagrams – all in one place!
          </p>
          <motion.img
            src={diagramImage}
            alt="Diagram Example"
            className="RightContentImage"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0], 
            }}
            transition={{
              opacity: { delay: 6, duration: 1 },
              scale: { delay: 6, duration: 0.5 },
              y: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          />
        </motion.div>
      </motion.div>
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
            <div>
              <div className="App"></div>
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