import {StrictMode} from "react";
import {App} from "./App.tsx";
import {createRoot} from "react-dom/client";
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
