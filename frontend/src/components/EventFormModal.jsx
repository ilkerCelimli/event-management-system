import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

const CATEGORIES = ['CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'SPORTS', 'EDUCATION', 'OTHER'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

const empty = {
  title: '', description: '', category: 'CONFERENCE', status: 'DRAFT',
  venueName: '', address: '', city: '',
  startTime: toLocalInput(24), endTime: toLocalInput(24, 4), capacity: 100
};

// Veritabanı LocalDateTime -> <input type="datetime-local"> değeri
export function toLocalInput(daysFromNow = 0, addHours = 0) {
  const d = new Date(Date.now() + daysFromNow * 86400000 + addHours * 3600000);
  d.setMinutes((Math.floor(d.getMinutes() / 15)) * 15, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// HTML datetime-local -> SQL LocalDateTime ISO
function toIso(value) {
  return value ? value.replace('T', 'T') + ':00' : null;
}

export default function EventFormModal({ event, onClose, onNotify, onSaved }) {
  const editing = event !== null;
  const [form, setForm] = useState(editing ? {
    title: event.title, description: event.description,
    category: event.category, status: event.status,
    venueName: event.venueName || '', address: event.address || '', city: event.city || '',
    capacity: event.capacity
  } : { ...empty });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [startTime, setStartTime] = useState(editing
    ? (event.startTime || '').slice(0, 16)
    : toLocalInput(24));
  const [endTime, setEndTime] = useState(editing
    ? (event.endTime || '').slice(0, 16)
    : toLocalInput(24, 4));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { ...form, startTime: toIso(startTime), endTime: toIso(endTime) };
    setBusy(true);
    try {
      if (editing) {
        await api.updateEvent(event.id, payload);
        onNotify('Etkinlik güncellendi');
      } else {
        await api.createEvent(payload);
        onNotify('Etkinlik oluşturuldu');
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal wide">
        <div className="modal-head">
          <h3>{editing ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        {error && <div className="alert err">{error}</div>}
        <form className="grid-form" onSubmit={submit}>
          <label>Başlık *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} />

          <label>Açıklama *</label>
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} required maxLength={2000} />

          <label>Kategori *</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          <label>Durum</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          <label>Mekan</label>
          <input value={form.venueName} onChange={(e) => set('venueName', e.target.value)} maxLength={150} />

          <label>Şehir</label>
          <input value={form.city} onChange={(e) => set('city', e.target.value)} maxLength={100} />

          <label>Adres</label>
          <input value={form.address} onChange={(e) => set('address', e.target.value)} maxLength={300} />

          <label>Başlangıç *</label>
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />

          <label>Bitiş *</label>
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />

          <label>Kapasite *</label>
          <input type="number" min={1} value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} required />

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>İptal</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}