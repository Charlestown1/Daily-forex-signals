import React from 'react'
export const go = p => { history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0) }
export const Link = ({ to, children, ...r }) => <a href={to} onClick={e => { e.preventDefault(); go(to) }} {...r}>{children}</a>
