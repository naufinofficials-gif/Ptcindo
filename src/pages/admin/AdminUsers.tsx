import { useStore, formatIDR } from '../../lib/store';
import { Ban, CheckCircle2, Trash2, User as UserIcon } from 'lucide-react';

export default function AdminUsers() {
  const { db, update, currentUser } = useStore();
  if (!currentUser) return null;
  const members = db.users.filter(u => u.role === 'member');

  function toggleBan(id: string) {
    update(d => {
      const u = d.users.find(x => x.id === id);
      if (u) u.banned = !u.banned;
      return d;
    });
  }

  function remove(id: string) {
    if (!confirm('Hapus member ini secara permanen?')) return;
    update(d => {
      d.users = d.users.filter(x => x.id !== id);
      return d;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Kelola Member</div>
      <h1 className="font-display text-4xl font-bold">Daftar Member ({members.length})</h1>

      <div className="ticket mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink text-paper font-mono text-xs uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-right">Account</th>
              <th className="px-4 py-3 text-right">Sewa</th>
              <th className="px-4 py-3 text-center">Ref</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map(u => (
              <tr key={u.id} className="border-t border-ink/10">
                <td className="px-4 py-3 flex items-center gap-2"><UserIcon className="w-4 h-4" /><span className="font-bold">{u.username}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3 text-right font-mono">{formatIDR(u.accountBalance)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatIDR(u.rentBalance)}</td>
                <td className="px-4 py-3 text-center font-mono">{u.referrals.length}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`stamp ${u.banned ? 'text-berry' : 'text-forest'}`}>{u.banned ? 'banned' : 'aktif'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => toggleBan(u.id)} className="btn-ghost !py-1.5 !px-2" title={u.banned ? 'Aktifkan' : 'Banned'}>
                      {u.banned ? <CheckCircle2 className="w-4 h-4 text-forest" /> : <Ban className="w-4 h-4 text-berry" />}
                    </button>
                    <button onClick={() => remove(u.id)} className="btn-ghost !py-1.5 !px-2 !text-berry !border-berry" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
