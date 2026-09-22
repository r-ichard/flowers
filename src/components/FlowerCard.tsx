import type { Flower } from '../flowers/parseFlower';

// A flower in the field: a clickable tile that opens the detail panel, with a
// subtle "author · model" caption beneath. The process notes stay in
// the panel — the caption is just enough to scan the field by who and which model.
export function FlowerCard({
  flower,
  onSelect,
}: {
  flower: Flower;
  onSelect: (flower: Flower) => void;
}) {
  return (
    <div className="flower-card">
      <button
        type="button"
        className="flower-card__button"
        onClick={() => onSelect(flower)}
        aria-label={`${flower.name}, by ${flower.author} — open details`}
      >
        <span
          className="flower-card__stage"
          // SVG is repo-controlled and validated by parseFlower (rejects <script>,
          // inline handlers, javascript: URIs) plus PR review before it ever ships.
          dangerouslySetInnerHTML={{ __html: flower.svg }}
        />
      </button>
      <p className="flower-card__caption">
        <span className="flower-card__author">{flower.author}</span>
        <span className="flower-card__model">{flower.model}</span>
      </p>
    </div>
  );
}
