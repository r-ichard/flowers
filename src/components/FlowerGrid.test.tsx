import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowerGrid } from './FlowerGrid';
import type { Flower } from '../flowers/parseFlower';

const flower = (id: string, name: string): Flower => ({
  id,
  name,
  author: 'Sam',
  model: 'claude-opus-4-8',
  comment: 'c',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>',
});

describe('FlowerGrid', () => {
  it('renders one clickable flower per entry', () => {
    render(
      <FlowerGrid flowers={[flower('a', 'Aster'), flower('b', 'Bluebell')]} onSelect={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /Aster/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bluebell/ })).toBeInTheDocument();
  });

  it('numbers the plates from one in field order', () => {
    render(
      <FlowerGrid flowers={[flower('a', 'Aster'), flower('b', 'Bluebell')]} onSelect={() => {}} />,
    );
    expect(screen.getByText('Fig. 1')).toBeInTheDocument();
    expect(screen.getByText('Fig. 2')).toBeInTheDocument();
  });

  it('calls onSelect with the clicked flower', async () => {
    const onSelect = vi.fn();
    const aster = flower('a', 'Aster');
    render(<FlowerGrid flowers={[aster]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Aster/ }));
    expect(onSelect).toHaveBeenCalledWith(aster);
  });

  it('shows an empty-field message when there are no flowers', () => {
    render(<FlowerGrid flowers={[]} onSelect={() => {}} />);
    expect(screen.getByText(/field is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
