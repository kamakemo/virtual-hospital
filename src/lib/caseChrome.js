/* ============================================================
   CASE CHROME
   Two things injected into every rich-HTML case before it is
   handed to the iframe:

   1. ANCHOR_FIX — in-page `#id` links scroll inside the iframe
      instead of trying to navigate the parent frame.
   2. ROUNDS_MODE — a presentation layer. Turns any case that
      exposes sections into a full-screen, big-type slideshow for
      teaching a room: arrows to move, Space to reveal punchlines
      then advance, +/- to resize, Esc to exit. Shows nothing if
      it cannot find at least two slides.

   Both are plain ES5 inside a string so they run in any iframe.
   ============================================================ */

const ANCHOR_FIX = `<script>
(function(){
  try {
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(href.charAt(0) !== '#') return;
      e.preventDefault();
      var id = '';
      try { id = decodeURIComponent(href.slice(1)); } catch(_) { id = href.slice(1); }
      if(!id){ window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var el = document.getElementById(id);
      if(!el){ try { el = document.querySelector('a[name="' + id + '"]'); } catch(_){} }
      if(el && el.scrollIntoView){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, true);
  } catch(_){}
})();
<\/script>`;

const ROUNDS_MODE = `<style id="vhr-style">
.vhr-launch{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;background:#0E6B7A;color:#fff;border:none;border-radius:999px;padding:9px 15px;font:600 13px/1 Archivo,'Segoe UI',system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(15,26,32,.22)}
.vhr-launch:hover{background:#0A4F5A}
@media print{.vhr-launch,.vhr-bar{display:none!important}}
html.vhr-on,html.vhr-on body{background:#F7F9FB!important}
html.vhr-on .topnav,html.vhr-on .dash,html.vhr-on .toast,html.vhr-on .hero,html.vhr-on .vitals-strip,html.vhr-on .footer,html.vhr-on .sidebar,html.vhr-on .vhr-launch{display:none!important}
html.vhr-on #caseScroll{height:auto!important;overflow:visible!important;padding:0!important}
html.vhr-on main{max-width:none!important;margin:0!important;padding:0!important}
html.vhr-on .r-slide-el{display:none!important}
html.vhr-on .r-slide-el.r-current{display:block!important;max-width:1180px;margin:0 auto;padding:3vh 4vw 16vh;zoom:var(--r-zoom,1.3);animation:vhrIn .25s ease}
@keyframes vhrIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
html.vhr-on .r-spoiler.r-hidden{filter:blur(12px);cursor:pointer;transition:filter .25s}
html.vhr-on .r-spoiler.r-hidden:hover{filter:blur(7px)}
.vhr-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483001;display:none;align-items:center;gap:8px;background:rgba(15,26,32,.95);color:#fff;border-radius:12px;padding:8px 12px;font:600 13px/1 Archivo,'Segoe UI',system-ui,sans-serif;box-shadow:0 10px 30px rgba(15,26,32,.3);max-width:96vw;flex-wrap:wrap;justify-content:center}
html.vhr-on .vhr-bar{display:flex}
.vhr-bar button{background:rgba(255,255,255,.14);color:#fff;border:none;border-radius:8px;padding:7px 11px;font:600 13px/1 inherit;cursor:pointer}
.vhr-bar button:hover{background:rgba(255,255,255,.28)}
.vhr-bar .vhr-count{min-width:60px;text-align:center;opacity:.9}
.vhr-bar .vhr-title{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.75;font-weight:500}
.vhr-bar .vhr-sep{width:1px;height:20px;background:rgba(255,255,255,.2)}
.vhr-bar .vhr-tgl.active{background:#E9C23F;color:#0F1A20}
<\/style>
<script>
(function(){
  try{
    var D=document, root=D.documentElement;
    function pickSlides(){
      var s=[].slice.call(D.querySelectorAll('section.case-sec'));
      if(s.length<2){ var g=[].slice.call(D.querySelectorAll('main section[id], main > section')); if(g.length>=2) s=g; }
      if(s.length<2){ s=[].slice.call(D.querySelectorAll('[id]')).filter(function(e){ return /^s\\d+$/i.test(e.id) && (e.tagName==='SECTION'||e.tagName==='DIV'); }); }
      return s;
    }
    var slides=[], idx=0, zoom=1.3, hideP=false, count, ttl, tglBtn;
    function slideTitle(el){ var h=el.querySelector('.sec-header h2, h1, h2, h3'); return h?(h.textContent||'').trim().slice(0,80):''; }
    function markSpoilers(){
      slides.forEach(function(el){
        [].slice.call(el.querySelectorAll('.rule, .reveal-box, [data-spoiler], [data-answer]')).forEach(function(x){
          x.classList.add('r-spoiler');
          if(hideP) x.classList.add('r-hidden'); else x.classList.remove('r-hidden');
        });
      });
    }
    function render(){
      slides.forEach(function(el,i){ el.classList.toggle('r-current', i===idx); });
      root.style.setProperty('--r-zoom', zoom);
      if(count) count.textContent=(idx+1)+' / '+slides.length;
      if(ttl) ttl.textContent=slideTitle(slides[idx]);
      markSpoilers();
      try{ window.scrollTo(0,0); }catch(_){}
    }
    function enter(){
      slides=pickSlides();
      if(slides.length<2) return;
      slides.forEach(function(el){ el.classList.add('r-slide-el'); });
      root.classList.add('vhr-on'); idx=0; render();
      try{ if(!D.fullscreenElement && root.requestFullscreen) root.requestFullscreen().catch(function(){}); }catch(_){}
    }
    function exit(){
      root.classList.remove('vhr-on');
      slides.forEach(function(el){ el.classList.remove('r-current','r-slide-el'); });
      [].slice.call(D.querySelectorAll('.r-spoiler')).forEach(function(x){ x.classList.remove('r-spoiler','r-hidden'); });
      try{ if(D.fullscreenElement) D.exitFullscreen(); }catch(_){}
    }
    function next(){ if(idx<slides.length-1){ idx++; render(); } }
    function prev(){ if(idx>0){ idx--; render(); } }
    function revealNext(){ var el=slides[idx]; if(!el) return false; var sp=el.querySelector('.r-spoiler.r-hidden'); if(sp){ sp.classList.remove('r-hidden'); return true; } return false; }
    function toggleHide(){ hideP=!hideP; if(tglBtn) tglBtn.classList.toggle('active',hideP); markSpoilers(); }
    function build(){
      if(pickSlides().length<2) return;
      var launch=D.createElement('button'); launch.className='vhr-launch'; launch.type='button'; launch.innerHTML='Rounds Mode';
      launch.addEventListener('click', enter); D.body.appendChild(launch);
      var bar=D.createElement('div'); bar.className='vhr-bar';
      bar.innerHTML='<button class="vhr-prev" title="Previous (left arrow)">&#9664;<\\/button><span class="vhr-count">1 / 1<\\/span><button class="vhr-next" title="Next (right arrow)">&#9654;<\\/button><span class="vhr-sep"><\\/span><span class="vhr-title"><\\/span><span class="vhr-sep"><\\/span><button class="vhr-sm" title="Smaller text (-)">A&#8722;<\\/button><button class="vhr-bg" title="Bigger text (+)">A+<\\/button><button class="vhr-tgl" title="Hide punchlines until clicked (Space reveals)">Reveal<\\/button><span class="vhr-sep"><\\/span><button class="vhr-exit" title="Exit (Esc)">Exit<\\/button>';
      D.body.appendChild(bar);
      count=bar.querySelector('.vhr-count'); ttl=bar.querySelector('.vhr-title'); tglBtn=bar.querySelector('.vhr-tgl');
      bar.querySelector('.vhr-prev').addEventListener('click', prev);
      bar.querySelector('.vhr-next').addEventListener('click', next);
      bar.querySelector('.vhr-sm').addEventListener('click', function(){ zoom=Math.max(0.8,zoom-0.1); render(); });
      bar.querySelector('.vhr-bg').addEventListener('click', function(){ zoom=Math.min(2.4,zoom+0.1); render(); });
      tglBtn.addEventListener('click', toggleHide);
      bar.querySelector('.vhr-exit').addEventListener('click', exit);
    }
    if(D.readyState==='loading') D.addEventListener('DOMContentLoaded', build); else build();
    D.addEventListener('keydown', function(e){
      if(!root.classList.contains('vhr-on')) return;
      var k=e.key;
      if(k==='Escape'){ exit(); }
      else if(k==='ArrowRight'||k==='PageDown'){ e.preventDefault(); next(); }
      else if(k==='ArrowLeft'||k==='PageUp'){ e.preventDefault(); prev(); }
      else if(k===' '){ e.preventDefault(); if(!(hideP && revealNext())) next(); }
      else if(k==='+'||k==='='){ zoom=Math.min(2.4,zoom+0.1); render(); }
      else if(k==='-'||k==='_'){ zoom=Math.max(0.8,zoom-0.1); render(); }
    }, true);
  }catch(_){}
})();
<\/script>`;

/** Append the case chrome just before </body> (or at the end if there isn't one). */
export function withCaseChrome(doc) {
  if (!doc) return doc;
  const add = ANCHOR_FIX + ROUNDS_MODE;
  if (doc.indexOf('</body>') !== -1) {
    return doc.replace('</body>', () => add + '</body>');
  }
  return doc + add;
}

/* Cases come in two shapes. Some are long documents that should grow the
   iframe and let the outer page scroll; others are built like an app, with a
   fixed sidebar and 100vh layout, and must be sized to the visible window so
   their own viewport units mean what the author intended. */
export function isAppStyleLayout(html) {
  if (!html) return false;
  const fixed = /position\s*:\s*fixed/i.test(html) || /position\s*:\s*sticky/i.test(html);
  const vh = /\b\d{1,3}vh\b/i.test(html);
  const sidebar = /class\s*=\s*["'][^"']*sidebar/i.test(html);
  return (fixed && vh) || sidebar;
}
