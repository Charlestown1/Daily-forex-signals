import React, { useState } from 'react'
import { imgUrl } from '../lib/supabase.js'
import { Link } from '../lib/nav.jsx'
import { Lightbox } from './ui.jsx'
export const resClass = r => (r === 'WIN' ? 'up' : r === 'LOSS' ? 'down' : '')
export const Levels = ({ s }) => <dl className="levels">
  <div><dt>Entry</dt><dd>{s.entry}</dd></div><div><dt>Stop loss</dt><dd className="down">{s.stop_loss}</dd></div><div><dt>Take profit</dt><dd className="up">{s.tp1}</dd></div>
  {s.tp2 && <div><dt>TP 2</dt><dd className="up">{s.tp2}</dd></div>}{s.tp3 && <div><dt>TP 3</dt><dd className="up">{s.tp3}</dd></div>}{s.risk_reward && <div><dt>Risk/reward</dt><dd>{s.risk_reward}</dd></div>}</dl>
export const Shot = ({ s, big }) => {
  const [open, setOpen] = useState(false), [bad, setBad] = useState(false)
  if (!s.image_path || bad) return <div className="shot ph">No trade screenshot available.</div>
  return <><button className={'shot' + (big ? ' big' : '')} onClick={() => setOpen(true)} aria-label={`Enlarge ${s.pair} screenshot`}><img loading="lazy" src={imgUrl(s.image_path)} alt={`${s.pair} ${s.direction} trade screenshot`} onError={() => setBad(true)} /><span>Tap to enlarge</span></button>
    {open && <Lightbox src={imgUrl(s.image_path)} alt={`${s.pair} ${s.direction} trade screenshot, full size`} onClose={() => setOpen(false)} />}</>
}
export const Badges = ({ s }) => <div className="row wrapx"><span className="tag">{s.status.replace('_', ' ')}</span>
  {s.result !== 'OPEN' && <span className={'tag solid ' + resClass(s.result)}>{s.result} {s.pips > 0 ? '+' : ''}{s.pips} pips</span>}{s.quality && <span className="tag">{s.quality}</span>}</div>
export default function SignalCard({ s, compact }) {
  const buy = s.direction === 'BUY'
  return <article className={'card sig ' + (buy ? 'buy' : 'sell')}>
    <div className="row between"><h3><Link to={'/signals/' + s.id}>{s.pair}</Link></h3><span className={'tag solid ' + (buy ? 'up' : 'down')}>{s.direction}</span></div>
    <p className="muted small">{new Date(s.signal_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}{s.session ? ' · ' + s.session : ''}</p>
    <Levels s={s} /><Badges s={s} />
    {!compact && s.analysis && <p className="analysis clamp">{s.analysis}</p>}
    <Shot s={s} /><Link to={'/signals/' + s.id} className="btn alt full">View details</Link>
  </article>
}
