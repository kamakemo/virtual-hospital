import React from 'react';

export default function NotFound() {
  return (
    <section className="wrap panel panel-light">
      <div className="empty"><span>🧭</span><h2>Page not found</h2><p>That address does not exist.</p><a className="btn" href="#/">Back to the home page</a></div>
    </section>
  );
}
