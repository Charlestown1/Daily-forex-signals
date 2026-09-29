import React, { useEffect, useState } from 'react'
import { sb, TG, track } from '../lib/supabase.js'
import { Link } from '../lib/nav.jsx'
import { useSeo } from '../lib/seo.js'
import SignalCard, { Levels, Shot, Badges } from '../components/SignalCard.jsx'
import { Skel, Empty, ErrorBox } from '../components/ui.jsx'
import { TgCta } from './About.jsx'
export const Stats = ({ st }) => {
  if (!st) return <div className="stats"><Skel h={84} n={4} /></div>
  const rate = st.total ? Math.round((st.wins / st.total) * 100) : 0, avg = st.total ? (st.total_pips / st.total).toFixed(1) : 0
  return <div className="stats">{[['Total trades', st.total], ['Wins', st.wins], ['Losses', st.losses], ['Breakeven', st.breakeven], ['Win rate', rate + '%'], ['Total pips', st.total_pips], ['Avg pips/trade', avg]].map(([k, v]) => <div key={k} className="card stat"><b>{v}</b><span>{k}</span></div>)}</div>
}
export default function Home() {
  const [d, setD] = useState({})
  useSeo('Daily Forex Signals – Daily trade ideas with a public track record', 'Daily forex trade ideas with entry, stop loss and take profit levels, plus a transparent public trade history. Educational only, not financial advice.', '/')
  useEffect(() => {
    Promise.all([
      sb.from('signals').select('*').eq('published', true).order('signal_at', { ascending: false }).limit(1),
      sb.from('signals').select('*').eq('published', true).in('status', ['ACTIVE', 'PENDING']).order('signal_at', { ascending: false }),
      sb.from('signals').select('*').eq('published', true).neq('result', 'OPEN').order('signal_at', { ascending: false }).limit(3),
      sb.from('signal_stats').select('*').single()]).then(([l, a, r, s]) => {
      if (l.error || a.error || r.error) return setD({ error: true })
      setD({ latest: l.data[0] || null, active: a.data, recent: r.data, stats: s.data || { total: 0, wins: 0, losses: 0, breakeven: 0, total_pips: 0 } })
    }).catch(() => setD({ error: true }))
  }, [])
  const L = d.latest
  return <>
    <section className="hero"><div className="wrap"><h1>Clear forex trade ideas. Every result on the record.</h1>
      <p className="lead">Entry, stop loss and take profit levels with the reasoning behind them. Wins and losses are published openly.</p>
      <div className="row wrapx"><a className="btn" href="#latest">See the latest signal</a><a className="btn alt" href={TG} target="_blank" rel="noopener noreferrer" onClick={() => track('/', 'telegram_click')}>JOIN OUR CHANNEL</a></div></div></section>
    <section className="wrap sec" id="latest"><h2>Latest signal</h2>
      {d.error ? <ErrorBox /> : d.latest === undefined ? <Skel h={280} /> : !L ? <Empty title="No signals published yet" text="The first signal will appear here as soon as it is published."><a className="btn" href={TG} target="_blank" rel="noopener noreferrer" onClick={() => track('/', 'telegram_click')}>JOIN OUR CHANNEL</a></Empty> :
        <article className={'card feature ' + (L.direction === 'BUY' ? 'buy' : 'sell')}><div className="dgrid"><div>
          <div className="row between"><h3 className="big"><Link to={'/signals/' + L.id}>{L.pair}</Link></h3><span className={'tag solid ' + (L.direction === 'BUY' ? 'up' : 'down')}>{L.direction}</span></div>
          <p className="muted small">{new Date(L.signal_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}{L.session ? ' · ' + L.session : ''}</p>
          <Levels s={L} /><Badges s={L} />{L.analysis && <p className="analysis clamp">{L.analysis}</p>}<Link className="btn" to={'/signals/' + L.id}>Full details</Link></div><Shot s={L} big /></div></article>}
    </section>
    <section className="wrap sec" id="today"><h2>Today's signals</h2>
      {d.error ? <ErrorBox /> : !d.active ? <div className="grid"><Skel h={260} n={2} /></div> : d.active.length ? <div className="grid">{d.active.map(s => <SignalCard key={s.id} s={s} />)}</div> : <Empty title="No active forex signals right now" text="Check back later for the next setup." />}</section>
    <section className="band"><div className="wrap sec"><h2>Performance</h2>{d.error ? <ErrorBox /> : <Stats st={d.stats} />}<p className="small muted">Calculated from published, closed trades. Past results do not guarantee future results.</p></div></section>
    <section className="wrap sec"><div className="row between"><h2>Recent trade results</h2><Link to="/history">Full history</Link></div>
      {!d.recent ? (d.error ? <ErrorBox /> : <div className="grid"><Skel h={260} n={3} /></div>) : d.recent.length ? <div className="grid">{d.recent.map(s => <SignalCard key={s.id} s={s} compact />)}</div> : <Empty title="No completed trades yet" text="Closed trades and their results will appear here." />}</section>
    <section className="wrap sec"><h2>How it works</h2><ol className="steps"><li><b>A setup is published.</b> Pair, direction, entry, stop loss and up to three targets.</li><li><b>You decide.</b> Size any trade to your own risk tolerance.</li><li><b>The result is recorded.</b> Each closed trade is marked win, loss or breakeven in the history.</li></ol></section>
    <div className="wrap sec"><TgCta from="/" /></div>
  </>
}