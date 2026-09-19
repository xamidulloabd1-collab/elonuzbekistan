'use client';
// components/ListingForm.jsx - E'lon qo'shish VA tahrirlash uchun umumiy forma
// mode="create" -> POST /api/listings
// mode="edit"   -> PUT /api/listings/:id (listingId talab qilinadi)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CATEGORY_LABELS, REGION_LABELS } from '@/lib/labels';
import { CURRENCIES } from '@/lib/validators';
import ImageUploader from './ImageUploader';

const emptyForm = {
  title: '', description: '', category: '', region: '',
  price: '', currency: 'UZS', contactPhone: '', images: [],
};

export default function ListingForm({ mode, listingId, initialData }) {
  const [form, setForm] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImagesChange(images) {
    setForm({ ...form, images });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const url = mode === 'edit' ? `/api/listings/${listingId}` : '/api/listings';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Xatolik yuz berdi");
        return;
      }

      toast.success(mode === 'edit' ? "E'lon yangilandi" : "E'lon muvaffaqiyatli joylandi");
      router.push(`/elon/${data.listing.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6 flex flex-col gap-4">
      <div>
        <label className="block font-semibold mb-1">Sarlavha *</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Masalan: Chevrolet Cobalt, 2021" className="input-field" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Kategoriya *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field">
            <option value="">Tanlang</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Hudud *</label>
          <select name="region" value={form.region} onChange={handleChange} className="input-field">
            <option value="">Tanlang</option>
            {Object.entries(REGION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Narx *</label>
          <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0" className="input-field" />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Valyuta</label>
          <select name="currency" value={form.currency} onChange={handleChange} className="input-field">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c === 'UZS' ? "so'm" : '$ (USD)'}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Aloqa raqami *</label>
        <input name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} placeholder="+998901234567" className="input-field" />
        {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-1">Batafsil tavsif *</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows="5" placeholder="Mahsulot/xizmat haqida to'liq ma'lumot..." className="input-field" />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-1">Rasmlar</label>
        <ImageUploader images={form.images} onChange={handleImagesChange} />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
        {submitting ? "Saqlanmoqda..." : mode === 'edit' ? "💾 O'zgarishlarni saqlash" : "✅ E'lonni joylash"}
      </button>
    </form>
  );
}
