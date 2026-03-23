import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FollowUpCard from '../FollowUpCard';
import type { FollowUp } from '../../types';

const mockFollowUp: FollowUp = {
  id: 1,
  question: 'Can you be more specific about the chores?',
  context: 'You mentioned household responsibilities but didn\'t detail them.',
};

const mockFollowUpNoContext: FollowUp = {
  id: 2,
  question: 'How will you handle disagreements?',
  context: '',
};

describe('FollowUpCard', () => {
  it('renders the question text', () => {
    render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={false}
      />
    );
    expect(
      screen.getByText('Can you be more specific about the chores?')
    ).toBeInTheDocument();
  });

  it('renders context when provided', () => {
    render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={false}
      />
    );
    expect(
      screen.getByText(/You mentioned household responsibilities/)
    ).toBeInTheDocument();
  });

  it('does not render context when empty', () => {
    render(
      <FollowUpCard
        followUp={mockFollowUpNoContext}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={false}
      />
    );
    expect(screen.queryByText(/You mentioned/)).not.toBeInTheDocument();
  });

  it('renders Answer and Skip buttons', () => {
    render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={false}
      />
    );
    expect(screen.getByText('Answer This')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('calls onAnswer with follow-up id when Answer clicked', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();

    render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={onAnswer}
        onSkip={vi.fn()}
        isActive={false}
      />
    );

    await user.click(screen.getByText('Answer This'));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('calls onSkip with follow-up id when Skip clicked', async () => {
    const onSkip = vi.fn();
    const user = userEvent.setup();

    render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={onSkip}
        isActive={false}
      />
    );

    await user.click(screen.getByText('Skip'));
    expect(onSkip).toHaveBeenCalledWith(1);
  });

  it('applies active class when isActive is true', () => {
    const { container } = render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={true}
      />
    );
    expect(container.querySelector('.follow-up-card.active')).toBeInTheDocument();
  });

  it('does not apply active class when isActive is false', () => {
    const { container } = render(
      <FollowUpCard
        followUp={mockFollowUp}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        isActive={false}
      />
    );
    expect(container.querySelector('.follow-up-card.active')).not.toBeInTheDocument();
  });
});
