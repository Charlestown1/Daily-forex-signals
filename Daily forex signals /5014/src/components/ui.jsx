import React, { useEffect } from 'react'
export const Skel = ({ h = 120, n = 1 }) => <>{Array.from({ length: n }, (_, i) => <div key={i} className="skel" style={{ height: h }} aria-hidden="true" />)}</>
export const Empty = ({ title, text, children }) => <div className="empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg><h3>{title}</h3>{text && <p>{text}</p>}{children}</div>
export const ErrorBox = ({ text = 'Unable to load signals right now. Please try again shortly.' }) => <div className="empty err-box" role="alert"><h3>Something went wrong</h3><p>{text}</p></div>
export function Lightbox({ src, alt, onClose }) {
  useEffect(() => { const f = e => e.key === 'Escape' && onClose(); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [onClose])
  return <div className="lb" role="dialog" aria-modal="true" aria-label="Trade screenshot" onClick={onClose}><button className="lb-x" aria-label="Close preview">×</button><img src={src} alt={alt} onClick={e => e.stopPropagation()} /></div>
}
export const Modal = ({ children, onClose }) => <div className="lb modal-bg" role="dialog" aria-modal="true" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>{children}</div></div>
