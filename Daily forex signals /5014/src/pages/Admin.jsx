import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { sb, imgUrl } from '../lib/supabase.js'
import SignalCard from '../components/SignalCard.jsx'
import { Skel, Empty, Modal } from '../components/ui.jsx'
const EMPTY = { pair: '', direction: 'BUY', entry: '', stop_loss: '', tp1: '', tp2: '', tp3: '', risk_reward: '', timezone: 'UTC', session: '', status: 'PENDING', result: 'OPEN', pips: 0, quality: '', analysis: '', notes: '', image_path: null, published: false }
const NUM = ['entry', 'stop_loss', 'tp1', 'tp2', 'tp3', 'pips']
const count = (rows, k) => Object.entries(rows.reduce((a, r) => (a[r[k] || 'Unknown'] = (a[r[k] || 'Unknown'] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).slice(0, 6)
const Bars = ({ title, data, cls }) => { const m = Math.max(1, ...data.map(d => Math.abs(d[1]))); return <div className="card"><h4>{title}</h4>{data.length ? data.map(([k, v]) => <div key={k} className="bar"><span>{k}</span><i className={v < 0 ? 'neg' : cls} style={{ width: Math.max(2, Math.abs(v) / m * 100) + '%' }} /><b>{v}</b></div>) : <p className="muted small">No data yet</p>}</div> }
const Line = ({ title, pts }) => { const W = 300, H = 120, v = pts.map(p => p[1]), mn = Math.min(0, ...v), mx = Math.max(1, ...v), x = i => pts.length < 2 ? W / 2 : 8 + i * (W - 16) / (pts.length - 1), y = n => H - 8 - (n - mn) / (mx - mn || 1) * (H - 16)
  return <div className="card"><h4>{title}</h4>{pts.length ? <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={title}><line x1="0" x2={W} y1={y(0)} y2={y(0)} stroke="var(--line)" /><polyline fill="none" stroke="var(--acc)" strokeWidth="2.5" points={pts.map((p, i) => `${x(i)},${y(p[1])}`).join(' ')} />{pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p[1])} r="3" fill="var(--acc)" />)}</svg> : <p className="muted small">No closed trades yet</p>}<p className="small muted">Latest: {v.length ? v[v.length - 1] : 0} pips</p></div> }
const Stack = ({ w, l, b }) => { const t = w + l + b || 1; return <div className="card"><h4>Wins vs losses</h4><div className="stack" role="img" aria-label={`${w} wins, ${l} losses, ${b} breakeven`}><i className="up-bg" style={{ flex: w }} /><i className="down-bg" style={{ flex: l }} /><i className="mut-bg" style={{ flex: b }} /></div><p className="small muted">{w} wins · {l} losses · {b} breakeven · {Math.round(w / t * 100)}% win rate</p></div> }

function Login() {
  const [f, setF] = useState({ email: '', password: '' }), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const login = async e => { e.preventDefault(); setBusy(true); setMsg(''); const { error } = await sb.auth.signInWithPassword(f); setBusy(false); if (error) setMsg('Login failed. Please check your email and password.') }
  const reset = async () => { if (!f.email) return setMsg('Enter your email first.'); const { error } = await sb.auth.resetPasswordForEmail(f.email, { redirectTo: location.origin + '/admin' }); setMsg(error ? 'Could not send the reset email.' : 'Password reset email sent.') }
  return <form className="card narrow" onSubmit={login}><h1 className="h2">Admin sign in</h1>
    <label>Email<input type="email" required autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
    <label>Password<input type="password" required autoComplete="current-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
    <button className="btn full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><button type="button" className="ghost full" onClick={reset}>Forgot password</button>{msg && <p className="err" role="alert">{msg}</p>}</form>
}

function Form({ init, onDone, onCancel }) {
  const [f, setF] = useState(init), [file, setFile] = useState(null), [prev, setPrev] = useState(null), [msg, setMsg] = useState(''), [errs, setErrs] = useState([]), [busy, setBusy] = useState(false), [rrManual, setRrManual] = useState(!!init.risk_reward)
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  useEffect(() => { if (!file) return setPrev(null); const u = URL.createObjectURL(file); setPrev(u); return () => URL.revokeObjectURL(u) }, [file])
  const auto = useMemo(() => { const e = +f.entry, s = +f.stop_loss, t = +f.tp1; return e && s && t && e !== s ? '1:' + (Math.abs(t - e) / Math.abs(e - s)).toFixed(2) : '' }, [f.entry, f.stop_loss, f.tp1])
  const shrink = file => new Promise((ok, no) => { const img = new Image(); img.onload = () => { const s = Math.min(1, 1400 / img.width), c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => b ? ok(b) : no(new Error('convert')), 'image/webp', 0.82) }; img.onerror = () => no(new Error('read')); img.src = URL.createObjectURL(file) })
  const validate = () => { const e = [], n = k => Number(f[k]); if (!f.pair.trim()) e.push('Enter the currency pair.'); ['entry', 'stop_loss', 'tp1'].forEach(k => { if (f[k] === '' || !(n(k) > 0)) e.push(`${k === 'tp1' ? 'Take profit' : k === 'entry' ? 'Entry' : 'Stop loss'} must be a positive number.`) }); if (!e.length) { const b = f.direction === 'BUY'; if (b ? !(n('stop_loss') < n('entry') && n('entry') < n('tp1')) : !(n('stop_loss') > n('entry') && n('entry') > n('tp1'))) e.push(b ? 'For a BUY, stop loss must be below entry and take profit above.' : 'For a SELL, stop loss must be above entry and take profit below.') } ['tp2', 'tp3'].forEach(k => { if (f[k] !== '' && !(n(k) > 0)) e.push(`${k.toUpperCase()} must be a positive number or empty.`) }); return e }
  const save = async pub => {
    const v = validate(); setErrs(v); if (v.length) return window.scrollTo(0, 0)
    setBusy(true); setMsg(pub === null ? 'Saving changes…' : pub ? 'Publishing signal…' : 'Saving draft…')
    try {
      const row = { ...f }; delete row.id; delete row.created_at
      NUM.forEach(k => { row[k] = row[k] === '' || row[k] == null ? (k === 'pips' ? 0 : null) : Number(row[k]) })
      row.risk_reward = rrManual ? f.risk_reward : auto; if (pub !== null) row.published = pub; row.updated_at = new Date().toISOString()
      if (file) { setMsg('Uploading image…'); let blob; try { blob = await shrink(file) } catch { throw new Error('IMG') }
        const path = `${Date.now()}.webp`, up = await sb.storage.from('signal-images').upload(path, blob, { contentType: 'image/webp' }); if (up.error) throw new Error('IMG')
        if (f.image_path) await sb.storage.from('signal-images').remove([f.image_path]); row.image_path = path }
      const { error } = await (f.id ? sb.from('signals').update(row).eq('id', f.id) : sb.from('signals').insert(row)); if (error) throw error; onDone()
    } catch (x) { setMsg(x.message === 'IMG' ? 'Image upload failed. Please check your connection and try again.' : 'Something went wrong while saving this signal. ' + (x.message || '')) } finally { setBusy(false) }
  }
  const rmImg = async () => { if (file) return setFile(null); if (!confirm('Remove this image?')) return; setMsg('Removing image…'); await sb.storage.from('signal-images').remove([f.image_path]); if (f.id) await sb.from('signals').update({ image_path: null }).eq('id', f.id); setF({ ...f, image_path: null }); setMsg('Image removed.') }
  const T = (k, l, p = {}) => <label>{l}<input value={f[k] ?? ''} onChange={set(k)} inputMode={NUM.includes(k) ? 'decimal' : undefined} {...p} /></label>
  const S = (k, l, o) => <label>{l}<select value={f[k]} onChange={set(k)}>{o.map(x => <option key={x}>{x}</option>)}</select></label>
  const shown = prev || (f.image_path && imgUrl(f.image_path))
  return <div className="card form"><h2>{f.id ? 'Edit signal' : 'New signal'}</h2>
    {errs.length > 0 && <ul className="errlist" role="alert">{errs.map(e => <li key={e}>{e}</li>)}</ul>}
    <fieldset><legend>Trade</legend><div className="fgrid">{T('pair', 'Pair (e.g. GBP/USD)')}{S('direction', 'Direction', ['BUY', 'SELL'])}{T('entry', 'Entry')}{T('stop_loss', 'Stop loss')}{T('tp1', 'Take profit')}{T('tp2', 'TP 2 (optional)')}{T('tp3', 'TP 3 (optional)')}
      <label>Risk/reward<input value={rrManual ? f.risk_reward : auto} onChange={e => { setRrManual(true); set('risk_reward')(e) }} placeholder="auto" /></label>{T('session', 'Market/session')}{T('timezone', 'Timezone')}{T('quality', 'Quality label')}</div></fieldset>
    <fieldset><legend>Status</legend><div className="fgrid">{S('status', 'Status', ['PENDING', 'ACTIVE', 'TP_HIT', 'SL_HIT', 'CLOSED', 'CANCELLED'])}{S('result', 'Result', ['OPEN', 'WIN', 'LOSS', 'BREAKEVEN'])}{T('pips', 'Pips (+/−)')}</div></fieldset>
    <label>Analysis<textarea rows="5" value={f.analysis ?? ''} onChange={set('analysis')} /></label><label>Notes<textarea rows="2" value={f.notes ?? ''} onChange={set('notes')} /></label>
    <fieldset><legend>Screenshot</legend>{shown ? <img className="preview" src={shown} alt="Screenshot preview" /> : <div className="shot ph">No image selected.</div>}
      <div className="actions"><label className="btn alt filebtn">{shown ? 'Replace image' : 'Choose image'}<input hidden type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} /></label>{shown && <button type="button" className="danger" onClick={rmImg}>{file ? 'Discard new image' : 'Remove image'}</button>}</div>
      {file && <p className="small muted">New image will be optimised and uploaded when you save.</p>}</fieldset>
    <div className="actions sticky"><button className="btn alt" disabled={busy} onClick={() => save(false)}>Save draft</button><button className="btn" disabled={busy} onClick={() => save(true)}>Publish</button>{f.id && <button className="btn alt" disabled={busy} onClick={() => save(null)}>Save changes</button>}<button className="ghost" onClick={onCancel}>Cancel</button></div>
    {msg && <p className={/wrong|failed/.test(msg) ? 'err' : 'muted'} role="status">{busy && <span className="spin" />}{msg}</p>}</div>
}

function Confirm({ c, onCancel, onOk }) {
  const { s, result } = c, [pips, setPips] = useState(result === 'BREAKEVEN' ? 0 : (s.pips || ''))
  const bad = result !== 'BREAKEVEN' && (pips === '' || isNaN(pips) || (result === 'WIN' ? +pips <= 0 : +pips >= 0))
  return <Modal onClose={onCancel}><h3>Mark this trade as {result}?</h3><dl className="levels"><div><dt>Trade</dt><dd>{s.pair} {s.direction}</dd></div><div><dt>Entry</dt><dd>{s.entry}</dd></div><div><dt>Take profit</dt><dd>{s.tp1}</dd></div></dl>
    {result !== 'BREAKEVEN' && <label>Final pips ({result === 'WIN' ? 'positive, e.g. 70' : 'negative, e.g. -30'})<input inputMode="decimal" value={pips} onChange={e => setPips(e.target.value)} /></label>}
    {bad && <p className="err small">Enter a {result === 'WIN' ? 'positive' : 'negative'} pip value.</p>}
    <div className="actions"><button onClick={onCancel}>CANCEL</button><button className={'btn ' + (result === 'LOSS' ? 'dangerbtn' : '')} disabled={bad} onClick={() => onOk(s, result, result === 'BREAKEVEN' ? 0 : +pips)}>CONFIRM {result}</button></div></Modal>
}

function Dashboard() {
  const [rows, setRows] = useState(null), [ev, setEv] = useState([]), [edit, setEdit] = useState(null), [msg, setMsg] = useState(''), [tab, setTab] = useState('dash'), [q, setQ] = useState(''), [flt, setFlt] = useState('ALL'), [conf, setConf] = useState(null), [del, setDel] = useState(null)
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([sb.from('signals').select('*').order('signal_at', { ascending: false }).limit(500), sb.from('page_events').select('*').gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).limit(5000)])
    if (a.error) setMsg('Could not load signals: ' + a.error.message); else setMsg(''); setRows(a.data || []); setEv(b.data || [])
  }, [])
  useEffect(() => { load() }, [load])
  const upd = async (s, patch, label) => { setMsg(label); const { error } = await sb.from('signals').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', s.id); setMsg(error ? 'Something went wrong while saving this signal.' : 'Saved.'); load() }
  const doMark = (s, result, pips) => { setConf(null); upd(s, { result, pips, status: result === 'WIN' ? 'TP_HIT' : result === 'LOSS' ? 'SL_HIT' : 'CLOSED' }, `Marking ${result}…`) }
  const doDel = async s => { setDel(null); setMsg('Deleting signal…'); if (s.image_path) await sb.storage.from('signal-images').remove([s.image_path]); const { error } = await sb.from('signals').delete().eq('id', s.id); setMsg(error ? 'Delete failed.' : 'Signal deleted.'); load() }
  if (edit) return <Form init={edit} onDone={() => { setEdit(null); load() }} onCancel={() => setEdit(null)} />
  const R = rows || [], closed = R.filter(r => r.result !== 'OPEN' && r.status !== 'CANCELLED').sort((a, b) => a.signal_at.localeCompare(b.signal_at))
  const w = closed.filter(r => r.result === 'WIN').length, l = closed.filter(r => r.result === 'LOSS').length, be = closed.filter(r => r.result === 'BREAKEVEN').length
  let run = 0; const cum = closed.map(r => [r.signal_at.slice(0, 10), +(run += Number(r.pips || 0)).toFixed(1)])
  const mo = (list, f) => Object.entries(list.reduce((a, r) => (a[r.signal_at.slice(0, 7)] = (a[r.signal_at.slice(0, 7)] || 0) + f(r), a), {})).sort().slice(-6)
  const today = new Date().toISOString().slice(0, 10), cards = [['Total signals', R.length], ['Active', R.filter(r => r.status === 'ACTIVE').length], ['Wins', w], ['Losses', l], ['Breakeven', be], ['Win rate', closed.length ? Math.round(w / closed.length * 100) + '%' : '0%'], ['Total pips', +run.toFixed(1)], ['Today', R.filter(r => r.signal_at.slice(0, 10) === today).length]]
  const list = R.filter(r => (flt === 'ALL' || (flt === 'DRAFT' ? !r.published : r.result === flt || r.status === flt)) && (!q || r.pair.toLowerCase().includes(q.toLowerCase())))
  const pv = ev.filter(e => e.event === 'pageview'), days = {}; pv.forEach(e => { const d = e.created_at.slice(5, 10); days[d] = (days[d] || 0) + 1 })
  return <div><div className="row between wrapx"><h1 className="h2">Admin</h1><div className="row wrapx"><button className="btn" onClick={() => setEdit(EMPTY)}>+ New signal</button><button className="ghost" onClick={() => sb.auth.signOut()}>Log out</button></div></div>
    <div className="chips">{[['dash', 'Dashboard'], ['signals', 'Signals'], ['analytics', 'Analytics']].map(([v, n]) => <button key={v} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>{n}</button>)}</div>
    {msg && <p className={/Could not|wrong|failed/.test(msg) ? 'err' : 'muted'} role="status">{msg}</p>}
    {!rows ? <div className="stats"><Skel h={84} n={4} /></div> : tab === 'dash' ? <><div className="stats">{cards.map(([k, v]) => <div key={k} className="card stat"><b>{v}</b><span>{k}</span></div>)}</div>
      {!R.length ? <Empty title="No signals yet" text="Tap + New signal to add your first." /> : <div className="grid"><Stack w={w} l={l} b={be} /><Line title="Cumulative pips" pts={cum} /><Bars title="Signals per month" data={mo(R, () => 1)} cls="acc" /><Bars title="Pips per month" data={mo(closed, r => Number(r.pips || 0))} cls="acc" /><Bars title="Signals by pair" data={count(R, 'pair')} cls="acc" /><Bars title="Active vs completed" data={[['Active/pending', R.filter(r => r.result === 'OPEN' && r.status !== 'CANCELLED').length], ['Completed', closed.length], ['Cancelled', R.filter(r => r.status === 'CANCELLED').length]]} cls="acc" /></div>}
      {R.length > 0 && <><h2>Recent signals</h2><div className="grid">{R.slice(0, 3).map(s => <SignalCard key={s.id} s={s} compact />)}</div></>}</>
    : tab === 'signals' ? <><input className="search" placeholder="Search pair…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search signals" />
      <div className="chips">{['ALL', 'DRAFT', 'ACTIVE', 'OPEN', 'WIN', 'LOSS', 'BREAKEVEN', 'CANCELLED'].map(v => <button key={v} className={flt === v ? 'on' : ''} onClick={() => setFlt(v)}>{v === 'ALL' ? 'All' : v[0] + v.slice(1).toLowerCase()}</button>)}</div>
      {!list.length ? <Empty title="No signals match" /> : <div className="grid">{list.map(s => <div key={s.id} className="adm"><SignalCard s={s} compact /><p className="small"><span className={'tag ' + (s.published ? 'up' : '')}>{s.published ? 'Published' : 'Draft'}</span></p>
        <div className="actions"><button className="win" onClick={() => setConf({ s, result: 'WIN' })}>Mark win</button><button className="loss" onClick={() => setConf({ s, result: 'LOSS' })}>Mark loss</button><button onClick={() => setConf({ s, result: 'BREAKEVEN' })}>Breakeven</button><button onClick={() => upd(s, { status: 'ACTIVE', result: 'OPEN' }, 'Saving changes…')}>Mark active</button><button onClick={() => upd(s, { status: 'CANCELLED' }, 'Saving changes…')}>Cancel trade</button><button onClick={() => upd(s, { published: !s.published }, s.published ? 'Unpublishing…' : 'Publishing…')}>{s.published ? 'Unpublish' : 'Publish'}</button><button onClick={() => setEdit(s)}>Edit</button><button onClick={() => { const { id, created_at, ...c } = s; setEdit({ ...c, published: false, result: 'OPEN', status: 'PENDING', pips: 0, image_path: null }) }}>Duplicate</button><button className="danger" onClick={() => setDel(s)}>Delete</button></div></div>)}</div>}</>
    : <><p className="muted small">Last 30 days. Anonymous; no IP addresses stored. Country data isn't available from Supabase: connect a provider such as Cloudflare Web Analytics for that.</p>
      <div className="stats"><div className="card stat"><b>{pv.length}</b><span>Page views</span></div><div className="card stat"><b>{new Set(pv.map(e => e.visitor_id)).size}</b><span>Unique visitors</span></div><div className="card stat"><b>{ev.filter(e => e.event === 'telegram_click').length}</b><span>Telegram clicks</span></div></div>
      <div className="grid"><Bars title="Views per day" data={Object.entries(days).sort().slice(-14)} cls="acc" /><Bars title="Top pages" data={count(pv, 'path')} cls="acc" /><Bars title="Referrers" data={count(pv, 'referrer')} cls="acc" /><Bars title="Devices" data={count(pv, 'device')} cls="acc" /><Bars title="Browsers" data={count(pv, 'browser')} cls="acc" /><Bars title="Operating systems" data={count(pv, 'os')} cls="acc" /></div></>}
    {conf && <Confirm c={conf} onCancel={() => setConf(null)} onOk={doMark} />}
    {del && <Modal onClose={() => setDel(null)}><h3>Delete this signal?</h3><p>{del.pair} {del.direction} will be permanently deleted{del.image_path ? ', including its screenshot' : ''}.</p><div className="actions"><button onClick={() => setDel(null)}>CANCEL</button><button className="btn dangerbtn" onClick={() => doDel(del)}>DELETE</button></div></Modal>}
  </div>
}

export default function Admin() {
  const [st, setSt] = useState({ loading: true })
  useEffect(() => {
    document.title = 'Admin – Daily Forex Signals'; let live = true
    const check = async session => { if (!session) return live && setSt({}); const { data, error } = await sb.from('admin_roles').select('role').eq('user_id', session.user.id).maybeSingle(); live && setSt(error ? { error: true } : { user: session.user, admin: data?.role === 'admin' }) }
    sb.auth.getSession().then(({ data }) => check(data.session)).catch(() => live && setSt({ error: true }))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => check(s)); return () => { live = false; sub.subscription.unsubscribe() }
  }, [])
  useEffect(() => { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m); return () => m.remove() }, [])
  return <div className="wrap sec">{st.loading ? <Skel h={120} n={2} /> : st.error ? <p className="err">Could not reach the server. Check your connection and refresh.</p>
    : !st.user ? <Login /> : !st.admin ? <div className="card narrow"><h1 className="h2">Access denied</h1><p>This account is not an administrator.</p><button className="btn" onClick={() => sb.auth.signOut()}>Log out</button></div> : <Dashboard />}</div>
}
