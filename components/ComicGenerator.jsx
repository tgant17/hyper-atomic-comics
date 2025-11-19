'use client';

import { useState, useCallback } from 'react';

const HISTORY_LIMIT = 8;

const formatTimestamp = (value) => {
  try {
    return new Date(value).toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

export default function ComicGenerator() {
  const [currentComic, setCurrentComic] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestComic = useCallback(
    async (preserveCurrent = false) => {
      setError(null);
      setIsLoading(true);
      try {
        if (preserveCurrent && currentComic) {
          setHistory((prev) => {
            const updated = [currentComic, ...prev];
            return updated.slice(0, HISTORY_LIMIT);
          });
        }

        const response = await fetch('/api/generate-comic', { method: 'POST' });
        const raw = await response.text();
        let payload = {};
        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = {};
        }
        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to generate comic');
        }

        const displayUrl = payload?.imageData || payload?.imageUrl || null;
        const normalized = {
          ...payload,
          id: `${payload?.comicNumber ?? 'comic'}-${Date.now()}`,
          generatedAt: payload?.generatedAt ?? new Date().toISOString(),
          displayUrl
        };
        setCurrentComic(normalized);
      } catch (err) {
        setError(err?.message ?? 'Unable to generate comic');
      } finally {
        setIsLoading(false);
      }
    },
    [currentComic]
  );

  const handleRecall = (entry) => {
    setCurrentComic(entry);
  };

  return (
    <section className="comic-generator">
      <div className="actions">
        <button
          className="primary"
          onClick={() => requestComic(false)}
          disabled={isLoading}
        >
          {isLoading && !currentComic ? 'Generating…' : 'Generate comic'}
        </button>
        <button
          className="secondary"
          onClick={() => requestComic(true)}
          disabled={!currentComic || isLoading}
        >
          Generate another
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="comic-stage">
        {currentComic ? (
          <img
            src={currentComic.displayUrl || currentComic.imageUrl}
            alt={`Generated comic ${currentComic.metadata?.title ?? ''}`}
            loading="lazy"
          />
        ) : (
          <div className="comic-stage__placeholder">
            <strong>No comic yet</strong>
            <span>Tap “Generate comic” to witness the chaos.</span>
          </div>
        )}
        {isLoading ? (
          <div className="loading-panel" aria-live="assertive">
            <div className="gears" aria-hidden="true">
              <span className="gear" />
              <span className="gear" />
              <span className="gear" />
            </div>
            <p>Summoning panels…</p>
          </div>
        ) : null}
      </div>

      {currentComic ? (
        <div className="comic-details">
          <div className="comic-details__meta">
            <span className="chip">#{currentComic.comicNumber ?? '—'}</span>
            {currentComic.metadata?.title ? (
              <span className="chip">{currentComic.metadata.title}</span>
            ) : null}
            {currentComic.metadata?.talkingChars ? (
              <span className="chip">Chars: {currentComic.metadata.talkingChars}</span>
            ) : null}
            {currentComic.metadata?.background ? (
              <span className="chip">BG: {currentComic.metadata.background}</span>
            ) : null}
          </div>
          <div className="caption-block">
            <strong>Caption</strong>
            <p>{currentComic.caption}</p>
            {currentComic.metadata?.seed ? (
              <p>
                <small>Seed phrase: {currentComic.metadata.seed}</small>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {history.length ? (
        <div className="history">
          <h3>Previous pulls</h3>
          <div className="history-grid">
            {history.map((item) => (
              <button
                key={item.id}
                className="history-card"
                onClick={() => handleRecall(item)}
                title="Click to view this comic again"
              >
                <img
                  src={item.displayUrl || item.imageUrl}
                  alt="Historic comic"
                  loading="lazy"
                />
                <small>
                  #{item.comicNumber ?? '—'} · {item.metadata?.title ?? 'Untitled'}
                </small>
                <small>{formatTimestamp(item.generatedAt)}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
