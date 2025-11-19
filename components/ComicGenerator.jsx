'use client';

import { useState, useCallback, useEffect } from 'react';

const HISTORY_LIMIT = 8;
const CONSOLE_LABELS = [
  'Panel Transmission Deck',
  'Dream Drive Switchboard',
  'Somnolog Courier Hub',
  'Side Effect Dispatch Bay',
  'Hypersomnia Relay Booth',
  'Cosmic Intake Terminal'
];

const PLACEHOLDER_LINES = [
  'Tap “Generate comic” to witness the chaos.',
  'Press “Generate comic” to log another symptom.',
  'Deploy “Generate comic” and brace for an alien dispatch.',
  'Trigger “Generate comic” to ping the Hypersomnia courier.'
];

const LOADING_LINES = [
  'Summoning panels…',
  'Routing side effects through the modem…',
  'Syncing with the alien mailroom…',
  'Scrambling captions from hyperspace…'
];

const getRandomValue = (list, exclude) => {
  const pool = exclude ? list.filter((entry) => entry !== exclude) : list;
  const source = pool.length ? pool : list;
  return source[Math.floor(Math.random() * source.length)];
};

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
  const [consoleLabel, setConsoleLabel] = useState(CONSOLE_LABELS[0]);
  const [placeholderLine, setPlaceholderLine] = useState(PLACEHOLDER_LINES[0]);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [lastPull, setLastPull] = useState(null);

  useEffect(() => {
    setConsoleLabel((prev) => getRandomValue(CONSOLE_LABELS, prev));
    setPlaceholderLine((prev) => getRandomValue(PLACEHOLDER_LINES, prev));
  }, []);

  useEffect(() => {
    let active = true;

    const loadLastPull = async () => {
      try {
        const response = await fetch('/api/last-pull');
        if (!response.ok) return;
        const data = await response.json();
        if (active && data?.lastPull) {
          setLastPull(data.lastPull);
        }
      } catch (err) {
        console.error('Unable to load last pull timestamp', err);
      }
    };

    loadLastPull();

    return () => {
      active = false;
    };
  }, []);

  const statusPills = [
    { label: 'Console status', value: isLoading ? 'Brewing new strip' : 'Idle' },
    { label: 'History slots', value: `${history.length}/${HISTORY_LIMIT}` },
    {
      label: 'Last pull',
      value: lastPull ? formatTimestamp(lastPull) : 'Awaiting signal'
    }
  ];

  const requestComic = useCallback(
    async (preserveCurrent = false) => {
      setError(null);
      setIsLoading(true);
      setConsoleLabel((prev) => getRandomValue(CONSOLE_LABELS, prev));
      setLoadingLine((prev) => getRandomValue(LOADING_LINES, prev));
      if (!currentComic) {
        setPlaceholderLine((prev) => getRandomValue(PLACEHOLDER_LINES, prev));
      }
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
        setLastPull(normalized.generatedAt);
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
      <header className="console-header">
        <div>
          <p className="console-eyebrow">Side Effect Control</p>
          <h2>{consoleLabel}</h2>
          <p className="console-subtitle">
            Tap the console to capture a new dream-state comic. Each pull mirrors the legacy
            Hypersomnia drive rituals.
          </p>
        </div>
        <div className="console-status">
          {statusPills.map((pill) => (
            <div key={pill.label} className="console-status__item">
              <small>{pill.label}</small>
              <strong>{pill.value}</strong>
            </div>
          ))}
        </div>
      </header>

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
            <span>{placeholderLine}</span>
          </div>
        )}
        {isLoading ? (
          <div className="loading-panel" aria-live="assertive">
            <div className="gears" aria-hidden="true">
              <span className="gear" />
              <span className="gear" />
              <span className="gear" />
            </div>
            <p>{loadingLine}</p>
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
