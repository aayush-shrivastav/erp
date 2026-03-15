import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge Component', () => {
  test('renders with children correctly', () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  test('applies correct class for different variants', () => {
    const { rerender } = render(<Badge variant="active">Success</Badge>);
    let badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-green-100');

    rerender(<Badge variant="failed">Error</Badge>);
    badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-100');

    rerender(<Badge variant="pending">Warning</Badge>);
    badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-amber-100');
  });

  test('defaults to neutral variant for unknown variants', () => {
    render(<Badge variant="unknown">Unknown</Badge>);
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveClass('bg-slate-100');
  });
});
