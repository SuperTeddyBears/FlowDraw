import React from "react";
import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '../../contexts/AuthContext';
import axios from "axios";

const GoogleAuthButton: React.FC = () => {
    const {login} = useAuth();

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const response = await axios.post("/api/auth/google", {
                token: credentialResponse.credential,
            });

            // Downloading the JWT token from the response
            const {token} = response.data.token;
            // Logging in the user with the token
            await login(token);
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    return (
        <div className="google-auth-button">
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Login Failed")}
                useOneTap
                text="continue_with"
                shape="pill"
            ></GoogleLogin>
        </div>
    );
};

export default GoogleAuthButton;