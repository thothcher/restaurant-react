import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Field, { FormError, SubmitButton } from '../components/Field';
import { ErrorState, Img, Spinner } from '../components/bits';
import { confirmDialog } from '../components/ConfirmHost';
import { toast } from '../components/Toasts';
import { api } from '../api/client';
import { store } from '../store';
import { useForm } from '../hooks/useForm';
import { useSeo } from '../hooks/useSeo';

function EditForm({ p, onSaved }) {
  const form = useForm({
    fields: {
      firstName: { label: 'First name', required: true, minLength: 2, value: p.firstName ?? '' },
      lastName: { label: 'Last name', required: true, minLength: 2, value: p.lastName ?? '' },
      phoneNumber: { label: 'Phone', type: 'tel', rule: 'phone', value: p.phoneNumber ?? '' },
      age: { label: 'Age', type: 'number', min: 0, max: 120, value: p.age ?? '' },
      address: { label: 'Delivery address', value: p.address ?? '' },
      picture: { label: 'Picture URL', type: 'url', value: p.picture ?? '' },
    },
    onSubmit: async (v) => {
      const body = {
        firstName: v.firstName.trim(), lastName: v.lastName.trim(),
        phoneNumber: v.phoneNumber.trim() || null, address: v.address.trim() || null,
        picture: v.picture.trim() || null, age: v.age === '' ? null : Number(v.age),
      };
      await api.editProfile(body);
      store.setUser({ ...store.state.user, firstName: body.firstName, lastName: body.lastName });
      toast('Profile updated', 'success');
      onSaved();
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <FormError message={form.formError} />
      <div className="row2"><Field form={form} name="firstName" /><Field form={form} name="lastName" /></div>
      <div className="row2"><Field form={form} name="phoneNumber" autoComplete="tel" /><Field form={form} name="age" /></div>
      <Field form={form} name="address" autoComplete="street-address" />
      <Field form={form} name="picture" />
      <SubmitButton busy={form.busy} block={false}>Save changes</SubmitButton>
    </form>
  );
}

function PasswordForm() {
  const form = useForm({
    fields: {
      oldPassword: { label: 'Current password', type: 'password', required: true },
      newPassword: { label: 'New password', type: 'password', required: true, rule: 'password' },
      confirmPassword: { label: 'Confirm new password', type: 'password', required: true, match: 'newPassword' },
    },
    onSubmit: async (v, { reset }) => {
      await api.changePassword(v);
      reset();
      toast('Password changed', 'success');
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <FormError message={form.formError} />
      <Field form={form} name="oldPassword" autoComplete="current-password" />
      <Field form={form} name="newPassword" autoComplete="new-password" />
      <Field form={form} name="confirmPassword" autoComplete="new-password" />
      <SubmitButton busy={form.busy} block={false}>Update password</SubmitButton>
    </form>
  );
}

export default function Profile() {
  useSeo({ title: 'Your profile', noindex: true });
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0); // remount the edit form after saving

  const load = useCallback(() => {
    setError(null);
    return api.profile().then(setP).catch(setError);
  }, []);
  useEffect(() => { load(); }, [load]);

  const deleteAccount = async () => {
    const ok = await confirmDialog({ title: 'Delete your account?', message: 'All your data will be permanently deleted.', confirmText: 'Delete account', danger: true });
    if (!ok) return;
    try {
      await api.deleteAccount();
      store.clear();
      toast('Your account was deleted', 'info');
      navigate('/');
    } catch (err) { toast(err.message, 'error'); }
  };

  if (error) return <div className="container"><ErrorState error={error} onRetry={load} /></div>;
  if (!p) return <Spinner />;

  const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div className="container narrow">
      <header className="profile-head" data-aos="fade-up">
        <div className="avatar">{p.picture ? <Img src={p.picture} alt="Profile picture" eager /> : (initials || <Icon name="user" />)}</div>
        <div><h1>{p.firstName} {p.lastName}</h1><p className="muted">{p.email}</p></div>
      </header>

      <section className="panel" data-aos="fade-up">
        <h2>Personal information</h2>
        <EditForm key={version} p={p} onSaved={async () => { await load(); setVersion((v) => v + 1); }} />
      </section>

      <section className="panel" data-aos="fade-up"><h2>Change password</h2><PasswordForm /></section>

      <section className="panel danger-zone" data-aos="fade-up">
        <h2>Delete account</h2>
        <p className="muted">This permanently removes your account and cart. This cannot be undone.</p>
        <button className="btn btn-danger" onClick={deleteAccount}><Icon name="trash" /> Delete my account</button>
      </section>
    </div>
  );
}
