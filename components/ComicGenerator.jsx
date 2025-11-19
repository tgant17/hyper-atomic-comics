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

const ADJECTIVE_OPTIONS = [
  'Neon',
  'Drowsy',
  'Hypnotic',
  'Cosmic',
  'Velvet',
  'Lucid',
  'Electric',
  'Rusty',
  'Iridescent',
  'Somber'
];

const NOUN_OPTIONS = [
  'Astronaut',
  'Lighthouse',
  'Chrononaut',
  'Orb',
  'Marshmallow',
  'Specter',
  'Synth',
  'Courier',
  'Cactus',
  'Pilgrim'
];

const CHARACTER_OPTIONS = [
  { id: 'a', prefix: 'alien', name: 'Alien Pilot', image: '/assets/characters/alien.png' },
  { id: 'c', prefix: 'campfire', name: 'Campfire Sage', image: '/assets/characters/campfire.png' },
  { id: 'f', prefix: 'foggy', name: 'Foggy Friend', image: '/assets/characters/foggy.png' },
  { id: 'r', prefix: 'robot', name: 'Robot Medic', image: '/assets/characters/robot.png' },
  { id: 't', prefix: 'toast-ghost', name: 'Toast Ghost', image: '/assets/characters/toast-ghost.png' }
];

const DEFAULT_CHARACTER_IMAGES = CHARACTER_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.image;
  return acc;
}, {});

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
  const [totalComics, setTotalComics] = useState(null);
  const [adjective, setAdjective] = useState('');
  const [noun, setNoun] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState(() => new Set());
  const [characterImages, setCharacterImages] = useState(DEFAULT_CHARACTER_IMAGES);
  const [showControls, setShowControls] = useState(false);

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
        if (active) {
          if (data?.lastPull) {
            setLastPull(data.lastPull);
          }
          if (typeof data?.comicCount === 'number') {
            setTotalComics(data.comicCount);
          }
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

  useEffect(() => {
    let active = true;

    const loadCharacterImages = async () => {
      try {
        const response = await fetch('/api/character-pfps');
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data?.images) return;

        setCharacterImages((prev) => {
          const next = { ...prev };
          CHARACTER_OPTIONS.forEach((option) => {
            const files = data.images[option.id];
            if (Array.isArray(files) && files.length) {
              next[option.id] = getRandomValue(files);
            }
          });
          return next;
        });
      } catch (error) {
        console.error('Unable to load character pfps', error);
      }
    };

    loadCharacterImages();

    return () => {
      active = false;
    };
  }, []);

  const statusPills = [
    { label: 'Console status', value: isLoading ? 'Brewing new strip' : 'Idle' },
    { label: 'History slots', value: `${history.length}/${HISTORY_LIMIT}` },
    { label: 'Last pull', value: lastPull ? formatTimestamp(lastPull) : 'Awaiting signal' },
    { label: 'Comic count', value: totalComics ?? '—' }
  ];

  const toggleCharacter = (id) => {
    setSelectedCharacters((prev) => {
      const clone = new Set(prev);
      if (clone.has(id)) {
        clone.delete(id);
      } else {
        clone.add(id);
      }
      return clone;
    });
  };

  const handleResetInputs = () => {
    setAdjective('');
    setNoun('');
    setSelectedCharacters(new Set());
    setPlaceholderLine((prev) => getRandomValue(PLACEHOLDER_LINES, prev));
  };

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

        const trimmedAdjective = adjective.trim();
        const trimmedNoun = noun.trim();
        const hasCustomSeed = trimmedAdjective && trimmedNoun;
        const characterList = Array.from(selectedCharacters);

        const requestBody = {
          seedPhrase: hasCustomSeed
            ? { adjective: trimmedAdjective, noun: trimmedNoun }
            : undefined,
          characters: characterList.length ? characterList : undefined
        };

        const response = await fetch('/api/generate-comic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
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
    [adjective, currentComic, noun, selectedCharacters]
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

      <div className="control-toggle">
        <span>{showControls ? 'Hide controls' : 'Control the input'}</span>
        <button
          type="button"
          aria-label="Toggle controls"
          className={showControls ? 'is-open' : ''}
          onClick={() => setShowControls((prev) => !prev)}
        >
          <span>›</span>
        </button>
      </div>

      {showControls ? (
        <section className="console-inputs">
          <div className="seed-grid">
            <label className="field">
              <span>Adjective</span>
              <div className="field__combo">
                <input
                  type="text"
                  value={adjective}
                  onChange={(e) => setAdjective(e.target.value)}
                  placeholder="Neon"
                  autoComplete="off"
                />
                <select
                  value={ADJECTIVE_OPTIONS.includes(adjective.trim()) ? adjective.trim() : ''}
                  onChange={(e) => setAdjective(e.target.value)}
                >
                  <option value="">Pick from list</option>
                  {ADJECTIVE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="field">
              <span>Noun</span>
              <div className="field__combo">
                <input
                  type="text"
                  value={noun}
                  onChange={(e) => setNoun(e.target.value)}
                  placeholder="Astronaut"
                  autoComplete="off"
                />
                <select
                  value={NOUN_OPTIONS.includes(noun.trim()) ? noun.trim() : ''}
                  onChange={(e) => setNoun(e.target.value)}
                >
                  <option value="">Pick from list</option>
                  {NOUN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <div className="character-grid">
            {CHARACTER_OPTIONS.map((option) => {
              const isActive = selectedCharacters.has(option.id);
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`character-card${isActive ? ' is-active' : ''}`}
                  onClick={() => toggleCharacter(option.id)}
                >
                  <img
                    src={characterImages[option.id] ?? option.image}
                    alt={`${option.name} placeholder`}
                  />
                  <span>{option.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

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
        {currentComic ? (
          <button type="button" className="ghost" onClick={handleResetInputs}>
            Refresh inputs
          </button>
        ) : null}
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
