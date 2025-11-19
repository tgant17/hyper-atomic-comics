import ComicGenerator from '@/components/ComicGenerator';

export default function HomePage() {
  return (
    <main className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">Hypersomnia Labs</p>
          <h1>Dream Drive Console</h1>
          <p className="lede">
            Generate a brand-new four panel comic whenever inspiration (or curiosity) strikes.
          </p>
        </div>
      </header>
      <ComicGenerator />
    </main>
  );
}
