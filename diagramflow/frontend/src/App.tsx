// import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {HomePage} from "./pages/HomePage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";
import {DiagramPage} from "./pages/DiagramPage.tsx";
// import {AuthProvider, useAuth} from './contexts/AuthContext';
import {AuthProvider} from './contexts/AuthContext';
import GoogleOAuthProvider from './providers/GoogleOAuthProvider';
// import React from "react";
import {RegisterPage} from "./pages/RegisterPage.tsx";

// For the sake of protected routes
// const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
//     const {isAuthenticated, loading} = useAuth();
//
//     // We could show loader here - DELETE IF NOT NEEDED: FIXME
//     if (loading) {
//         // return <div className="loading">Ładowanie...</div>; // or a loading spinner
//         return <div className="loading"><span className="spinner"></span> Ładowanie...</div>;
//     }
//     // If the user is not authenticated, redirect to the login page
//     if (!isAuthenticated) {
//         return <Navigate to="/login"/>;
//     }
//     // Else save on rendering the children
//     return <>{children}</>;
// }

export function AppWithProviders() {
    return (
        <GoogleOAuthProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        {/*For development purposes only uncommnet these two lines to access pages without a login */}
                        <Route path="/dashboard" element={<DashboardPage/>}></Route>
                        <Route path="/diagrampage" element={<DiagramPage/>}></Route>
                        {/*<Route*/}
                        {/*    path="/dashboard"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <DashboardPage/>*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/diagrampage"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <DiagramPage/>*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export function App() {
    return <AppWithProviders></AppWithProviders>
}
