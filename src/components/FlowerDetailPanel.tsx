import { useEffect, useRef } from 'react';
import type { Flower } from '../flowers/parseFlower';
import { profileUrl } from './profileUrl';

// A left-side panel (full-screen on mobile) with the flower shown big and its
// experiment data. Rendered only while a flower is selected, so mounting it is
// the "open" and unmounting is the "close". Accessible dialog: labelled by the
// flower name, closes on Escape, moves focus in on open and restores it on close.
export function FlowerDetailPanel({ flower, onClose }: { flower: Flower; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = `flower-${flower.id}-name`;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <aside
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="panel__close"
          onClick={onClose}
          aria-label="Close details"
        >
          &times;
        </button>

        <div
          className="panel__flower"
          role="img"
          aria-label={flower.name}
          dangerouslySetInnerHTML={{ __html: flower.svg }}
        />

        <h2 id={headingId} className="panel__name">
          {flower.name}
        </h2>

        <dl className="panel__meta">
          <div className="panel__row">
            <dt>Model</dt>
            <dd className="panel__model">{flower.model}</dd>
          </div>
          <div className="panel__row">
            <dt>Author</dt>
            <dd>
              {flower.github ? (
                <a href={profileUrl(flower.github)} target="_blank" rel="noreferrer">
                  {flower.author}
                </a>
              ) : (
                flower.author
              )}
            </dd>
          </div>
          <div className="panel__row">
            <dt>Author's notes on the process</dt>
            <dd className="panel__note">{flower.comment}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
