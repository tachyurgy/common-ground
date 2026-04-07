import { useState, useCallback } from 'react';
import type { ToastMessage } from '../components/Toast';

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], text: string) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((text: string) => addToast('success', text), [addToast]);
  const error = useCallback((text: string) => addToast('error', text), [addToast]);
  const info = useCallback((text: string) => addToast('info', text), [addToast]);

  return { toasts, dismissToast, success, error, info };
}
