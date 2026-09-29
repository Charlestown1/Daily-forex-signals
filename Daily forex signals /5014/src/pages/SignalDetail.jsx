import React, { useEffect, useState } from 'react'
import { sb } from '../lib/supabase.js'
import { Link } from '../lib/nav.jsx'
import { useSeo } from '../lib/seo.js'
import { Levels, Shot, Badges, resClass } from '../components/SignalCard.jsx'
import { Skel, Empty, ErrorBox } from '../components/ui.jsx'
export default function SignalDetail({ id }) {
  const [s, setS] = useState(undefined), [err, setErr] = useState(false)
  useEffect(() => { setS(undefined); setErr(false); sb.from('signals').select('*').eq('id', id).eq('published', true).maybeSingle().then(({ data, error }) => error ? setErr(true) : setS(data), () => setErr(true)) }, [id])
  useSeo(s ? `${s.pair} ${s.direction} signal – Daily Forex Signals` : 'Signal – Daily Forex Signals', s ? `${s.pair} ${s.direction}: entry ${s.entry}, stop loss ${s.stop_loss}, take profit ${s.tp1}.` : 'Forex signal details.', '/signals/' + id)
  const nav = <p className="crumbs"><Link to="/">Home</Link> / <Link to="/#today">Today's signals</Link> / <Link to="/history">Trade history</Link></p>
  if (err) return <div className="wrap sec">{nav}<ErrorBox /></div>
  if (s === undefined) return <div className="wrap sec">{nav}<Skel h={260} n={2} /></div>
  if (!s) return <div className="wrap sec">{nav}<Empty title="Signal not found" text="It may have been removed or not published yet."><Link className="btn" to="/history">Trade history</Link></Empty></div>
  const done = s.result !== 'OPEN'
  return <div className="wrap sec detail">{nav}
    <div className="row between wrapx"><h1 className="h2">{s.pair} <span className={s.direction === 'BUY' ? 'up' : 'down'}>{s.direction}</span></h1><Badges s={{ ...s, result: 'OPEN' }} /></div>
    <p className="muted">{new Date(s.signal_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} {s.timezone}{s.session ? ' · ' + s.session : ''}</p>
    {done && <div className={'result ' + resClass(s.result)}><b>{s.result}</b><span>{s.pips > 0 ? '+' : ''}{s.pips} PIPS</span></div>}
    <div className="card"><Levels s={s} /></div>
    <div className="dgrid"><div>{s.analysis && <><h2>Analysis</h2><p className="analysis">{s.analysis}</p></>}{s.notes && <><h2>Notes</h2><p className="analysis">{s.notes}</p></>}{!s.analysis && !s.notes && <p className="muted">No written analysis for this signal.</p>}</div><Shot s={s} big /></div>
    <p className="small muted">Educational content only. Not financial advice.</p></div>
}
