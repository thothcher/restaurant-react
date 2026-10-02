const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v) => EMAIL_RE.test(String(v).trim());

export const PW_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number (0–9)', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'One special character (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** Returns an error message, or '' when valid. `cfg` is a field config from the page. */
export function validateField(cfg, value, values) {
  const v = value ?? '';
  const t = String(v).trim();
  const label = cfg.label;
  if (cfg.required && !t) return `${label} is required`;
  if (!t) return '';
  if (cfg.type === 'email' && !EMAIL_RE.test(t)) return 'Enter a valid email address';
  if (cfg.type === 'url') { try { new URL(t); } catch { return 'Enter a valid URL, e.g. https://example.com/me.jpg'; } }
  if (cfg.rule === 'password' && !PW_RULES.every((r) => r.test(v))) return 'Password does not meet all the requirements';
  if (cfg.rule === 'phone' && !/^\+?[0-9\s().-]{7,18}$/.test(t)) return 'Enter a valid phone number';
  if (cfg.minLength && v.length < cfg.minLength) return `${label} must be at least ${cfg.minLength} characters`;
  if (cfg.type === 'number') {
    const n = Number(t);
    if (Number.isNaN(n)) return `${label} must be a number`;
    if (cfg.min != null && n < cfg.min) return `${label} must be at least ${cfg.min}`;
    if (cfg.max != null && n > cfg.max) return `${label} must be at most ${cfg.max}`;
  }
  if (cfg.match && values[cfg.match] !== v) return 'Passwords do not match';
  return '';
}
