
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {HomePage} from "./pages/HomePage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";
import {DiagramPage} from "./pages/DiagramPage.tsx";
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/diagrampage" element={<DiagramPage />} />
      </Routes>
    </Router>
  );
}
