import { useCallback, useRef, useState } from 'react';
import { validateField } from '../validation';

/**
 * Controlled form with live validation (validates a field once it has been touched),
 * submit-time validation of every field, busy state and server error mapping.
 * `fields` is { name: { label, type, required, rule, match, minLength, min, max, value } }.
 */
export function useForm({ fields, onSubmit }) {
  const initial = () => Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, f.value ?? '']));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const valuesRef = useRef(values);
  const touched = useRef({});
  const busyRef = useRef(false);

  const check = (name, vals = valuesRef.current) => validateField(fields[name], vals[name], vals);

  const change = (name, value) => {
    const next = { ...valuesRef.current, [name]: value };
    valuesRef.current = next;
    setValues(next);
    setErrors((prev) => {
      const e = { ...prev };
      Object.keys(fields).forEach((n) => {
        if ((n === name || fields[n].match === name) && touched.current[n]) e[n] = check(n, next);
      });
      return e;
    });
  };

  const blur = (name) => {
    if (!valuesRef.current[name] && !touched.current[name]) return;
    touched.current[name] = true;
    setErrors((prev) => ({ ...prev, [name]: check(name) }));
  };

  const reset = useCallback(() => {
    const fresh = initial();
    valuesRef.current = fresh;
    touched.current = {};
    setValues(fresh); setErrors({}); setFormError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busyRef.current) return;
    setFormError('');
    const next = {};
    let first = null;
    Object.keys(fields).forEach((n) => {
      touched.current[n] = true;
      next[n] = check(n);
      if (next[n] && !first) first = n;
    });
    setErrors(next);
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }

    busyRef.current = true; setBusy(true);
    try {
      await onSubmit(valuesRef.current, { reset });
    } catch (err) {
      let mapped = false;
      const fe = {};
      Object.entries(err?.errors || {}).forEach(([key, msgs]) => {
        const name = key.charAt(0).toLowerCase() + key.slice(1);
        if (fields[name]) { fe[name] = [].concat(msgs)[0]; mapped = true; }
      });
      if (mapped) setErrors((prev) => ({ ...prev, ...fe }));
      else setFormError(err?.message || 'Something went wrong');
    } finally {
      busyRef.current = false; setBusy(false);
    }
  };

  return { fields, values, errors, formError, busy, change, blur, reset, handleSubmit };
}
