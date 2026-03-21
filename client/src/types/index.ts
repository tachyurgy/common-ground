export interface Agreement {
  id: number;
  title: string;
  description: string;
  status: string;
  participant_names: string;
  current_version: AgreementVersion | null;
  follow_ups: FollowUp[];
  responses_count: number;
  versions_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgreementVersion {
  id: number;
  version_number: number;
  content: string;
  change_summary: string;
  created_at: string;
}

export interface FollowUp {
  id: number;
  question: string;
  context: string;
}

export interface ResponseEntry {
  id: number;
  question: string;
  transcription: string;
  audio_s3_key: string;
  phase: string;
  created_at: string;
}

export interface AudioRecordingStatus {
  id: number;
  status: 'uploading' | 'transcribing' | 'completed' | 'failed';
  s3_key: string;
  duration: number | null;
  transcription: string | null;
  audio_url?: string;
}
