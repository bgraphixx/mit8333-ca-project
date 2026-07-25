import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RequestListRow } from '@/components/requests/RequestListRow';
import type { ServiceRequest } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const request: ServiceRequest = {
  id: 42,
  title: 'Broken window in room 204',
  description: 'The window latch is broken.',
  categoryId: 1,
  category: 'Furniture',
  priority: 'Medium',
  status: 'Pending',
  evidenceUrl: null,
  createdAt: '2026-07-25T12:41:00Z',
  updatedAt: '2026-07-25T12:41:00Z',
  submittedById: 3,
  submitterName: 'Ada Obi',
  assignedOfficerId: null,
  assignedOfficerName: null,
};

describe('RequestListRow', () => {
  it('renders title, id, category, priority, and status', () => {
    render(
      <MemoryRouter>
        <RequestListRow request={request} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Broken window in room 204')).toBeInTheDocument();
    expect(screen.getByText('REQ-42')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('navigates to the request detail page when clicked', async () => {
    render(
      <MemoryRouter>
        <RequestListRow request={request} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByText('Broken window in room 204'));
    expect(mockNavigate).toHaveBeenCalledWith('/requests/42');
  });
});
