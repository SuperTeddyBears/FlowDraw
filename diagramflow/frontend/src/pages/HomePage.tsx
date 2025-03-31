import {Link} from "react-router-dom";
import diagramImage from '../assets/image-removebg-preview (1).png';
import '../styles/HomePage.css';

export function HomePage() {
  return (
    <div className='HomePage'>
      <div className='RegisterLoginButtons'>
        <Link to="/register">
          <button disabled>Register</button>
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
        <Link to="/diagrampage">
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
          <img src={diagramImage} alt="Diagram Example" className="RightContentImage" />
        </div>
      </div>
    </div>
  );
}
