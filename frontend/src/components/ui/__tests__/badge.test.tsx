import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge tone="green">Completed</Badge>);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('applies the tone-specific classes', () => {
    render(<Badge tone="red">High</Badge>);
    expect(screen.getByText('High')).toHaveClass('bg-red-bg', 'text-red-fg');
  });

  it('renders a status dot only when dot is true', () => {
    const { container: withDot } = render(
      <Badge tone="amber" dot>
        Pending
      </Badge>,
    );
    expect(withDot.querySelector('.rounded-full.bg-current')).not.toBeNull();

    const { container: withoutDot } = render(<Badge tone="amber">Pending</Badge>);
    expect(withoutDot.querySelector('.rounded-full.bg-current')).toBeNull();
  });
});
