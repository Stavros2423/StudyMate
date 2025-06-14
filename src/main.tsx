
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { db } from "./lib/firebase";
createRoot(document.getElementById("root")!).render(<App />);
