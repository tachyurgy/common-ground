import { describe, it, expect, vi } from 'vitest';

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function errorResponse(body: string, status = 500) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(body),
  };
}

describe('api service', () => {
  describe('wakeBackend', () => {
    it('does not throw on network error', async () => {
      vi.resetModules();
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'));
      const { wakeBackend } = await import('../api');
      await expect(wakeBackend()).resolves.toBeUndefined();
    });

    it('sends a health check request and caches the result', async () => {
      vi.resetModules();
      vi.mocked(globalThis.fetch).mockResolvedValue(jsonResponse({ status: 'ok' }) as Response);
      const { wakeBackend } = await import('../api');

      await wakeBackend();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ mode: 'cors' })
      );

      // Second call should not trigger another fetch (cached)
      vi.mocked(globalThis.fetch).mockClear();
      await wakeBackend();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('createAgreement', () => {
    it('sends a POST request with agreement data', async () => {
      vi.resetModules();
      const { createAgreement } = await import('../api');
      const mockData = {
        agreement: { id: 1, title: 'Test' },
        initial_prompt: 'Tell me about it',
      };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await createAgreement({ title: 'Test' });
      expect(result).toEqual(mockData);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ agreement: { title: 'Test' } }),
        })
      );
    });

    it('throws on API error', async () => {
      vi.resetModules();
      const { createAgreement } = await import('../api');
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        errorResponse('Validation failed', 422) as Response
      );

      await expect(createAgreement({ title: '' })).rejects.toThrow(
        'API error 422: Validation failed'
      );
    });
  });

  describe('getAgreement', () => {
    it('fetches agreement by id', async () => {
      vi.resetModules();
      const { getAgreement } = await import('../api');
      const mockData = { agreement: { id: 5, title: 'My Agreement' } };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await getAgreement(5);
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/5'),
        expect.any(Object)
      );
    });
  });

  describe('getVersions', () => {
    it('fetches versions for an agreement', async () => {
      vi.resetModules();
      const { getVersions } = await import('../api');
      const mockData = { versions: [{ id: 1, version_number: 1 }] };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await getVersions(3);
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/3/versions'),
        expect.any(Object)
      );
    });
  });

  describe('submitResponse', () => {
    it('sends response data', async () => {
      vi.resetModules();
      const { submitResponse } = await import('../api');
      const responseData = {
        question: 'How do you feel?',
        transcription: 'I feel good',
        phase: 'initial',
      };
      const mockResult = { response: { id: 1, ...responseData } };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockResult) as Response);

      const result = await submitResponse(1, responseData);
      expect(result).toEqual(mockResult);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/1/responses'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ response: responseData }),
        })
      );
    });
  });

  describe('getResponses', () => {
    it('fetches responses for an agreement', async () => {
      vi.resetModules();
      const { getResponses } = await import('../api');
      const mockData = { responses: [{ id: 1, question: 'Q', transcription: 'A' }] };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await getResponses(2);
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/2/responses'),
        expect.any(Object)
      );
    });
  });

  describe('getFollowUps', () => {
    it('fetches follow-ups for an agreement', async () => {
      vi.resetModules();
      const { getFollowUps } = await import('../api');
      const mockData = { follow_ups: [{ id: 1, question: 'Follow up?' }] };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await getFollowUps(4);
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/4/follow_ups'),
        expect.any(Object)
      );
    });
  });

  describe('skipFollowUp', () => {
    it('sends POST to skip endpoint', async () => {
      vi.resetModules();
      const { skipFollowUp } = await import('../api');
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: 'skipped' }) as Response
      );

      const result = await skipFollowUp(1, 5);
      expect(result).toEqual({ status: 'skipped' });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/1/follow_ups/5/skip'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('answerFollowUp', () => {
    it('sends transcription data to answer endpoint', async () => {
      vi.resetModules();
      const { answerFollowUp } = await import('../api');
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ status: 'answered' }) as Response
      );

      const result = await answerFollowUp(1, 3, { transcription: 'My answer' });
      expect(result).toEqual({ status: 'answered' });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/1/follow_ups/3/answer'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ transcription: 'My answer' }),
        })
      );
    });
  });

  describe('requestAmendment', () => {
    it('sends POST with optional context', async () => {
      vi.resetModules();
      const { requestAmendment } = await import('../api');
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(
        jsonResponse({ prompt: 'What would you like to change?' }) as Response
      );

      const result = await requestAmendment(2, 'Need to update chores');
      expect(result).toEqual({ prompt: 'What would you like to change?' });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/2/amend'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ context: 'Need to update chores' }),
        })
      );
    });
  });

  describe('presignAudioUpload', () => {
    it('returns presigned upload data', async () => {
      vi.resetModules();
      const { presignAudioUpload } = await import('../api');
      const mockData = { upload_url: 'https://s3.example.com', recording_id: 10, s3_key: 'key' };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockData) as Response);

      const result = await presignAudioUpload(1);
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/1/audio/presign'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('uploadAudio', () => {
    it('uploads audio blob via FormData', async () => {
      vi.resetModules();
      const { uploadAudio } = await import('../api');
      const mockResult = { recording_id: 1, s3_key: 'audio/1.webm', status: 'uploaded' };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockResult) as Response);

      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = await uploadAudio(5, blob);

      expect(result).toEqual(mockResult);
      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[0]).toContain('/agreements/5/audio/upload');
      expect(fetchCall[1]?.method).toBe('POST');
      expect(fetchCall[1]?.body).toBeInstanceOf(FormData);
    });

    it('throws on upload failure', async () => {
      vi.resetModules();
      const { uploadAudio } = await import('../api');
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 413,
      } as Response);

      const blob = new Blob(['data'], { type: 'audio/webm' });
      await expect(uploadAudio(1, blob)).rejects.toThrow('Upload failed: 413');
    });
  });

  describe('getAudioStatus', () => {
    it('fetches transcription status', async () => {
      vi.resetModules();
      const { getAudioStatus } = await import('../api');
      const mockStatus = {
        id: 1,
        status: 'completed',
        s3_key: 'audio/1.webm',
        duration: 30,
        transcription: 'Hello world',
      };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(mockStatus) as Response);

      const result = await getAudioStatus(2, 1);
      expect(result).toEqual(mockStatus);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agreements/2/audio/status/1'),
        expect.any(Object)
      );
    });
  });
});
