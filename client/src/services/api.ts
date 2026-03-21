const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let backendAwake = false;

export async function wakeBackend(): Promise<void> {
  if (backendAwake) return;
  try {
    await fetch(`${API_BASE}/health`, { mode: 'cors' });
    backendAwake = true;
  } catch {
    // Backend still sleeping, will retry on next call
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function createAgreement(data: {
  title: string;
  description?: string;
  participant_names?: string;
}) {
  return request<{ agreement: import('../types').Agreement; initial_prompt: string }>(
    '/agreements',
    {
      method: 'POST',
      body: JSON.stringify({ agreement: data }),
    }
  );
}

export async function getAgreement(id: number) {
  return request<{ agreement: import('../types').Agreement }>(`/agreements/${id}`);
}

export async function getVersions(id: number) {
  return request<{ versions: import('../types').AgreementVersion[] }>(
    `/agreements/${id}/versions`
  );
}

export async function submitResponse(
  agreementId: number,
  data: { question: string; transcription: string; audio_s3_key?: string; phase: string }
) {
  return request<{ response: import('../types').ResponseEntry }>(
    `/agreements/${agreementId}/responses`,
    {
      method: 'POST',
      body: JSON.stringify({ response: data }),
    }
  );
}

export async function getResponses(agreementId: number) {
  return request<{ responses: import('../types').ResponseEntry[] }>(
    `/agreements/${agreementId}/responses`
  );
}

export async function getFollowUps(agreementId: number) {
  return request<{ follow_ups: import('../types').FollowUp[] }>(
    `/agreements/${agreementId}/follow_ups`
  );
}

export async function skipFollowUp(agreementId: number, followUpId: number) {
  return request<{ status: string }>(
    `/agreements/${agreementId}/follow_ups/${followUpId}/skip`,
    { method: 'POST' }
  );
}

export async function answerFollowUp(
  agreementId: number,
  followUpId: number,
  data: { transcription: string; audio_s3_key?: string }
) {
  return request<{ status: string }>(
    `/agreements/${agreementId}/follow_ups/${followUpId}/answer`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function requestAmendment(agreementId: number, context?: string) {
  return request<{ prompt: string }>(`/agreements/${agreementId}/amend`, {
    method: 'POST',
    body: JSON.stringify({ context }),
  });
}

export async function presignAudioUpload(agreementId: number) {
  return request<{ upload_url: string; recording_id: number; s3_key: string }>(
    `/agreements/${agreementId}/audio/presign`,
    { method: 'POST' }
  );
}

export async function uploadAudio(agreementId: number, audioBlob: Blob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const res = await fetch(`${API_BASE}/agreements/${agreementId}/audio/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json() as Promise<{ recording_id: number; s3_key: string; status: string }>;
}

export async function getAudioStatus(agreementId: number, recordingId: number) {
  return request<import('../types').AudioRecordingStatus>(
    `/agreements/${agreementId}/audio/status/${recordingId}`
  );
}
