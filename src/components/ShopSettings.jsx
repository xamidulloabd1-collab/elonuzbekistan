'use client';
// components/ShopSettings.jsx - Sozlamalardagi "Do'kon sahifasi" bo'limi (Biznes tarifi)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ShopSettings() {
  const { user } = useAuth();
  const [state, setState] = useState(null); // { allowed, shop }
  const [form, setForm] = useState({ shopName: '', shopLogo: '', shopAddress: '', shopHours: '', shopDescription: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/profile/shop', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setState(d);
        if (d.shop) setForm(Object.fromEntries(Object.entries(d.shop).map(([k, v]) => [k, v || ''])));
      })
      .catch(() => {});
  }, []);

  async function uploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((f) => ({ ...f, shopLogo: data.url }));
    } catch (err) {
      toast.error(err.message || "Logoni yuklab bo'lmadi");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  }

  if (!state) return null;

  if (!state.allowed) {
    return (
      <div className="card p-5 sm:p-6 mb-6">
        <h2 className="font-bold text-lg mb-1">🏪 Do'kon sahifasi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Logo, manzil, ish vaqti va barcha e'lonlaringiz bitta chiroyli sahifada. Biznes/Makler tarifida mavjud.
        </p>
        <Link href="/tariflar" className="btn-primary inline-block !py-2 !px-4 !text-sm">Tariflarni ko'rish</Link>
      </div>
    );
  }

  const field = (name, label, props = {}) => (
    <div>
      <label className="block font-semibold mb-1 text-sm">{label}</label>
      {props.textarea ? (
        <textarea value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} rows={3} maxLength={props.max} className="input-field" placeholder={props.placeholder} />
      ) : (
        <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} maxLength={props.max} className="input-field" placeholder={props.placeholder} />
      )}
    </div>
  );

  return (
    <form onSubmit={save} className="card p-5 sm:p-6 flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-lg">🏪 Do'kon sahifasi</h2>
        {user && (
          <Link href={`/sotuvchi/${user.id}`} target="_blank" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Ko'rish →
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {form.shopLogo ? <img src={form.shopLogo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="btn-secondary !py-2 !px-4 !text-sm cursor-pointer">
            {uploading ? 'Yuklanmoqda...' : 'Logo yuklash'}
            <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" disabled={uploading} />
          </label>
          {form.shopLogo && (
            <button type="button" onClick={() => setForm({ ...form, shopLogo: '' })} className="text-xs text-gray-400 hover:text-red-500 text-left">
              Logoni olib tashlash
            </button>
          )}
        </div>
      </div>

      {field('shopName', "Do'kon nomi", { max: 60, placeholder: 'Masalan: Qarshi Avto Savdo' })}
      {field('shopAddress', 'Manzil', { max: 160, placeholder: "Masalan: Qarshi sh., Mustaqillik ko'chasi 12" })}
      {field('shopHours', 'Ish vaqti', { max: 80, placeholder: 'Masalan: Du–Sha 9:00–19:00' })}
      {field('shopDescription', "Do'kon haqida", { max: 600, textarea: true, placeholder: 'Nima bilan shug\'ullanasiz, qanday afzalliklaringiz bor' })}

      <button type="submit" disabled={saving} className="btn-primary self-start">
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  );
}
