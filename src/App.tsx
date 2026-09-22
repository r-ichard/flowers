import { useCallback, useState } from 'react';
import { loadFlowers, type LoadResult } from './flowers/loader';
import { FlowerGrid } from './components/FlowerGrid';
import { FlowerDetailPanel } from './components/FlowerDetailPanel';
import type { Flower } from './flowers/parseFlower';
import './App.css';

const CONTRIBUTE_URL = 'https://github.com/r-ichard/flowers/blob/main/CONTRIBUTING.md';
const ABOUT_URL = 'https://r-ichard.com/flowers';

// Loaded once at import; injectable for tests (dependency injection seam).
const loaded = loadFlowers();

export function App({ result = loaded }: { result?: LoadResult }) {
  const [selected, setSelected] = useState<Flower | null>(null);
  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <div className="field">
      <header className="field__header">
        <h1 className="field__title">AI Field of Flowers</h1>
        <p className="field__subtitle">
          A field guide to flowers drawn by language models. Every plate is one SVG; click it for
          the model and the author's notes on the process.
        </p>
      </header>

      <main>
        <FlowerGrid flowers={result.flowers} onSelect={setSelected} />

        <p className="contribute">
          <a href={CONTRIBUTE_URL} target="_blank" rel="noreferrer">
            Add a flower
          </a>
        </p>
      </main>

      <footer className="field__footer">
        <a href={ABOUT_URL} target="_blank" rel="noreferrer">
          About
        </a>
      </footer>

      {selected && (
        <FlowerDetailPanel
          flower={selected}
          figure={result.flowers.indexOf(selected) + 1}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
