import { useEffect } from 'react'
const set = (sel, attr, val, tag = 'meta', key) => { let el = document.head.querySelector(sel); if (!el) { el = document.createElement(tag); if (key) el.setAttribute(key[0], key[1]); document.head.appendChild(el) } el.setAttribute(attr, val) }
export function useSeo(title, desc, path = location.pathname) {
  useEffect(() => {
    document.title = title
    const site = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
    const M = (n, v, p) => set(`meta[${p ? 'property' : 'name'}="${n}"]`, 'content', v, 'meta', [p ? 'property' : 'name', n])
    M('description', desc); M('og:title', title, 1); M('og:description', desc, 1); M('og:type', 'website', 1)
    M('twitter:card', 'summary'); M('twitter:title', title); M('twitter:description', desc)
    if (site) { set('link[rel=canonical]', 'href', site + path, 'link', ['rel', 'canonical']); M('og:url', site + path, 1) }
  }, [title, desc, path])
}
