import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {HomePage} from "./pages/HomePage.tsx";
import {MainPage} from "./pages/MainPage.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<MainPage />} />
        <Route path="/login" element={<DashboardPage />}/>
      </Routes>
    </Router>
  );
}
