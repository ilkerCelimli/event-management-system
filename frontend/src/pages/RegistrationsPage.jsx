import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { fmtDate } from '../components/EventCard.jsx';

export default function RegistrationsPage({ onNotify, onDetail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.myRegistrations());
    } catch (err) {
      onNotify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (row) => {
    if (!window.confirm(`${row.eventTitle} kaydı iptal edilsin mi?`)) return;
    try {
      await api.cancelRegistration(row.eventId);
      onNotify('Kayıt iptal edildi');
      load();
    } catch (err) { onNotify(err.message, 'error'); }
  };

  return (
    <section className="page">
      <div className="page-head"><h2>Kayıtlarım</h2></div>

      {loading ? <div className="spinner">Yükleniyor...</div> : rows.length === 0 ? (
        <div className="empty">Henüz bir etkinliğe kayıt olmadınız.</div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Etkinlik</th><th>Kayıt Tarihi</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><a onClick={() => onDetail({ id: r.eventId, title: r.eventTitle })}>{r.eventTitle}</a></td>
                <td>{fmtDate(r.registeredAt)}</td>
                <td>
                  <span className={`status ${r.status === 'CONFIRMED' ? 'st-pub' : r.status === 'CANCELLED' ? 'st-canc' : 'st-wait'}`}>
                    {r.status === 'CONFIRMED' ? 'Onaylı' : r.status === 'WAITLISTED' ? 'Bekleme Listesi' : 'İptal'}
                  </span>
                </td>
                <td>
                  {r.status !== 'CANCELLED' && (
                    <button className="btn-danger btn-sm" onClick={() => cancel(r)}>İptal Et</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}