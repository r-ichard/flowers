import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowerDetailPanel } from './FlowerDetailPanel';
import type { Flower } from '../flowers/parseFlower';

const flower: Flower = {
  id: 'rose',
  name: 'Rose',
  author: 'Jane Doe',
  model: 'claude-opus-4-8',
  prompt: 'Draw a rose seen from above',
  comment: 'Two attempts; the first had a stem.',
  github: 'janedoe',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>',
};

describe('FlowerDetailPanel', () => {
  it('shows the benchmark details: name, model, prompt and the author comment', () => {
    render(<FlowerDetailPanel flower={flower} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Rose' })).toBeInTheDocument();
    expect(screen.getByText('claude-opus-4-8')).toBeInTheDocument();
    expect(screen.getByText('Draw a rose seen from above')).toBeInTheDocument();
    expect(screen.getByText('Two attempts; the first had a stem.')).toBeInTheDocument();
  });

  it('links the author to their github profile when a handle is given', () => {
    render(<FlowerDetailPanel flower={flower} onClose={() => {}} />);
    expect(screen.getByRole('link', { name: 'Jane Doe' })).toHaveAttribute(
      'href',
      'https://github.com/janedoe',
    );
  });

  it('shows the author as plain text when no github handle is given', () => {
    const { github: _github, ...noGithub } = flower;
    render(<FlowerDetailPanel flower={noGithub} onClose={() => {}} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Jane Doe' })).toBeNull();
  });

  it('is an accessible dialog labelled by the flower name', () => {
    render(<FlowerDetailPanel flower={flower} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /Rose/ })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<FlowerDetailPanel flower={flower} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<FlowerDetailPanel flower={flower} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
