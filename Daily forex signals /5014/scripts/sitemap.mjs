// Writes dist/sitemap.xml and adds it to dist/robots.txt. The ONLY place to set your domain: the VITE_SITE_URL env var.
import { writeFileSync, appendFileSync, existsSync } from 'node:fs'
const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
if (!site) { console.warn('VITE_SITE_URL not set: skipping sitemap.xml'); process.exit(0) }
const urls = ['/', '/history', '/about'].map(p => `<url><loc>${site}${p}</loc></url>`).join('')
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`)
if (existsSync('dist/robots.txt')) appendFileSync('dist/robots.txt', `\nSitemap: ${site}/sitemap.xml\n`)
