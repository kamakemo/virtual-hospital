import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2, Download, Check, Loader2 } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import { Breadcrumb, Button, EmptyState, SeverityTag, Chip, cx } from '../ui/kit.jsx';
import { withCaseChrome, isAppStyleLayout } from '../lib/caseChrome.js';
import { UNIT_BY_ID, DEPT_BY_ID, UNIT_BY_LEGACY } from '../data/curriculum.js';

/* Storage serves uploaded HTML as plain text whatever the content-type says, so
   a case is never loaded with src=URL. The text is fetched first and handed to
   the iframe as srcDoc — which also lets the case chrome be injected. */
function useCaseDocument(caseData) {
  const raw = caseData?.htmlUrl || caseData?.htmlContent || '';
  const isUrl = raw.startsWith('http://') || raw.startsWith('https://');
  const isInline = !isUrl && raw.trimStart().startsWith('<');

  const [html, setHtml] = useState(isInline ? raw : '');
  const [loading, setLoading] = useState(isUrl);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUrl) { setHtml(isInline ? raw : ''); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError('');
    fetch(raw)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => { if (!cancelled) { setHtml(text); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [raw, isUrl, isInline]);

  return { html, loading, error, hasContent: isUrl || isInline };
}

/** Fallback renderer for the handful of cases stored as structured stages
    rather than a single HTML document. Read-only, no gamification. */
function StructuredCase({ caseData }) {
  const data = caseData.data || caseData;
  const fields = [
    ['Patient', data.profile && [data.profile.name, data.profile.age && `${data.profile.age}`, data.profile.sex].filter(Boolean).join(' · ')],
    ['Handover', data.handover],
    ['Initial assessment', data.assessment],
    ['Resident review', data.resident],
    ['Consultant round', data.consultant],
    ['Teaching points', data.teaching],
    ['Orders', data.orders],
    ['Nursing care', data.nursing],
    ['Investigations', data.investigations],
    ['ECG / imaging', data.imaging],
    ['Medications', data.medications],
    ['Monitoring', data.monitoring],
    ['Complications', data.complications],
    ['Differentials', data.differentials],
    ['Plan', data.plan],
    ['Progress', data.progress],
    ['Discharge', data.discharge],
    ['Clinical pearls', data.pearls],
  ].filter(([, v]) => v && (typeof v === 'string' ? v.trim() : true));

  const render = v => {
    if (typeof v === 'string') return <p className="whitespace-pre-wrap">{v}</p>;
    if (Array.isArray(v)) return <ul className="list-disc pl-5 space-y-1">{v.map((x, i) => <li key={i}>{typeof x === 'string' ? x : JSON.stringify(x)}</li>)}</ul>;
    return <pre className="text-[12px] overflow-x-auto">{JSON.stringify(v, null, 2)}</pre>;
  };

  if (fields.length === 0) {
    return <EmptyState title="This case has no content yet" body="It was created but never filled in." />;
  }

  return (
    <div className="max-w-read">
      {fields.map(([label, value]) => (
        <section key={label} className="py-6 border-b border-line last:border-0">
          <h2 className="label text-accent-deep mb-3">{label}</h2>
          <div className="rte-content">{render(value)}</div>
        </section>
      ))}
    </div>
  );
}

export default function CaseReader({ caseData, deptId, unitId, progress, setProgress, navigate }) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(900);
  const [fullscreen, setFullscreen] = useState(false);

  const { html, loading, error, hasContent } = useCaseDocument(caseData);
  const appStyle = useMemo(() => isAppStyleLayout(html), [html]);
  const srcDoc = useMemo(() => withCaseChrome(html), [html]);

  const doneKey = `rich:${caseData?.id}`;
  const completed = !!(progress?.completedStages?.[doneKey] || progress?.completedStages?.[caseData?.id]);

  // Long documents grow the iframe so the outer page scrolls.
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame || !html || appStyle) return;
    let ro = null;
    const measure = () => {
      try {
        const d = frame.contentDocument;
        if (!d?.body) return;
        const h = d.body.scrollHeight;
        if (h > 100) setHeight(Math.min(h + 24, 16000));
      } catch { /* cross-origin */ }
    };
    const onLoad = () => setTimeout(() => {
      measure();
      try {
        const d = frame.contentDocument;
        if (d?.body && typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(measure); ro.observe(d.body); }
      } catch { /* cross-origin */ }
    }, 300);
    frame.addEventListener('load', onLoad);
    return () => { frame.removeEventListener('load', onLoad); ro?.disconnect(); };
  }, [html, appStyle]);

  // App-style cases are sized to the visible window and scroll internally.
  useEffect(() => {
    if (!appStyle) return;
    const frame = iframeRef.current;
    if (!frame) return;
    const fit = () => {
      const top = frame.getBoundingClientRect().top;
      setHeight(Math.max(460, Math.round(window.innerHeight - Math.max(0, top) - 4)));
    };
    fit();
    const onLoad = () => setTimeout(fit, 50);
    frame.addEventListener('load', onLoad);
    window.addEventListener('resize', fit);
    const t1 = setTimeout(fit, 200), t2 = setTimeout(fit, 500);
    return () => {
      frame.removeEventListener('load', onLoad);
      window.removeEventListener('resize', fit);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, [appStyle, html, fullscreen]);

  if (!caseData) {
    return (
      <Page>
        <EmptyState
          title="Case not found"
          body="This case is no longer in the hospital."
          action={<Button onClick={() => navigate({ name: 'home' })}>Back to the hospital</Button>}
        />
      </Page>
    );
  }

  const unit = UNIT_BY_ID[unitId] || UNIT_BY_LEGACY[caseData.department] || null;
  const dept = DEPT_BY_ID[deptId] || (unit ? DEPT_BY_ID[unit.deptId] : null);

  const markComplete = () => {
    if (completed) return;
    setProgress(p => ({
      ...p,
      xp: (p.xp || 0) + 50,
      completedStages: { ...p.completedStages, [doneKey]: true },
    }));
  };

  const download = () => {
    try {
      const blob = new Blob([html || ''], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(caseData.title || 'case').replace(/[^\w]+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      if (caseData.htmlUrl) window.open(caseData.htmlUrl, '_blank', 'noopener');
    }
  };

  const bar = (
    <div className={cx('bg-paper border-b border-line', fullscreen && 'sticky top-0 z-10')}>
      <div className={cx('mx-auto px-5 sm:px-7 py-2.5 flex items-center gap-3 flex-wrap', fullscreen ? 'max-w-none' : 'max-w-[1480px]')}>
        <button
          onClick={() => navigate(unit && dept
            ? { name: 'unit', deptId: dept.id, unitId: unit.id }
            : { name: 'home' })}
          className="text-[13px] text-ink-3 hover:text-accent-deep shrink-0"
        >
          ← {unit ? unit.short || unit.label : 'Hospital'}
        </button>
        <span className="text-line" aria-hidden="true">·</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-medium text-ink truncate">{caseData.title}</h1>
            <SeverityTag severity={caseData.severity} />
          </div>
          {caseData.chiefComplaint && (
            <p className="text-[12px] text-ink-3 truncate">{caseData.chiefComplaint}</p>
          )}
        </div>
        {completed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-good/30 bg-good/5 text-good text-[12px] font-medium shrink-0">
            <Check size={12} strokeWidth={3} /> Completed
          </span>
        ) : (
          <Button size="sm" onClick={markComplete} className="shrink-0">
            <Check size={12} strokeWidth={3} /> Mark complete
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
        <Button variant="ghost" size="sm" onClick={download} title="Download this case as HTML">
          <Download size={14} />
        </Button>
      </div>
    </div>
  );

  // Structured (non-HTML) case: render in the app's own design.
  if (!hasContent) {
    return (
      <>
        {bar}
        <Page>
          {dept && unit && (
            <Breadcrumb trail={[
              { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
              { label: dept.label, onClick: () => navigate({ name: 'department', deptId: dept.id }) },
              { label: unit.short || unit.label, onClick: () => navigate({ name: 'unit', deptId: dept.id, unitId: unit.id }) },
              { label: caseData.title },
            ]} />
          )}
          <h1 className="display text-[30px] leading-tight text-ink mb-2">{caseData.title}</h1>
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <SeverityTag severity={caseData.severity} />
            {caseData.system && <Chip tone="quiet">{caseData.system}</Chip>}
            {caseData.tags?.slice(0, 6).map(t => <Chip key={t} tone="quiet">{t}</Chip>)}
          </div>
          <StructuredCase caseData={caseData} />
        </Page>
      </>
    );
  }

  return (
    <div className={cx(fullscreen && 'fixed inset-0 z-50 bg-paper overflow-y-auto')}>
      {bar}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-24 text-ink-3 text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading case…
        </div>
      )}
      {error && (
        <div className="max-w-read mx-auto px-6 py-20 text-center">
          <p className="display text-xl text-crit mb-2">This case would not load</p>
          <p className="text-sm text-ink-2 mb-6">{error}</p>
          <Button variant="quiet" onClick={() => navigate({ name: 'home' })}>Back to the hospital</Button>
        </div>
      )}
      {html && !loading && (
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title={caseData.title}
          className="w-full block border-0 bg-white"
          style={{ height: `${height}px`, minHeight: appStyle ? '320px' : '600px' }}
          allow="fullscreen; clipboard-write; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation allow-downloads"
        />
      )}
    </div>
  );
}
