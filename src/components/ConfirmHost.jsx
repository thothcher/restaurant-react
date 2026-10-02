// Promise-based confirm dialog: `await confirmDialog({...})` resolves to true/false.
import { useEffect, useRef, useSyncExternalStore } from 'react';

let current = null; // { opts, resolve }
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export const confirmDialog = (opts) => new Promise((resolve) => { current = { opts, resolve }; emit(); });

export default function ConfirmHost() {
  const state = useSyncExternalStore(subscribe, () => current);
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (state && dlg && !dlg.open) { dlg.returnValue = 'cancel'; dlg.showModal(); }
  }, [state]);

  const onClose = () => {
    const done = current;
    current = null;
    emit();
    done?.resolve(ref.current.returnValue === 'ok');
  };

  const o = state?.opts;
  return (
    <dialog ref={ref} className="dialog" onClose={onClose}>
      {o && (
        <form method="dialog" className="dialog-body">
          <h2>{o.title}</h2>
          <p>{o.message}</p>
          <div className="dialog-actions">
            <button className="btn btn-ghost" value="cancel">Cancel</button>
            <button className={`btn ${o.danger ? 'btn-danger' : 'btn-primary'}`} value="ok" autoFocus>{o.confirmText || 'Confirm'}</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
