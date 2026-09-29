import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
import Admin from './pages/Admin.jsx'
import About from './pages/About.jsx'
import SignalDetail from './pages/SignalDetail.jsx'
import { Link } from './lib/nav.jsx'
import { track, TG } from './lib/supabase.js'
import './styles.css'

function App() {
  const [path, setPath] = useState(location.pathname)
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark')
  useEffect(() => { const f = () => setPath(location.pathname); addEventListener('popstate', f); return () => removeEventListener('popstate', f) }, [])
  useEffect(() => { if (!path.startsWith('/admin')) track(path) }, [path])
  const toggle = () => { const t = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t) } catch {}; setDark(!dark) }
  return <>
    <header className="nav"><div className="wrap row">
      <Link to="/" className="brand">Daily Forex Signals</Link>
      <nav className="links">
        <Link to="/">Home</Link><Link to="/history">Trade History</Link><Link to="/about">About</Link>
        <a href={TG} target="_blank" rel="noopener noreferrer" onClick={() => track(path, 'telegram_click')}>Telegram</a>
        <button className="ghost" onClick={toggle} aria-label="Toggle dark mode">{dark ? 'Light' : 'Dark'}</button>
      </nav></div></header>
    <main>{path.startsWith('/admin') ? <Admin /> : path.startsWith('/history') ? <History /> : path === '/about' ? <About /> : path.startsWith('/signals/') ? <SignalDetail id={path.split('/')[2]} /> : <Home />}</main>
    <footer className="wrap foot"><p><strong>Risk disclaimer.</strong> Signals are for information and education only and are not financial advice. Forex trading carries a high risk of loss. Past results do not guarantee future results.</p>
      <p>© {new Date().getFullYear()} Daily Forex Signals</p></footer>
  </>
}
createRoot(document.getElementById('root')).render(<App />)
