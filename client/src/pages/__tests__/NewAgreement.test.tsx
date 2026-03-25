import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewAgreement from '../NewAgreement';

// Mock the api module
vi.mock('../../services/api', () => ({
  createAgreement: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { createAgreement } from '../../services/api';

function renderNewAgreement() {
  return render(
    <MemoryRouter>
      <NewAgreement />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NewAgreement', () => {
  it('renders the page heading', () => {
    renderNewAgreement();
    expect(screen.getByText('Start a New Agreement')).toBeInTheDocument();
  });

  it('renders the form with all fields', () => {
    renderNewAgreement();
    expect(screen.getByLabelText('Agreement Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Participants (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderNewAgreement();
    expect(screen.getByText('Begin Agreement Session')).toBeInTheDocument();
  });

  it('disables submit when title is empty', () => {
    renderNewAgreement();
    expect(screen.getByText('Begin Agreement Session')).toBeDisabled();
  });

  it('enables submit when title is entered', async () => {
    const user = userEvent.setup();
    renderNewAgreement();

    await user.type(screen.getByLabelText('Agreement Title'), 'Chore Schedule');
    expect(screen.getByText('Begin Agreement Session')).toBeEnabled();
  });

  it('submits form and navigates on success', async () => {
    const user = userEvent.setup();
    vi.mocked(createAgreement).mockResolvedValueOnce({
      agreement: {
        id: 99,
        title: 'Chore Schedule',
        description: '',
        status: 'active',
        participant_names: 'Alex and Jordan',
        current_version: null,
        follow_ups: [],
        responses_count: 0,
        versions_count: 0,
        created_at: '2026-04-01',
        updated_at: '2026-04-01',
      },
      initial_prompt: 'Tell me about your household situation.',
    });

    renderNewAgreement();

    await user.type(screen.getByLabelText('Agreement Title'), 'Chore Schedule');
    await user.type(screen.getByLabelText('Participants (optional)'), 'Alex and Jordan');
    await user.type(
      screen.getByLabelText('Description (optional)'),
      'We need to split chores fairly.'
    );
    await user.click(screen.getByText('Begin Agreement Session'));

    await waitFor(() => {
      expect(createAgreement).toHaveBeenCalledWith({
        title: 'Chore Schedule',
        description: 'We need to split chores fairly.',
        participant_names: 'Alex and Jordan',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/agreement/99');
    });

    expect(localStorage.getItem('currentAgreementId')).toBe('99');
    expect(localStorage.getItem('agreement_99_prompt')).toBe(
      'Tell me about your household situation.'
    );
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(createAgreement).mockReturnValueOnce(promise as ReturnType<typeof createAgreement>);

    renderNewAgreement();

    await user.type(screen.getByLabelText('Agreement Title'), 'Test');
    await user.click(screen.getByText('Begin Agreement Session'));

    expect(screen.getByText('Creating...')).toBeInTheDocument();

    // Resolve the promise to clean up
    resolvePromise!({
      agreement: { id: 1 },
      initial_prompt: 'prompt',
    });
  });

  it('displays error on API failure', async () => {
    const user = userEvent.setup();
    vi.mocked(createAgreement).mockRejectedValueOnce(new Error('Server error'));

    renderNewAgreement();

    await user.type(screen.getByLabelText('Agreement Title'), 'Test');
    await user.click(screen.getByText('Begin Agreement Session'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('does not submit when only whitespace in title', async () => {
    const user = userEvent.setup();
    renderNewAgreement();

    const titleInput = screen.getByLabelText('Agreement Title');
    await user.type(titleInput, '   ');
    expect(screen.getByText('Begin Agreement Session')).toBeDisabled();
  });

  it('sends undefined for empty optional fields', async () => {
    const user = userEvent.setup();
    vi.mocked(createAgreement).mockResolvedValueOnce({
      agreement: {
        id: 1,
        title: 'Test',
        description: '',
        status: 'active',
        participant_names: '',
        current_version: null,
        follow_ups: [],
        responses_count: 0,
        versions_count: 0,
        created_at: '2026-04-01',
        updated_at: '2026-04-01',
      },
      initial_prompt: 'prompt',
    });

    renderNewAgreement();

    await user.type(screen.getByLabelText('Agreement Title'), 'Test');
    await user.click(screen.getByText('Begin Agreement Session'));

    await waitFor(() => {
      expect(createAgreement).toHaveBeenCalledWith({
        title: 'Test',
        description: undefined,
        participant_names: undefined,
      });
    });
  });
});
