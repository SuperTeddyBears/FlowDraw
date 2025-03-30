import "../styles/LoginScreen.css";
import backgroundImage from "../assets/loginscreen_backgound.png";
import loginBackground from "../assets/loginscreen_shadow.png";
import logo from "../assets/logo.svg";
import googleIcon from "../assets/loginscreen_google_logo.png";
import diagramImage from "../assets/loginscreen_diagram.png";

export const LoginPage = () => {
  return (
    <>
      <div
        className="login-screen"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div
          className="login-background"
          style={{
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="login-section">
            <img className="logo" src={logo} alt="FlowDraw Logo" />

            <h2 className="login-title">Login to your account</h2>

            <button
              type="button"
              className="google-login"
              onClick={() => alert("This feature is not implemented yet")}
            >
              <img className="google-icon" src={googleIcon} alt="Google Icon" />
              Continue with Google
            </button>

            <div className="separator">
              <div className="line"></div>
              <span className="separator-text">OR</span>
              <div className="line"></div>
            </div>

            <div className="login-input">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
              />
            </div>

            <div className="login-input">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <div className="login-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button
                type="button"
                className="forgot-password"
                onClick={() => alert("This feature is not implemented yet")}
              >
                Forgot password?
              </button>
            </div>
            
            <button
              type="button"
              className="sign-in"
              onClick={() => alert("This feature is not implemented yet")}
            >
              Sign in
            </button>

            <p className="register">
              Don’t have an account?{" "}
              <button
                type="button"
                className="register-link"
                onClick={() => alert("This feature is not implemented yet")}
              >
                Join free today
              </button>
            </p>
          </div>
        </div>

        <div className="welcome-section">
          <h3 className="welcome-title">WELCOME BACK!</h3>
          <h2 className="welcome-text">
            You're one step away from visualizing your ideas!
          </h2>
          <img className="diagram-image" alt="Diagram image" src={diagramImage} />
        </div>
      </div>

      <footer className="footer">
        <img className="footer-logo" src={logo} alt="FlowDraw Logo" />
        <p className="footer-text">
          Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.
        </p>
      </footer>
    </>
  );
};
