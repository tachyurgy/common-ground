import '@testing-library/jest-dom/vitest';
import { vi, afterEach, beforeEach } from 'vitest';

// Polyfill localStorage for Node 25+ (which has a broken built-in localStorage
// that conflicts with jsdom's implementation)
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  },
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: (index: number) => Object.keys(localStorageStore)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Mock navigator.mediaDevices
const mockMediaStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Mock MediaRecorder
class MockMediaRecorder {
  state = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  static isTypeSupported(_mimeType: string) {
    return true;
  }

  start(_timeslice?: number) {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['audio'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

Object.defineProperty(window, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true,
});

// Mock URL.createObjectURL / revokeObjectURL
URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock fetch globally
globalThis.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
  vi.mocked(globalThis.fetch).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorageMock.clear();
});
