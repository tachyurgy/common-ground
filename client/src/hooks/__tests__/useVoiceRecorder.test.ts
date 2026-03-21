import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecorder } from '../useVoiceRecorder';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

import { afterEach } from 'vitest';
afterEach(() => {
  vi.useRealTimers();
});

describe('useVoiceRecorder', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useVoiceRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.audioBlob).toBeNull();
    expect(result.current.audioUrl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('starts recording successfully', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBeNull();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('sets error when microphone access fails', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Permission denied')
    );

    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toBe('Permission denied');
  });

  it('stops recording and produces audio blob', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
    expect(result.current.audioUrl).toBe('blob:mock-url');
  });

  it('pauses and resumes recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.pauseRecording();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resumeRecording();
    });
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isRecording).toBe(true);
  });

  it('resets recording state', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.audioBlob).not.toBeNull();

    act(() => {
      result.current.resetRecording();
    });

    expect(result.current.audioBlob).toBeNull();
    expect(result.current.audioUrl).toBeNull();
    expect(result.current.duration).toBe(0);
    expect(result.current.isRecording).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('increments duration while recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.duration).toBe(0);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.duration).toBeGreaterThanOrEqual(2);
  });
});
