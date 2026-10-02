import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Field, { FormError, SubmitButton } from '../components/Field';
import { toast } from '../components/Toasts';
import { api, completeLogin } from '../api/client';
import { useForm } from '../hooks/useForm';
import { useSeo } from '../hooks/useSeo';
import { isEmail } from '../validation';

function Shell({ title, sub, form, foot, children }) {
  return (
    <div className="auth">
      <div className="auth-card" data-aos="fade-up">
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        <form onSubmit={form.handleSubmit} noValidate>
          <FormError message={form.formError} />
          {children}
        </form>
        {foot && <p className="auth-foot">{foot}</p>}
      </div>
    </div>
  );
}

const safeNext = (n) => (n && /^\/[^/]/.test(n) ? n : '/menu');

export function Login() {
  useSeo({ title: 'Sign in', noindex: true });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const form = useForm({
    fields: {
      email: { label: 'Email', type: 'email', required: true, value: params.get('email') || '' },
      password: { label: 'Password', type: 'password', required: true },
    },
    onSubmit: async (v) => {
      const res = await api.login({ email: v.email.trim(), password: v.password });
      if (res.isVerified === false) {
        toast('Please verify your email first', 'info');
        navigate(`/verify?email=${encodeURIComponent(v.email.trim())}&resend=1`);
        return;
      }
      await completeLogin(res);
      toast('Signed in', 'success');
      navigate(safeNext(params.get('next')));
    },
  });

  return (
    <Shell title="Welcome back" sub="Sign in to manage your cart and orders." form={form}
      foot={<>New here? <Link to="/register">Create an account</Link></>}>
      <Field form={form} name="email" autoComplete="email" />
      <Field form={form} name="password" autoComplete="current-password" />
      <Link className="link small" to="/forgot">Forgot password?</Link>
      <SubmitButton busy={form.busy}>Sign in</SubmitButton>
    </Shell>
  );
}

export function Register() {
  useSeo({ title: 'Create account', noindex: true });
  const navigate = useNavigate();
  const form = useForm({
    fields: {
      firstName: { label: 'First name', required: true, minLength: 2 },
      lastName: { label: 'Last name', required: true, minLength: 2 },
      email: { label: 'Email', type: 'email', required: true },
      password: { label: 'Password', type: 'password', required: true, rule: 'password' },
      confirm: { label: 'Confirm password', type: 'password', required: true, match: 'password' },
    },
    onSubmit: async (v) => {
      const email = v.email.trim();
      await api.register({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), email, password: v.password });
      toast('Account created — check your email for a code', 'success');
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    },
  });

  return (
    <Shell title="Create account" sub="Join us to start ordering." form={form}
      foot={<>Already registered? <Link to="/login">Sign in</Link></>}>
      <div className="row2">
        <Field form={form} name="firstName" autoComplete="given-name" />
        <Field form={form} name="lastName" autoComplete="family-name" />
      </div>
      <Field form={form} name="email" autoComplete="email" />
      <Field form={form} name="password" autoComplete="new-password" />
      <Field form={form} name="confirm" autoComplete="new-password" />
      <SubmitButton busy={form.busy}>Create account</SubmitButton>
    </Shell>
  );
}

export function Verify() {
  useSeo({ title: 'Verify email', noindex: true });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const form = useForm({
    fields: {
      email: { label: 'Email', type: 'email', required: true, value: email },
      code: { label: 'Verification code', required: true },
    },
    onSubmit: async (v) => {
      const res = await api.verifyEmail({ email: v.email.trim(), code: v.code.trim() });
      await completeLogin(res);
      toast('Email verified — welcome!', 'success');
      navigate('/menu');
    },
  });

  const resend = async (address) => {
    if (!isEmail(address)) { document.getElementById('f-email')?.focus(); return; }
    try { await api.resendVerification(address.trim()); toast('A new code has been sent', 'success'); }
    catch (err) { toast(err.message, 'error'); }
  };

  const autoSent = useRef(false);
  useEffect(() => {
    if (params.get('resend') && email && !autoSent.current) { autoSent.current = true; resend(email); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell title="Verify your email" form={form} foot={<Link to="/login">Back to sign in</Link>}
      sub={<>Enter the code we sent{email && <> to <strong>{email}</strong></>}.</>}>
      <Field form={form} name="email" autoComplete="email" />
      <Field form={form} name="code" autoComplete="one-time-code" inputMode="numeric" />
      <SubmitButton busy={form.busy}>Verify</SubmitButton>
      <button type="button" className="link small" onClick={() => resend(form.values.email)}>Resend code</button>
    </Shell>
  );
}

export function Forgot() {
  useSeo({ title: 'Forgot password', noindex: true });
  const navigate = useNavigate();
  const form = useForm({
    fields: { email: { label: 'Email', type: 'email', required: true } },
    onSubmit: async (v) => {
      await api.forgotPassword(v.email.trim());
      toast('If the account exists, a code is on its way', 'success');
      navigate('/reset');
    },
  });

  return (
    <Shell title="Forgot password?" sub="Enter your email and we'll send a reset code." form={form} foot={<Link to="/login">Back to sign in</Link>}>
      <Field form={form} name="email" autoComplete="email" />
      <SubmitButton busy={form.busy}>Send code</SubmitButton>
    </Shell>
  );
}

export function Reset() {
  useSeo({ title: 'Reset password', noindex: true });
  const navigate = useNavigate();
  const form = useForm({
    fields: {
      token: { label: 'Reset code', required: true },
      newPassword: { label: 'New password', type: 'password', required: true, rule: 'password' },
      confirm: { label: 'Confirm new password', type: 'password', required: true, match: 'newPassword' },
    },
    onSubmit: async (v) => {
      await api.resetPassword({ token: v.token.trim(), newPassword: v.newPassword });
      toast('Password updated — please sign in', 'success');
      navigate('/login');
    },
  });

  return (
    <Shell title="Reset password" sub="Paste the code from your email and choose a new password." form={form} foot={<Link to="/login">Back to sign in</Link>}>
      <Field form={form} name="token" />
      <Field form={form} name="newPassword" autoComplete="new-password" />
      <Field form={form} name="confirm" autoComplete="new-password" />
      <SubmitButton busy={form.busy}>Reset password</SubmitButton>
    </Shell>
  );
}
