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

const Sun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
const Moon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
const Mark = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>

function App() {
  const [path, setPath] = useState(location.pathname)
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark')
  useEffect(() => { const f = () => setPath(location.pathname); addEventListener('popstate', f); return () => removeEventListener('popstate', f) }, [])
  useEffect(() => { if (!path.startsWith('/admin')) track(path) }, [path])
  const toggle = () => { const t = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t) } catch {}; setDark(!dark) }
  return <>
    <header className="nav"><div className="wrap row">
      <Link to="/" className="brand"><Mark />Daily Forex Signals</Link>
      <nav className="links">
        <Link to="/">Home</Link><Link to="/history">Trade History</Link><Link to="/about">About</Link>
        <a href={TG} target="_blank" rel="noopener noreferrer" onClick={() => track(path, 'telegram_click')}>Telegram</a>
        <button className="theme" onClick={toggle} aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <Sun /> : <Moon />}<span>{dark ? 'Light mode' : 'Dark mode'}</span>
          <i className="track" aria-hidden="true"><b /></i>
        </button>
      </nav></div></header>
    <main>{path.startsWith('/admin') ? <Admin /> : path.startsWith('/history') ? <History /> : path === '/about' ? <About /> : path.startsWith('/signals/') ? <SignalDetail id={path.split('/')[2]} /> : <Home />}</main>
    <footer className="wrap foot"><p><strong>Risk disclaimer.</strong> Signals are for information and education only and are not financial advice. Forex trading carries a high risk of loss. Past results do not guarantee future results.</p>
      <p>© {new Date().getFullYear()} Daily Forex Signals</p></footer>
  </>
}
createRoot(document.getElementById('root')).render(<App />)