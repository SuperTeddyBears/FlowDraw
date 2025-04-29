import { Link } from "react-router-dom";
import flowchartImage from '../assets/flowchart.png';
import umlImage from '../assets/uml.png';
import networkImage from '../assets/network.png';
import '../styles/HomePage.css';
import { motion } from 'framer-motion';
import logo from "../assets/logo.svg";
import {useAuth} from "../contexts/AuthContext.tsx";
import UserDropdown from "../components/DashboardPage/UserDrodown.tsx";

import '../styles/App.css';
export function HomePage() {
  const {isAuthenticated} = useAuth();

  return (
      <div className='HomePage'>
        <motion.div
            className='RegisterLoginButtons'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
        >
          {isAuthenticated ? (
              // Użytkownik zalogowany - pokaż ikonkę użytkownika
              <div className="genericAvatar">
                <UserDropdown />
              </div>
          ) : (
              // Użytkownik niezalogowany - pokaż przyciski Register i Login
              <>
                <Link to="/register">
                  <motion.button
                      whileHover={{
                        scale: 1.15,
                        boxShadow: "0px 5px 15px rgba(0, 174, 239, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Register
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                      className="Login"
                      whileHover={{
                        scale: 1.15,
                        boxShadow: "0px 5px 15px rgba(0, 174, 239, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Login
                  </motion.button>
                </Link>
              </>
          )}
        </motion.div>
  
      <motion.div
        className="WelcomeMessage"
        initial={{ x: '-50vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="WelcomeTextContainer">
          <motion.div
            className="WavingHand"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            whileHover={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0], transition: { duration: 1.5 } }}
            whileTap={{ scale: 1.2 }}
          >
            👋
          </motion.div>
          <h1 className="WelcomeText">
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
        </div>
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
          transition={{ delay: 3.5, type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link to="/dashboard">
            <motion.button 
              className='AppButton'
              whileHover={{ 
                scale: 1.15, 
                boxShadow: "0px 5px 15px rgba(0, 174, 239, 0.4)" 
              }}
              whileTap={{ scale: 0.95 }}
            >
              Go to App
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="NewSection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1 }}
      >
        <div className="ContentContainer">
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
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                >
                  <motion.span
                    className="FeatureIcon"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
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
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <p>
              <span className="flow">flow</span>
              <span className="draw">draw</span>
              <span className="dot">.</span> is a modern online tool for creating diagrams. With a simple interface, you can quickly visualize your ideas, design business processes, and organize information. Create easy-to-read flowcharts, UML or Network diagrams – all in one place!
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="DiagramsSection"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }} 
          transition={{ duration: 0.8 }}
        >
          Here you can create:
        </motion.h1>
        
        <div className="DiagramsContainer">
          {[
            { title: "Flowcharts", image: flowchartImage, alt: "Flowchart" },
            { title: "UML diagrams", image: umlImage, alt: "UML Diagram" },
            { title: "Network diagrams", image: networkImage, alt: "Network Diagram" }
          ].map((diagram, index) => (
            <motion.div
              className="DiagramItem"
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05}}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + 0.2 * index }}
              >
                {diagram.title}
              </motion.h1>
              <motion.div
                className="ImageWrapper"
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + 0.2 * index }}
              >
                <motion.img
                  src={diagram.image}
                  alt={diagram.alt}
                  className="CenteredDiagramImage"
                  animate={{
                    y: [0, -10, 0], 
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <footer className="footer">
        <img className="footer-logo" src={logo} alt="FlowDraw Logo" />
        <p className="footer-text">
          Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.
        </p>
      </footer>
    </div>
  );
}