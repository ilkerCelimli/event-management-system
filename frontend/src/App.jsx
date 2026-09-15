import { useState } from 'react';
import { api, authStore, getCurrentUser, setCurrentUser } from './services/api.js';
import AuthPage from './pages/AuthPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import MyEventsPage from './pages/MyEventsPage.jsx';
import RegistrationsPage from './pages/RegistrationsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import EventFormModal from './components/EventFormModal.jsx';
import EventDetailModal from './components/EventDetailModal.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [view, setView] = useState('events'); // events | my-events | registrations | users
  const [toast, setToast] = useState(null);
  const [formEvent, setFormEvent] = useState(null); // truedan sonra düzenleme için Event objesi|false aç/kapa
  const [detailEvent, setDetailEvent] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (payload) => {
    const res = api.login(payload);
    res.then((data) => {
      applyAuth(data);
      notify(`Hoş geldin, ${data.user.fullName}!`);
    });
    return res;
  };

  const handleRegister = (payload) => {
    const res = api.register(payload);
    res.then((data) => {
      applyAuth(data);
      notify('Kayıt başarılı, hoş geldin!');
    });
    return res;
  };

  const applyAuth = (data) => {
    authStore.setToken(data.token);
    setCurrentUser(data.user);
    setUser(data.user);
  };

  const handleLogout = () => {
    authStore.clear();
    setCurrentUser(null);
    setUser(null);
    setView('events');
    notify('Çıkış yapıldı');
  };

  const openCreate = () => setFormEvent({ __new: true });
  const openEdit = (event) => setFormEvent(event);
  const closeForm = () => setFormEvent(null);

  const isOrg = user && (user.role === 'ORGANIZER' || user.role === 'ADMIN');
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setView('events')}>
          <span className="brand-icon">📅</span> Etkinlik Yönetim Sistemi
        </div>
        <nav className="nav">
          <button className={navClass(view, 'events')} onClick={() => setView('events')}>Etkinlikler</button>
          {user && (
            <button className={navClass(view, 'my-events')} onClick={() => setView('my-events')}>Etkinliklerim</button>
          )}
          {user && (
            <button className={navClass(view, 'registrations')} onClick={() => setView('registrations')}>Kayıtlarım</button>
          )}
          {isAdmin && (
            <button className={navClass(view, 'users')} onClick={() => setView('users')}>Kullanıcılar</button>
          )}
        </nav>
        <div className="userbox">
          {user ? (
            <div className="user-chip">
              <span className="avatar">{initials(user.fullName)}</span>
              <span className="usr">{user.fullName}</span>
              <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>Çıkış</button>
            </div>
          ) : (
            <span className="muted">Giriş yapmadınız</span>
          )}
        </div>
      </header>

      <main className="content">
        {!user ? (
          <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
        ) : view === 'events' ? (
          <EventsPage
            onNotify={notify}
            currentUserId={user && user.id}
            isAdmin={isAdmin}
            canCreate={isOrg}
            onCreate={openCreate}
            onEdit={openEdit}
            onDetail={setDetailEvent}
          />
        ) : view === 'my-events' ? (
          <MyEventsPage
            onNotify={notify}
            currentUserId={user && user.id}
            isAdmin={isAdmin}
            onCreate={openCreate}
            onEdit={openEdit}
            onDetail={setDetailEvent}
          />
        ) : view === 'registrations' ? (
          <RegistrationsPage onNotify={notify} onDetail={setDetailEvent} />
        ) : view === 'users' ? (
          <UsersPage />
        ) : null}
      </main>

      {formEvent && (
        <EventFormModal
          event={formEvent.__new ? null : formEvent}
          onClose={closeForm}
          onNotify={notify}
          onSaved={() => {
            closeForm();
            if (view === 'events') setView('events');
          }}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onNotify={notify}
          isOrg={isOrg}
          onEdit={() => {
            openEdit(detailEvent);
            setDetailEvent(null);
          }}
          onDeleted={() => { setDetailEvent(null); setView('events'); }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

const navClass = (current, target) => current === target ? 'nav-btn active' : 'nav-btn';
const initials = (name) => (name || '?').split(' ').slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();