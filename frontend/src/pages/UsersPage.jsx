import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await api.listUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const roleCls = (r) => r === 'ADMIN' ? 'st-pub' : r === 'ORGANIZER' ? 'st-wait' : 'st-draft';
  const roleLabel = (r) => r === 'ADMIN' ? 'Yönetici' : r === 'ORGANIZER' ? 'Organizatör' : 'Katılımcı';

  return (
    <section className="page">
      <div className="page-head"><h2>Kullanıcılar</h2></div>
      {error && <div className="alert err">{error}</div>}
      {loading ? <div className="spinner">Yükleniyor...</div> : [
        <table className="table" key="t">
          <thead><tr><th>#</th><th>Kullanıcı adı</th><th>Ad Soyad</th><th>E-posta</th><th>Rol</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>@{u.username}</strong></td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td><span className={`status ${roleCls(u.role)}`}>{roleLabel(u.role)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ]}
    </section>
  );
}