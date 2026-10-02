// Toast store (callable from anywhere) + top-centre renderer.
import { useEffect, useState, useSyncExternalStore } from 'react';
import Icon from './Icon';

let toasts = [];
let nextId = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export const toast = (message, type = 'info') => {
  toasts = [...toasts, { id: ++nextId, message, type }];
  emit();
};
const remove = (id) => { toasts = toasts.filter((t) => t.id !== id); emit(); };

const ICON = { success: 'check-circle', error: 'alert', info: 'info' };

function Toast({ t }) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  // Fade in on the next frame, auto-close after a few seconds.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => setClosing(true), t.type === 'error' ? 5500 : 3200);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [t.type]);

  // Fade out, then drop from the store.
  useEffect(() => {
    if (!closing) return undefined;
    setShow(false);
    const id = setTimeout(() => remove(t.id), 250);
    return () => clearTimeout(id);
  }, [closing, t.id]);

  return (
    <div className={`toast toast-${t.type} ${show ? 'show' : ''}`} role={t.type === 'error' ? 'alert' : 'status'}>
      <Icon name={ICON[t.type] || 'info'} />
      <span>{t.message}</span>
      <button type="button" aria-label="Dismiss" onClick={() => setClosing(true)}><Icon name="x" /></button>
    </div>
  );
}

export default function Toasts() {
  const list = useSyncExternalStore(subscribe, () => toasts);
  return <div className="toasts" aria-live="polite">{list.map((t) => <Toast key={t.id} t={t} />)}</div>;
}
