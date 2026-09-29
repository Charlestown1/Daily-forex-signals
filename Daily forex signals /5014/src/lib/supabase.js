import { createClient } from '@supabase/supabase-js'
export const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
export const TG = 'https://t.me/dailyforexsignald'
export const imgUrl = p => (p ? sb.storage.from('signal-images').getPublicUrl(p).data.publicUrl : null)
const vid = () => { try { let v = localStorage.getItem('vid'); if (!v) { v = crypto.randomUUID(); localStorage.setItem('vid', v) } return v } catch { return null } }
export function track(path, event = 'pageview') {
  const ua = navigator.userAgent
  let ref = null; try { ref = document.referrer ? new URL(document.referrer).hostname : null } catch {}
  sb.from('page_events').insert({ path, event, referrer: ref, visitor_id: vid(),
    device: /Mobi|Android/i.test(ua) ? 'mobile' : 'desktop',
    browser: /Edg/.test(ua) ? 'Edge' : /Firefox/.test(ua) ? 'Firefox' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other',
    os: /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : 'Other' }).then(() => {}, () => {})
}