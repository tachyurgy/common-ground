import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranscriptionView from '../TranscriptionView';

describe('TranscriptionView', () => {
  it('returns null when no transcription and not loading', () => {
    const { container } = render(
      <TranscriptionView transcription={null} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows loading state', () => {
    render(<TranscriptionView transcription={null} isLoading={true} />);
    expect(screen.getByText('Transcribing your audio...')).toBeInTheDocument();
  });

  it('shows spinner during loading', () => {
    const { container } = render(
      <TranscriptionView transcription={null} isLoading={true} />
    );
    expect(container.querySelector('.spinner')).toBeInTheDocument();
    expect(container.querySelector('.loading')).toBeInTheDocument();
  });

  it('renders transcription text', () => {
    render(
      <TranscriptionView transcription="I want us to communicate better." />
    );
    expect(screen.getByText('I want us to communicate better.')).toBeInTheDocument();
    expect(screen.getByText('Your Response')).toBeInTheDocument();
  });

  it('renders transcription in a blockquote', () => {
    const { container } = render(
      <TranscriptionView transcription="Some text" />
    );
    expect(container.querySelector('blockquote.transcription-text')).toBeInTheDocument();
  });

  it('renders audio player when audioUrl is provided', () => {
    const { container } = render(
      <TranscriptionView
        transcription="Some text"
        audioUrl="blob:http://localhost/audio"
      />
    );
    const audio = container.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toBe('blob:http://localhost/audio');
    expect(audio?.hasAttribute('controls')).toBe(true);
  });

  it('does not render audio player when no audioUrl', () => {
    const { container } = render(
      <TranscriptionView transcription="Some text" />
    );
    expect(container.querySelector('audio')).not.toBeInTheDocument();
  });
});
