import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowerCard } from './FlowerCard';
import type { Flower } from '../flowers/parseFlower';

const flower: Flower = {
  id: 'rose',
  name: 'Rose',
  author: 'Jane Doe',
  model: 'claude-opus-4-8',
  prompt: 'Draw a rose',
  comment: 'One shot.',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>',
};

describe('FlowerCard', () => {
  it('renders the flower as a button that inlines the svg', () => {
    render(<FlowerCard flower={flower} onSelect={() => {}} />);
    const button = screen.getByRole('button', { name: /Rose/ });
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('calls onSelect with the flower when clicked', async () => {
    const onSelect = vi.fn();
    render(<FlowerCard flower={flower} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Rose/ }));
    expect(onSelect).toHaveBeenCalledWith(flower);
  });

  it('shows a subtle author and model caption beneath the flower', () => {
    render(<FlowerCard flower={flower} onSelect={() => {}} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('claude-opus-4-8')).toBeInTheDocument();
  });

  it('does not display the prompt in the field (that stays in the panel)', () => {
    render(<FlowerCard flower={flower} onSelect={() => {}} />);
    expect(screen.queryByText('Draw a rose')).toBeNull();
  });
});
