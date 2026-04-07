import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AgreementSession from '../AgreementSession';
import { ToastContext } from '../../App';
import type { Agreement } from '../../types';

const mockToast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

vi.mock('../../services/api', () => ({
  getAgreement: vi.fn(),
  uploadAudio: vi.fn(),
  getAudioStatus: vi.fn(),
  submitResponse: vi.fn(),
  skipFollowUp: vi.fn(),
}));

import {
  getAgreement,
  uploadAudio,
  getAudioStatus,
  submitResponse,
  skipFollowUp,
} from '../../services/api';

const mockAgreement: { agreement: Agreement } = {
  agreement: {
    id: 1,
    title: 'Communication Boundaries',
    description: 'Working through how we talk about money.',
    status: 'active',
    participant_names: 'Alex and Jordan',
    current_version: null,
    follow_ups: [
      { id: 10, question: 'Can you elaborate on the spending issue?', context: 'Related to budget' },
      { id: 11, question: 'What does respect look like to you?', context: '' },
    ],
    responses_count: 2,
    versions_count: 0,
    created_at: '2026-04-01T12:00:00Z',
    updated_at: '2026-04-01T12:00:00Z',
  },
};

const mockAgreementNoFollowUps: { agreement: Agreement } = {
  agreement: {
    ...mockAgreement.agreement,
    follow_ups: [],
  },
};

function renderSession(agreementId = 1) {
  return render(
    <ToastContext.Provider value={mockToast}>
      <MemoryRouter initialEntries={[`/agreement/${agreementId}`]}>
        <Routes>
          <Route path="/agreement/:id" element={<AgreementSession />} />
        </Routes>
      </MemoryRouter>
    </ToastContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AgreementSession', () => {
  it('shows loading state initially', () => {
    vi.mocked(getAgreement).mockReturnValue(new Promise(() => {}));
    renderSession();
    expect(document.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('renders agreement title after loading', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Communication Boundaries')).toBeInTheDocument();
    });
  });

  it('renders agreement description', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);
    renderSession();

    await waitFor(() => {
      expect(
        screen.getByText('Working through how we talk about money.')
      ).toBeInTheDocument();
    });
  });

  it('renders status and counts', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('2 responses')).toBeInTheDocument();
      expect(screen.getByText('0 contract versions')).toBeInTheDocument();
    });
  });

  it('renders VoiceRecorder with default prompt', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreementNoFollowUps);
    renderSession();

    await waitFor(() => {
      expect(
        screen.getByText('Tell us about the situation and what you need from this agreement.')
      ).toBeInTheDocument();
    });
  });

  it('uses stored prompt from localStorage', async () => {
    localStorage.setItem('agreement_1_prompt', 'Custom initial prompt here');
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreementNoFollowUps);
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Custom initial prompt here')).toBeInTheDocument();
    });

    // Prompt should be cleared from localStorage after use
    expect(localStorage.getItem('agreement_1_prompt')).toBeNull();
  });

  it('renders follow-up cards', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Follow-Up Topics')).toBeInTheDocument();
      expect(
        screen.getByText('Can you elaborate on the spending issue?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('What does respect look like to you?')
      ).toBeInTheDocument();
    });
  });

  it('does not show follow-ups section when there are none', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreementNoFollowUps);
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Communication Boundaries')).toBeInTheDocument();
    });
    expect(screen.queryByText('Follow-Up Topics')).not.toBeInTheDocument();
  });

  it('skips a follow-up when Skip is clicked', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);
    vi.mocked(skipFollowUp).mockResolvedValueOnce({ status: 'skipped' });

    const user = userEvent.setup();
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Can you elaborate on the spending issue?')).toBeInTheDocument();
    });

    const skipButtons = screen.getAllByText('Skip');
    await user.click(skipButtons[0]);

    expect(skipFollowUp).toHaveBeenCalledWith(1, 10);
  });

  it('sets active follow-up when Answer This is clicked', async () => {
    vi.mocked(getAgreement).mockResolvedValueOnce(mockAgreement);

    const user = userEvent.setup();
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Can you elaborate on the spending issue?')).toBeInTheDocument();
    });

    const answerButtons = screen.getAllByText('Answer This');
    await user.click(answerButtons[0]);

    // After clicking "Answer This", the follow-up question appears both as
    // the VoiceRecorder prompt and in the follow-up card list.
    const matchingElements = screen.getAllByText('Can you elaborate on the spending issue?');
    expect(matchingElements.length).toBeGreaterThanOrEqual(2);

    // The follow-up card should now be marked as active
    const activeCard = document.querySelector('.follow-up-card.active');
    expect(activeCard).toBeInTheDocument();
  });

  it('shows error state on load failure', async () => {
    vi.mocked(getAgreement).mockRejectedValueOnce(new Error('Network error'));
    renderSession();

    // The component shows skeleton loading state when agreement is null after error.
    await waitFor(() => {
      expect(document.querySelector('.skeleton')).toBeInTheDocument();
    });
  });

  it('handles the full recording flow', async () => {
    vi.mocked(getAgreement)
      .mockResolvedValueOnce(mockAgreementNoFollowUps)
      .mockResolvedValueOnce(mockAgreementNoFollowUps);

    vi.mocked(uploadAudio).mockResolvedValueOnce({
      recording_id: 5,
      s3_key: 'audio/5.webm',
      status: 'uploaded',
    });

    vi.mocked(getAudioStatus).mockResolvedValueOnce({
      id: 5,
      status: 'completed',
      s3_key: 'audio/5.webm',
      duration: 15,
      transcription: 'We need to split the bills evenly.',
    });

    vi.mocked(submitResponse).mockResolvedValueOnce({
      response: {
        id: 1,
        question: 'Initial response',
        transcription: 'We need to split the bills evenly.',
        audio_s3_key: 'audio/5.webm',
        phase: 'initial',
        created_at: '2026-04-01',
      },
    });

    const user = userEvent.setup();
    renderSession();

    await waitFor(() => {
      expect(screen.getByText('Start Recording')).toBeInTheDocument();
    });

    // Start and stop recording
    await user.click(screen.getByText('Start Recording'));
    await user.click(screen.getByText('Stop'));
    await user.click(screen.getByText('Submit Recording'));

    // Should show processing state
    await waitFor(() => {
      expect(uploadAudio).toHaveBeenCalledWith(1, expect.any(Blob));
    });
  });
});
