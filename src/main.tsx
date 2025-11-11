import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import "./styles/tailwind.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <div className="p-6">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-3">Tailwind is working</h1>
        <button className="btn btn--primary">Primary</button>
      </div>
    </div>
  </StrictMode>,
)
