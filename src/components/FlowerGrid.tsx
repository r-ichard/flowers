import type { Flower } from '../flowers/parseFlower';
import { FlowerCard } from './FlowerCard';

// Stagger the sway so the field ripples rather than swaying in unison. The CSS
// reads this per-card delay from a custom property (see App.css).
const SWAY_STAGGER_SECONDS = 0.35;

export function FlowerGrid({
  flowers,
  onSelect,
}: {
  flowers: Flower[];
  onSelect: (flower: Flower) => void;
}) {
  if (flowers.length === 0) {
    return (
      <p className="empty-field">
        The field is empty. Be the first to plant a flower — see CONTRIBUTING.md.
      </p>
    );
  }

  return (
    <ul className="flower-grid" role="list">
      {flowers.map((flower, index) => (
        <li
          key={flower.id}
          className="flower-grid__cell"
          style={{ '--sway-delay': `${index * SWAY_STAGGER_SECONDS}s` } as React.CSSProperties}
        >
          <FlowerCard flower={flower} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
