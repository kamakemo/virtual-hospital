import React, { useEffect, useMemo, useRef, useState } from 'react';

/* Renders an uploaded HTML file in a sandboxed iframe. The frame has scripts
   but no access to this site (no same-origin), so a case file cannot read the
   signed-in session. Browser storage is unavailable in that sandbox, so a
   small in-memory shim is injected first for files that use localStorage. */

const SHIM = `<script>(function(){function M(){var d={};return{getItem:function(k){return k in d?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}
['localStorage','sessionStorage'].forEach(function(n){try{window[n].getItem('x')}catch(e){try{Object.defineProperty(window,n,{value:M(),configurable:true})}catch(_){}}});})();</script>`;

function withShim(html) {
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + SHIM);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + '<head>' + SHIM + '</head>');
  return SHIM + html;
}

export default function HtmlFrame({ html, title, tall = true }) {
  const ref = useRef(null);
  const [full, setFull] = useState(false);
  const doc = useMemo(() => withShim(html || ''), [html]);
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={'frame' + (full ? ' full' : '')}>
      <div className="frame-bar">
        <span>{title}</span>
        <button className="btn btn-sm" onClick={() => setFull(f => !f)}>{full ? '✕ Exit full screen' : '⤢ Full screen'}</button>
      </div>
      <iframe ref={ref} title={title} srcDoc={doc} className={tall ? 'tall' : ''}
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-popups-to-escape-sandbox" />
    </div>
  );
}
