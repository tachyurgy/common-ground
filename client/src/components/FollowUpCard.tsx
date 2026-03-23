import type { FollowUp } from '../types';

interface FollowUpCardProps {
  followUp: FollowUp;
  onAnswer: (followUpId: number) => void;
  onSkip: (followUpId: number) => void;
  isActive: boolean;
}

export default function FollowUpCard({
  followUp,
  onAnswer,
  onSkip,
  isActive,
}: FollowUpCardProps) {
  return (
    <div className={`follow-up-card ${isActive ? 'active' : ''}`}>
      <p className="follow-up-question">{followUp.question}</p>
      {followUp.context && (
        <p className="follow-up-context">{followUp.context}</p>
      )}
      <div className="follow-up-actions">
        <button className="btn btn-primary" onClick={() => onAnswer(followUp.id)}>
          Answer This
        </button>
        <button className="btn btn-ghost" onClick={() => onSkip(followUp.id)}>
          Skip
        </button>
      </div>
    </div>
  );
}
