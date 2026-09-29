import React from 'react'
import { TG, track } from '../lib/supabase.js'
import { Link } from '../lib/nav.jsx'
import { useSeo } from '../lib/seo.js'
export const TgCta = ({ from }) => <section className="card cta"><h2>Get more updates on Telegram</h2><p>Join the community for extra updates and trade notes.</p><a className="btn" href={TG} target="_blank" rel="noopener noreferrer" onClick={() => track(from, 'telegram_click')}>JOIN OUR TELEGRAM</a></section>
export default function About() {
  useSeo('About – Daily Forex Signals', 'How Daily Forex Signals publishes trade ideas, reports results and why a transparent history matters.')
  return <div className="wrap sec prose"><h1 className="h2">About Daily Forex Signals</h1>
    <p className="lead">Daily Forex Signals publishes forex trade ideas with clear levels and the reasoning behind them, then records how each one turned out.</p>
    <h2>What to expect</h2><p>Each signal lists the pair, direction, entry, stop loss and one to three take-profit levels, with a risk/reward ratio, the market session and written analysis. A chart screenshot is attached when available.</p>
    <h2>How the trade history works</h2><p>When a trade closes, it is marked win, loss or breakeven with the pips gained or lost. Statistics on the site are calculated from those recorded results.</p>
    <h2>Why transparency matters</h2><p>Any signal service can show its best trades. A complete public history, losses included, lets you judge the approach for yourself. <Link to="/history">See the trade history</Link>.</p>
    <h2>Risk disclaimer</h2><p>Signals are for information and education only and are not financial advice. Forex trading carries a high risk of loss and no result is guaranteed. Only trade money you can afford to lose.</p>
    <TgCta from="/about" /></div>
}
