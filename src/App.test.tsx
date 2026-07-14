import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import type { LoadResult } from './flowers/loader';

const result: LoadResult = {
  flowers: [
    {
      id: 'iris',
      name: 'Iris',
      author: 'Sam',
      model: 'claude-sonnet-5',
      prompt: 'Draw an iris',
      comment: 'Worked on the first try.',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>',
    },
  ],
  invalid: [],
};

describe('App', () => {
  it('renders the field title', () => {
    render(<App result={result} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders a clickable flower for each entry', () => {
    render(<App result={result} />);
    expect(screen.getByRole('button', { name: /Iris/ })).toBeInTheDocument();
  });

  it('links About to the project page', () => {
    render(<App result={result} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      'https://r-ichard.com/flowers',
    );
  });

  it('opens the detail panel when a flower is clicked and closes it again', async () => {
    render(<App result={result} />);
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /Iris/ }));
    const dialog = screen.getByRole('dialog', { name: /Iris/ });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('claude-sonnet-5')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
