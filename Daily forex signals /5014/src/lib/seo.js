import { useEffect } from 'react'

const SITE = (import.meta.env.VITE_SITE_URL || 'https://daily-forex-signals.onrender.com').replace(/\/$/, '')

const ensure = (selector, tag, attrs) => {
  let el = document.head.querySelector(selector)
  if (!el) { el = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); document.head.appendChild(el) }
  return el
}

export function useSeo(title, desc, path = location.pathname) {
  useEffect(() => {
    document.title = title
    const meta = (key, val, prop) => ensure(`meta[${prop ? 'property' : 'name'}="${key}"]`, 'meta', { [prop ? 'property' : 'name']: key }).setAttribute('content', val)
    meta('description', desc)
    meta('og:title', title, 1); meta('og:description', desc, 1); meta('og:type', 'website', 1); meta('og:url', SITE + path, 1)
    meta('twitter:card', 'summary'); meta('twitter:title', title); meta('twitter:description', desc)
    ensure('link[rel="canonical"]', 'link', { rel: 'canonical' }).setAttribute('href', SITE + path)
  }, [title, desc, path])
}