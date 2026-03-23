interface TranscriptionViewProps {
  transcription: string | null;
  audioUrl?: string;
  isLoading?: boolean;
}

export default function TranscriptionView({
  transcription,
  audioUrl,
  isLoading = false,
}: TranscriptionViewProps) {
  if (isLoading) {
    return (
      <div className="transcription-view loading">
        <div className="spinner" />
        <p>Transcribing your audio...</p>
      </div>
    );
  }

  if (!transcription) return null;

  return (
    <div className="transcription-view">
      <h4>Your Response</h4>
      <blockquote className="transcription-text">{transcription}</blockquote>
      {audioUrl && <audio src={audioUrl} controls className="transcription-audio" />}
    </div>
  );
}
