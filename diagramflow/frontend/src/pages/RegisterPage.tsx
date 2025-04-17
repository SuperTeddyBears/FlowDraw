// src/pages/RegisterPage.tsx
import "../styles/LoginPage.css"; // Możemy użyć tego samego stylu co dla login
import backgroundImage from "../assets/loginscreen_backgound.png";
import loginBackground from "../assets/loginscreen_shadow.png";
import logo from "../assets/logo.svg";
import diagramImage from "../assets/loginscreen_diagram.png";
import GoogleAuthButton from "../components/Auth/GoogleAuthButton";
import {useAuth} from '../contexts/AuthContext';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const RegisterPage = () => {
    const {login, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Check if user is already authenticated
    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    // Registraction of the user
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check if all fields are filled
        if (password !== confirmPassword) {
            setError('Hasła nie są zgodne');
            return;
        }

        try {
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                password
            });

            const {token} = response.data;
            await login(token);
            navigate('/dashboard');
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Błąd rejestracji. Spróbuj ponownie.');
            } else {
                setError('Błąd serwera. Spróbuj ponownie później.');
            }
        }
    };

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

                        <h2 className="login-title">Create your account</h2>

                        <div className="google-login-container">
                            <GoogleAuthButton/>
                        </div>

                        <div className="separator">
                            <div className="line"></div>
                            <span className="separator-text">OR</span>
                            <div className="line"></div>
                        </div>

                        <form onSubmit={handleRegister}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="login-input">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="login-input">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="sign-in">
                                Sign up
                            </button>
                        </form>

                        <p className="register">
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="register-link"
                                onClick={() => navigate('/login')}
                            >
                                Login here
                            </button>
                        </p>
                    </div>
                </div>

                <div className="welcome-section">
                    <h3 className="welcome-title">JOIN US TODAY!</h3>
                    <h2 className="welcome-text">
                        Start creating amazing diagrams in minutes!
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