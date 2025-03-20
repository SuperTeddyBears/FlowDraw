import {StrictMode} from "react";
import {Dashboard} from "./Dashboard.tsx";
import {createRoot} from "react-dom/client";
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
)
