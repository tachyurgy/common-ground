import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceRecorder from '../VoiceRecorder';

describe('VoiceRecorder', () => {
  it('renders with a prompt', () => {
    render(
      <VoiceRecorder onRecordingComplete={vi.fn()} prompt="Tell us about yourself" />
    );
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });

  it('renders start recording button initially', () => {
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('disables start button when disabled prop is true', () => {
    render(<VoiceRecorder onRecordingComplete={vi.fn()} disabled />);
    expect(screen.getByText('Start Recording')).toBeDisabled();
  });

  it('shows recording controls after starting', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

    await user.click(screen.getByText('Start Recording'));

    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.queryByText('Start Recording')).not.toBeInTheDocument();
  });

  it('shows pause/resume toggle while recording', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

    await user.click(screen.getByText('Start Recording'));
    expect(screen.getByText('Pause')).toBeInTheDocument();

    await user.click(screen.getByText('Pause'));
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('shows playback controls after stopping', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

    await user.click(screen.getByText('Start Recording'));
    await user.click(screen.getByText('Stop'));

    expect(screen.getByText('Submit Recording')).toBeInTheDocument();
    expect(screen.getByText('Re-record')).toBeInTheDocument();
  });

  it('calls onRecordingComplete when submitting', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={onComplete} />);

    await user.click(screen.getByText('Start Recording'));
    await user.click(screen.getByText('Stop'));
    await user.click(screen.getByText('Submit Recording'));

    expect(onComplete).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('resets to initial state after re-record', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

    await user.click(screen.getByText('Start Recording'));
    await user.click(screen.getByText('Stop'));
    await user.click(screen.getByText('Re-record'));

    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('displays error when microphone access fails', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Microphone not found')
    );

    const user = userEvent.setup();
    render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

    await user.click(screen.getByText('Start Recording'));

    expect(screen.getByText('Microphone not found')).toBeInTheDocument();
  });

  it('renders without prompt when none provided', () => {
    const { container } = render(<VoiceRecorder onRecordingComplete={vi.fn()} />);
    expect(container.querySelector('.voice-prompt')).not.toBeInTheDocument();
  });
});
