import { useState } from 'react';
import { useStore, newId, formatIDR } from '../../lib/store';
import { Plus, Edit, Trash2, Save, X, Megaphone, Image as ImageIcon } from 'lucide-react';
import type { TextAd, BannerAd } from '../../lib/types';

export default function AdminAds() {
  const { db, update, currentUser } = useStore();
  if (!currentUser) return null;
  const me = currentUser;
  const [tab, setTab] = useState<'text' | 'banner'>('text');

  const [tForm, setTForm] = useState<Partial<TextAd>>({ title: '', description: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: db.settings.defaultRewardPerClick, status: 'approved' });
  const [bForm, setBForm] = useState<Partial<BannerAd>>({ title: '', imageUrl: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: 200, status: 'approved' });
  const [editId, setEditId] = useState<string | null>(null);

  function saveText(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      if (editId) {
        const ad = d.textAds.find(x => x.id === editId);
        if (ad) Object.assign(ad, tForm);
      } else {
        d.textAds.push({
          id: newId('ad'),
          ownerId: me.id,
          title: tForm.title!, description: tForm.description!, url: tForm.url!,
          pricePaid: 0,
          clicksBought: tForm.clicksBought!, clicksRemaining: tForm.clicksRemaining ?? tForm.clicksBought!,
          reward: tForm.reward!, status: 'approved', createdAt: Date.now(),
        });
      }
      return d;
    });
    setTForm({ title: '', description: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: db.settings.defaultRewardPerClick, status: 'approved' });
    setEditId(null);
  }

  function saveBanner(e: React.FormEvent) {
    e.preventDefault();
    update(d => {
      if (editId) {
        const ad = d.bannerAds.find(x => x.id === editId);
        if (ad) Object.assign(ad, bForm);
      } else {
        d.bannerAds.push({
          id: newId('ban'),
          ownerId: me.id,
          title: bForm.title!, imageUrl: bForm.imageUrl!, url: bForm.url!,
          pricePaid: 0,
          clicksBought: bForm.clicksBought!, clicksRemaining: bForm.clicksRemaining ?? bForm.clicksBought!,
          reward: bForm.reward!, status: 'approved', createdAt: Date.now(),
        });
      }
      return d;
    });
    setBForm({ title: '', imageUrl: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: 200, status: 'approved' });
    setEditId(null);
  }

  function del(kind: 'text' | 'banner', id: string) {
    if (!confirm('Hapus iklan ini?')) return;
    update(d => {
      if (kind === 'text') d.textAds = d.textAds.filter(a => a.id !== id);
      else d.bannerAds = d.bannerAds.filter(a => a.id !== id);
      return d;
    });
  }

  function startEditText(a: TextAd) { setEditId(a.id); setTab('text'); setTForm({ ...a }); }
  function startEditBan(a: BannerAd) { setEditId(a.id); setTab('banner'); setBForm({ ...a }); }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="stamp text-rust mb-3">Kelola Iklan</div>
      <h1 className="font-display text-4xl font-bold">Iklan Platform</h1>
      <p className="mt-2 text-ink-soft">Tambah, edit, dan kelola jumlah klik serta reward iklan.</p>

      <div className="flex gap-2 mt-6 border-b-2 border-ink pb-1">
        <button onClick={() => { setTab('text'); setEditId(null); }} className={`px-4 py-2 font-semibold text-sm border-2 border-ink border-b-0 flex items-center gap-2 ${tab === 'text' ? 'bg-ink text-paper' : 'bg-cream'}`}><Megaphone className="w-4 h-4" /> Iklan Teks ({db.textAds.length})</button>
        <button onClick={() => { setTab('banner'); setEditId(null); }} className={`px-4 py-2 font-semibold text-sm border-2 border-ink border-b-0 flex items-center gap-2 ${tab === 'banner' ? 'bg-ink text-paper' : 'bg-cream'}`}><ImageIcon className="w-4 h-4" /> Banner ({db.bannerAds.length})</button>
      </div>

      {tab === 'text' && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <form onSubmit={saveText} className="ticket p-6">
            <h2 className="font-display text-xl font-bold mb-3">{editId ? 'Edit' : 'Tambah'} Iklan Teks</h2>
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Judul</span><input className="input-field mt-1" value={tForm.title || ''} onChange={e => setTForm({ ...tForm, title: e.target.value })} required /></label>
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Deskripsi</span><textarea className="input-field mt-1" rows={2} value={tForm.description || ''} onChange={e => setTForm({ ...tForm, description: e.target.value })} required /></label>
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">URL</span><input className="input-field mt-1" type="url" value={tForm.url || ''} onChange={e => setTForm({ ...tForm, url: e.target.value })} required /></label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Total Klik</span><input type="number" className="input-field mt-1" value={tForm.clicksBought || 0} onChange={e => setTForm({ ...tForm, clicksBought: parseInt(e.target.value) || 0 })} /></label>
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Sisa</span><input type="number" className="input-field mt-1" value={tForm.clicksRemaining ?? 0} onChange={e => setTForm({ ...tForm, clicksRemaining: parseInt(e.target.value) || 0 })} /></label>
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Reward</span><input type="number" className="input-field mt-1" value={tForm.reward || 0} onChange={e => setTForm({ ...tForm, reward: parseInt(e.target.value) || 0 })} /></label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-amber"><Save className="w-4 h-4" /> {editId ? 'Simpan' : 'Tambah'}</button>
              {editId && <button type="button" onClick={() => { setEditId(null); setTForm({ title: '', description: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: db.settings.defaultRewardPerClick }); }} className="btn-ghost"><X className="w-4 h-4" /> Batal</button>}
            </div>
          </form>

          <div className="space-y-3">
            {db.textAds.map(a => (
              <div key={a.id} className="ticket p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold">{a.title}</h3>
                      <span className={`stamp ${a.status === 'approved' ? 'text-forest' : a.status === 'pending' ? 'text-amber-deep' : 'text-berry'}`}>{a.status}</span>
                    </div>
                    <p className="text-sm text-ink-soft">{a.description}</p>
                    <div className="font-mono text-xs mt-1">{a.clicksRemaining}/{a.clicksBought} klik · {formatIDR(a.reward)}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEditText(a)} className="btn-ghost !py-1.5 !px-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => del('text', a.id)} className="btn-ghost !py-1.5 !px-2 !text-berry !border-berry"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'banner' && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <form onSubmit={saveBanner} className="ticket p-6">
            <h2 className="font-display text-xl font-bold mb-3">{editId ? 'Edit' : 'Tambah'} Banner</h2>
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">Judul</span><input className="input-field mt-1" value={bForm.title || ''} onChange={e => setBForm({ ...bForm, title: e.target.value })} required /></label>
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">URL Gambar</span><input className="input-field mt-1" type="url" value={bForm.imageUrl || ''} onChange={e => setBForm({ ...bForm, imageUrl: e.target.value })} required /></label>
            {bForm.imageUrl && <img src={bForm.imageUrl} alt="" className="w-full h-28 object-cover border-2 border-ink mb-3" />}
            <label className="block mb-3"><span className="font-mono text-xs uppercase tracking-widest">URL Tujuan</span><input className="input-field mt-1" type="url" value={bForm.url || ''} onChange={e => setBForm({ ...bForm, url: e.target.value })} required /></label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Total Klik</span><input type="number" className="input-field mt-1" value={bForm.clicksBought || 0} onChange={e => setBForm({ ...bForm, clicksBought: parseInt(e.target.value) || 0 })} /></label>
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Sisa</span><input type="number" className="input-field mt-1" value={bForm.clicksRemaining ?? 0} onChange={e => setBForm({ ...bForm, clicksRemaining: parseInt(e.target.value) || 0 })} /></label>
              <label className="block"><span className="font-mono text-xs uppercase tracking-widest">Reward</span><input type="number" className="input-field mt-1" value={bForm.reward || 0} onChange={e => setBForm({ ...bForm, reward: parseInt(e.target.value) || 0 })} /></label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-amber"><Plus className="w-4 h-4" /> {editId ? 'Simpan' : 'Tambah'}</button>
              {editId && <button type="button" onClick={() => { setEditId(null); setBForm({ title: '', imageUrl: '', url: '', clicksBought: 100, clicksRemaining: 100, reward: 200 }); }} className="btn-ghost"><X className="w-4 h-4" /> Batal</button>}
            </div>
          </form>

          <div className="space-y-3">
            {db.bannerAds.map(a => (
              <div key={a.id} className="ticket p-4 flex gap-3">
                <img src={a.imageUrl} className="w-24 h-16 object-cover border-2 border-ink" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{a.title}</h3>
                    <span className={`stamp ${a.status === 'approved' ? 'text-forest' : a.status === 'pending' ? 'text-amber-deep' : 'text-berry'}`}>{a.status}</span>
                  </div>
                  <div className="font-mono text-xs">{a.clicksRemaining}/{a.clicksBought} klik · {formatIDR(a.reward)}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEditBan(a)} className="btn-ghost !py-1.5 !px-2"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => del('banner', a.id)} className="btn-ghost !py-1.5 !px-2 !text-berry !border-berry"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
