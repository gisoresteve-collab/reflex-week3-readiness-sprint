import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DispatcherDashboard from './DispatcherDashboard.jsx'

const isDispatcher = window.location.hash === '#dispatcher'
const RootApp = isDispatcher ? DispatcherDashboard : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)