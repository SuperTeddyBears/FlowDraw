import "../styles/LoginPage.css";
import backgroundImage from "../assets/loginscreen_backgound.png";
import loginBackground from "../assets/loginscreen_shadow.png";
import logo from "../assets/logo.svg";
import diagramImage from "../assets/loginscreen_diagram.png";
import GoogleAuthButton from "../components/Auth/GoogleAuthButton";
import {useAuth} from '../contexts/AuthContext';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const LoginPage = () => {
    const {login, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // If logged in, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Function for the classic login
    const handleStandardLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', {email, password});
            const {token} = response.data;
            await login(token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    }
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
                        <img className="logo" src={logo} alt="FlowDraw Logo"/>

                        <h2 className="login-title">Login to your account</h2>

                        {/*New button for Google login*/}
                        <div className="google-login-container">
                            <GoogleAuthButton/>
                        </div>

                        <div className="separator">
                            <div className="line"></div>
                            <span className="separator-text">OR</span>
                            <div className="line"></div>
                        </div>

                        <form onSubmit={handleStandardLogin}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="login-input">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="login-input">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="login-actions">
                                <div className="remember-me">
                                    <input type="checkbox" id="remember"/>
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() => alert("Funkcja odzyskiwania hasła nie jest jeszcze dostępna.")}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" className="sign-in">
                                Sign in
                            </button>
                        </form>

                        <p className="register">
                            Don’t have an account?{" "}
                            <button
                                type="button"
                                className="register-link"
                                onClick={() => navigate('/register')}
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
                    <img className="diagram-image" alt="Diagram image" src={diagramImage}/>
                </div>
            </div>

            <footer className="footer">
                <img className="footer-logo" src={logo} alt="FlowDraw Logo"/>
                <p className="footer-text">
                    Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.
                </p>
            </footer>
        </>
    );
};
