import type { Flower } from '../flowers/parseFlower';

// A plate in the field guide: a clickable tile that opens the detail panel,
// captioned like a figure in a science book — "Fig. 3", the flower's name, then
// who ran it and on which model. The process notes stay in the panel; the
// caption is just enough to scan the field.
export function FlowerCard({
  flower,
  figure,
  onSelect,
}: {
  flower: Flower;
  figure: number;
  onSelect: (flower: Flower) => void;
}) {
  return (
    <figure className="flower-card">
      <button
        type="button"
        className="flower-card__button"
        onClick={() => onSelect(flower)}
        aria-label={`Fig. ${figure}, ${flower.name}, by ${flower.author} — open details`}
      >
        <span
          className="flower-card__stage"
          // SVG is repo-controlled and validated by parseFlower (rejects <script>,
          // inline handlers, javascript: URIs) plus PR review before it ever ships.
          dangerouslySetInnerHTML={{ __html: flower.svg }}
        />
      </button>
      <figcaption className="flower-card__caption">
        <span className="flower-card__figure">Fig. {figure}</span>
        <span className="flower-card__name">{flower.name}</span>
        <span className="flower-card__credit">
          <span className="flower-card__author">{flower.author}</span>
          <span className="flower-card__model">{flower.model}</span>
        </span>
      </figcaption>
    </figure>
  );
}
