import {GoogleOAuthProvider as GoogleProvider} from "@react-oauth/google";
import React from "react";

// From environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface GoogleOAuthProviderProps {
    children: React.ReactNode;
}

const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({children}) => {
    return (
        <GoogleProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleProvider>
    );
};

export default GoogleOAuthProvider;