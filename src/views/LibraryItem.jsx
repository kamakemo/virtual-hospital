import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2, Download, Loader2 } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import { Breadcrumb, Button, EmptyState, Chip, cx } from '../ui/kit.jsx';
import { withCaseChrome } from '../lib/caseChrome.js';
import { UNIT_BY_ID, DEPT_BY_ID, UNIT_BY_LEGACY } from '../data/curriculum.js';

export default function LibraryItemView({ item, deptId, unitId, navigate }) {
  const frameRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  const raw = item ? (item.htmlUrl || item.htmlContent || '') : '';
  const isUrl = raw.startsWith('http://') || raw.startsWith('https://');

  // Seeded on the FIRST render for inline content. Mounting the iframe empty and
  // swapping srcDoc afterwards does not reliably re-parse, which is what used to
  // leave the reading page blank.
  const [html, setHtml] = useState(() => (isUrl ? '' : raw));
  const [loading, setLoading] = useState(isUrl);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUrl) { setHtml(raw); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError('');
    fetch(raw)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(t => { if (!cancelled) { setHtml(t); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [raw, isUrl]);

  const srcDoc = useMemo(() => withCaseChrome(html), [html]);

  if (!item) {
    return (
      <Page>
        <EmptyState
          title="Topic not found"
          body="This library topic is no longer published."
          action={<Button onClick={() => navigate({ name: 'home' })}>Back to the hospital</Button>}
        />
      </Page>
    );
  }

  const unit = UNIT_BY_ID[unitId] || UNIT_BY_LEGACY[item.department] || null;
  const dept = DEPT_BY_ID[deptId] || (unit ? DEPT_BY_ID[unit.deptId] : null);

  const download = () => {
    try {
      const blob = new Blob([html || ''], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(item.title || 'topic').replace(/[^\w]+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      if (item.htmlUrl) window.open(item.htmlUrl, '_blank', 'noopener');
    }
  };

  return (
    <div className={cx(fullscreen && 'fixed inset-0 z-50 bg-paper overflow-y-auto')}>
      <div className={cx('bg-paper border-b border-line', fullscreen && 'sticky top-0 z-10')}>
        <div className="max-w-[1480px] mx-auto px-5 sm:px-7 py-2.5 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(unit && dept
              ? { name: 'unit', deptId: dept.id, unitId: unit.id }
              : { name: 'home' })}
            className="text-[13px] text-ink-3 hover:text-accent-deep shrink-0"
          >
            ← {unit ? `${unit.short || unit.label} library` : 'Hospital'}
          </button>
          <span className="text-line" aria-hidden="true">·</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-medium text-ink truncate">{item.title}</h1>
            {item.description && <p className="text-[12px] text-ink-3 truncate">{item.description}</p>}
          </div>
          {item.category && <Chip tone="accent" className="shrink-0">{item.category}</Chip>}
          <Button variant="ghost" size="sm" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={download} title="Download this topic as HTML">
            <Download size={14} />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-24 text-ink-3 text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading topic…
        </div>
      )}
      {error && (
        <div className="max-w-read mx-auto px-6 py-20 text-center">
          <p className="display text-xl text-crit mb-2">This topic would not load</p>
          <p className="text-sm text-ink-2">{error}</p>
        </div>
      )}
      {!loading && !error && !html && (
        <div className="max-w-read mx-auto px-6 py-20">
          <EmptyState title="Nothing published here yet" body="This topic exists but has no content." />
        </div>
      )}
      {html && !loading && (
        <div className={cx('mx-auto', fullscreen ? 'max-w-none' : 'max-w-[1480px] px-5 sm:px-7 py-5')}>
          <iframe
            ref={frameRef}
            key={`${item.id}:${srcDoc.length}`}
            srcDoc={srcDoc}
            title={item.title}
            className={cx('w-full block bg-white border border-line', fullscreen ? 'rounded-none border-0' : 'rounded-panel')}
            style={fullscreen ? { height: '100vh' } : { height: 'calc(100vh - 11rem)', minHeight: '560px' }}
            allow="fullscreen; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads"
          />
        </div>
      )}
    </div>
  );
}
