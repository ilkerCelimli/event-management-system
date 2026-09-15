import { useState } from 'react';

const ROLES = [
  ['ATTENDEE', 'Katılımcı'],
  ['ORGANIZER', 'Organizatör'],
  ['ADMIN', 'Yönetici']
];

export default function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setError(null); setBusy(false); };

  const handleLogin = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    reset();
    setBusy(true);
    onLogin({ username: form.get('username'), password: form.get('password') })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    reset();
    if (form.get('password') !== form.get('password2')) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    setBusy(true);
    onRegister({
      username: form.get('username'),
      email: form.get('email'),
      password: form.get('password'),
      fullName: form.get('fullName'),
      role: form.get('role')
    })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-title">📅 Etkinlik Yönetim Sistemi</div>
        <div className="tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => { setMode('login'); reset(); }}>Giriş</button>
          <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => { setMode('register'); reset(); }}>Kayıt Ol</button>
        </div>

        {error && <div className="alert err">{error}</div>}

        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>Kullanıcı adı</label>
            <input name="username" required placeholder="username" />
            <label>Şifre</label>
            <input name="password" type="password" required placeholder="••••••" />
            <button className="btn-primary btn-block" disabled={busy}>{busy ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
          </form>
        )}

        {mode === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>Kullanıcı adı</label>
            <input name="username" required minLength={3} placeholder="min 3 karakter" />
            <label>E-posta</label>
            <input name="email" type="email" required placeholder="ornek@mail.com" />
            <label>Ad Soyad</label>
            <input name="fullName" required placeholder="Adınız Soyadınız" />
            <label>Şifre</label>
            <input name="password" type="password" required minLength={6} placeholder="min 6 karakter" />
            <label>Şifre (tekrar)</label>
            <input name="password2" type="password" required />
            <label>Rol</label>
            <select name="role">
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button className="btn-primary btn-block" disabled={busy}>{busy ? 'Kaydediliyor...' : 'Kayıt Ol'}</button>
          </form>
        )}

        <div className="auth-hint">
          Demo hesaplar: <code>organizer / organizer123</code>, <code>attendee / attendee123</code>, <code>admin / admin123</code>
        </div>
      </div>
    </section>
  );
}