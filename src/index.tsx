import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'  // Tailwind
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom';

// Configure basename for GitHub Pages deployment
const basename = process.env.NODE_ENV === 'production' ? '/tir-criteria-a' : '';

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('No root element found')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)