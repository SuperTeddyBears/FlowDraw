import React from "react";
import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '../../contexts/AuthContext';
import axios from "axios";

const GoogleAuthButton: React.FC = () => {
    const {login} = useAuth();

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            console.log("Otrzymano odpowiedź od Google:", credentialResponse);
            console.log("Wysyłanie tokenu do API...");
            const response = await axios.post("/api/auth/google", {
                token: credentialResponse.credential,
            });

            console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
            console.log("Window origin:", window.location.origin);
            console.log("Odpowiedź z API:", response.data);

            // Downloading the JWT token from the response
            const token = response.data.token;
            const userData = response.data.user;
            // Logging in the user with the token
            await login(token, userData);
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    return (
        <div className="google-auth-button">
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Login Failed")}
                // useOneTap // Causing errors with FedCM
                text="continue_with"
                shape="pill"
            ></GoogleLogin>
        </div>
    );
};

export default GoogleAuthButton;