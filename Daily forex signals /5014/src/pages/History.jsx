import React, { useEffect, useMemo, useState } from 'react'
import { sb } from '../lib/supabase.js'
import { useSeo } from '../lib/seo.js'
import SignalCard from '../components/SignalCard.jsx'
import { Stats } from './Home.jsx'
import { Skel, Empty, ErrorBox } from '../components/ui.jsx'
export default function History() {
  const [rows, setRows] = useState(null), [err, setErr] = useState(false), [st, setSt] = useState(null)
  const [res, setRes] = useState('ALL'), [pair, setPair] = useState('ALL'), [month, setMonth] = useState('ALL')
  useSeo('Trade History – Daily Forex Signals', 'Every published forex signal and its outcome: wins, losses and breakeven trades with pips and screenshots.')
  useEffect(() => {
    sb.from('signals').select('*').eq('published', true).order('signal_at', { ascending: false }).limit(500).then(({ data, error }) => error ? setErr(true) : setRows(data), () => setErr(true))
    sb.from('signal_stats').select('*').single().then(({ data }) => setSt(data))
  }, [])
  const pairs = useMemo(() => [...new Set((rows || []).map(r => r.pair))], [rows]), months = useMemo(() => [...new Set((rows || []).map(r => r.signal_at.slice(0, 7)))], [rows])
  const shown = (rows || []).filter(r => (res === 'ALL' || (res === 'CANCELLED' ? r.status === 'CANCELLED' : r.result === res)) && (pair === 'ALL' || r.pair === pair) && (month === 'ALL' || r.signal_at.startsWith(month)))
  return <div className="wrap sec"><h1 className="h2">Trade history</h1><Stats st={st} />
    <div className="chips">{[['ALL', 'All'], ['WIN', 'Wins'], ['LOSS', 'Losses'], ['BREAKEVEN', 'Breakeven'], ['CANCELLED', 'Cancelled']].map(([v, l]) => <button key={v} className={res === v ? 'on' : ''} onClick={() => setRes(v)}>{l}</button>)}</div>
    <div className="filters"><select value={pair} onChange={e => setPair(e.target.value)} aria-label="Currency pair"><option value="ALL">All pairs</option>{pairs.map(p => <option key={p}>{p}</option>)}</select>
      <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Month"><option value="ALL">All months</option>{months.map(m => <option key={m}>{m}</option>)}</select></div>
    {err ? <ErrorBox text="Trade history could not be loaded. Please try again shortly." /> : !rows ? <div className="grid"><Skel h={260} n={4} /></div> : !rows.length ? <Empty title="No completed trades yet" /> : shown.length ? <div className="grid">{shown.map(s => <SignalCard key={s.id} s={s} compact />)}</div> : <Empty title="No trades match your current filters" />}
  </div>
}
