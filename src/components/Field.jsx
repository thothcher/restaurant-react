import { useState } from 'react';
import Icon from './Icon';
import { PW_RULES } from '../validation';

export function PasswordRules({ value }) {
  return (
    <ul className="pw-rules" aria-label="Password requirements">
      {PW_RULES.map((r) => (
        <li key={r.id} className={r.test(value) ? 'ok' : ''}>
          <Icon name="check" /><Icon name="x" className="ic-x" /><span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Text input bound to a useForm() instance by field name. */
export default function Field({ form, name, autoComplete, inputMode }) {
  const cfg = form.fields[name];
  const [show, setShow] = useState(false);
  const isPw = cfg.type === 'password';
  const error = form.errors[name];

  return (
    <div className="field">
      <label htmlFor={`f-${name}`}>
        {cfg.label}{cfg.required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      <div className="input-wrap">
        <input
          id={`f-${name}`} name={name} type={isPw && show ? 'text' : cfg.type || 'text'}
          value={form.values[name]} autoComplete={autoComplete} inputMode={inputMode}
          min={cfg.min} max={cfg.max}
          onChange={(e) => form.change(name, e.target.value)} onBlur={() => form.blur(name)}
          aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `err-${name}` : undefined}
        />
        {isPw && (
          <button type="button" className="pw-toggle" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
            <Icon name={show ? 'eye-off' : 'eye'} />
          </button>
        )}
      </div>
      {cfg.rule === 'password' && <PasswordRules value={form.values[name]} />}
      {error && <p className="field-error" id={`err-${name}`}>{error}</p>}
    </div>
  );
}

export function FormError({ message }) {
  return message ? <p className="form-error" role="alert"><Icon name="alert" /><span>{message}</span></p> : null;
}

export function SubmitButton({ busy, children, block = true }) {
  return <button type="submit" className={`btn btn-primary ${block ? 'btn-block' : ''} ${busy ? 'is-loading' : ''}`} disabled={busy}><span>{children}</span></button>;
}
