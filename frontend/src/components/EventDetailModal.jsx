import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { fmtDate, CATEGORY_ICON } from './EventCard.jsx';

export default function EventDetailModal({ event, onClose, onNotify, isOrg, onEdit, onDeleted }) {
  const [data, setData] = useState(null);
  const [myReg, setMyReg] = useState(null); // RegistrationResponse | null
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const ev = await api.getEvent(event.id);
      setData(ev);
      try {
        const my = await api.myRegistrations();
        const mine = my.find((r) => r.eventId === ev.id && r.status !== 'CANCELLED');
        setMyReg(mine || null);
      } catch { setMyReg(null); }
    } catch (err) {
      onNotify(err.message, 'error');
      onClose();
    }
  };

  useEffect(() => { load(); }, []);

  const register = async () => {
    setBusy(true);
    try {
      const reg = await api.registerToEvent(data.id);
      onNotify(reg.status === 'WAITLISTED' ? 'Kapasite dolu, bekleme listesine alındınız' : 'Kaydınız onaylandı');
      load();
    } catch (err) { onNotify(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await api.cancelRegistration(data.id);
      onNotify('Kaydınız iptal edildi');
      load();
    } catch (err) { onNotify(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm('Bu etkinlik silinsin mi?')) return;
    setBusy(true);
    try {
      await api.deleteEvent(data.id);
      onNotify('Etkinlik silindi');
      onDeleted();
    } catch (err) { onNotify(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const publish = async (status) => {
    setBusy(true);
    try {
      await api.setEventStatus(data.id, status);
      onNotify('Etkinlik durumu güncellendi');
      load();
    } catch (err) { onNotify(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const d = data || event;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal detail">
        <div className="modal-head">
          <h3>{d.title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="detail-hero">
          <span className="big-cat">{CATEGORY_ICON[d.category] || '✨'} {d.category}</span>
          <p className="detail-desc">{d.description}</p>
        </div>

        <div className="detail-grid">
          <div><span className="dt">Mekan</span><span>{d.venueName || '—'}</span></div>
          <div><span className="dt">Adres</span><span>{d.address || '—'}</span></div>
          <div><span className="dt">Şehir</span><span>{d.city || '—'}</span></div>
          <div><span className="dt">Başlangıç</span><span>{fmtDate(d.startTime)}</span></div>
          <div><span className="dt">Bitiş</span><span>{fmtDate(d.endTime)}</span></div>
          <div><span className="dt">Organizatör</span><span>{d.organizerName}</span></div>
        </div>

        <div className="capacity-bar big">
          <div className="capacity-fill" style={{ width: pct(d.registeredCount, d.capacity) + '%' }} />
          <span className="capacity-label">{d.registeredCount}/{d.capacity} katılımcı</span>
        </div>

        {d.status === 'PUBLISHED' && d.startTime && new Date(d.startTime) > new Date() && !myReg && (
          <button className="btn-primary btn-block mt" disabled={busy} onClick={register}>
            {busy ? 'İşleniyor...' : 'Kayıt Ol'}
          </button>
        )}

        {myReg && (
          <div className="info-box">
            <strong>Kayıt durumunuz:</strong>
            <span className={`status ${myReg.status === 'CONFIRMED' ? 'st-pub' : 'st-wait'}`}>
              {myReg.status === 'CONFIRMED' ? 'Onaylı' : 'Bekleme Listesi'}
            </span>
            <button className="btn-danger btn-sm mt" disabled={busy} onClick={cancel}>Kaydı İptal Et</button>
          </div>
        )}

        {isOrg && (
          <div className="mgmt mt">
            <button className="btn-ghost btn-sm" onClick={() => onEdit(d)}>Düzenle</button>
            {d.status === 'DRAFT' && <button className="btn-ghost btn-sm" onClick={() => publish('PUBLISHED')}>Yayınla</button>}
            {d.status === 'PUBLISHED' && <button className="btn-ghost btn-sm" onClick={() => publish('COMPLETED')}>Tamamla</button>}
            {d.status !== 'CANCELLED' && <button className="btn-warn btn-sm" onClick={() => publish('CANCELLED')}>İptal Et</button>}
            <button className="btn-danger btn-sm" onClick={remove}>Sil</button>
          </div>
        )}
      </div>
    </div>
  );
}

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);