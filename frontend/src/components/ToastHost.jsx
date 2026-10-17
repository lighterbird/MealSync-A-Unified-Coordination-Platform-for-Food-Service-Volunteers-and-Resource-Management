import { useEffect } from 'react';
export default function ToastHost({ toast, closeToast }) {
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(closeToast, 3600); return () => clearTimeout(timer); }, [toast, closeToast]);
  if (!toast) return null;
  return <div className="toast-stack" aria-live="polite" aria-atomic="true"><div className="toast"><span className="toast-check">✓</span><div><strong>{toast.title}</strong><p>{toast.message}</p></div><button type="button" onClick={closeToast} aria-label="Dismiss notification">×</button></div></div>;
}
