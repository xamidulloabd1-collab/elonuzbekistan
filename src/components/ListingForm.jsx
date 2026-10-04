'use client';
// components/ListingForm.jsx - E'lon qo'shish VA tahrirlash uchun umumiy forma
// mode="create" -> POST /api/listings
// mode="edit"   -> PUT /api/listings/:id (listingId talab qilinadi)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Star, Sparkles } from 'lucide-react';
import { CATEGORY_LABELS, REGION_LABELS, PLAN_LABELS } from '@/lib/labels';
import { CURRENCIES } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from './ImageUploader';
import { LocationPicker } from './map';
import ListingQualityMeter from './ListingQualityMeter';
import { DISTRICTS } from '@/data/districts';

const emptyForm = {
  title: '', description: '', category: '', region: '',
  price: '', currency: 'UZS', contactPhone: '', images: [],
  latitude: null, longitude: null,
  district: '', exchangeable: false, installment: false,
};

const VIP_QUOTA = { BIZNES: null, TADBIRKOR: 3 }; // null = cheklovsiz

export default function ListingForm({ mode, listingId, initialData }) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Foydalanuvchining hozir FAOL (muddati o'tmagan) pullik tarifi bor-yo'qligini
  // va agar bor bo'lsa, qancha VIP kvotasi qolganini hisoblaymiz - shu asosida
  // "VIP qilib joylash" tanlovini ko'rsatamiz yoki ko'rsatmaymiz.
  const isActivePlan =
    user?.subscriptionStatus === 'ACTIVE' &&
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  const plan = user?.subscriptionPlan;
  const quota = plan ? VIP_QUOTA[plan] : undefined;
  const planRemaining = quota === null ? null : quota !== undefined ? Math.max(0, quota - (user?.vipListingsUsed || 0)) : 0;
  const hasPlanQuota = isActivePlan && (quota === null || planRemaining > 0);

  // Referal orqali tekkan bepul VIP kredit - faol tarifsiz ham VIP berish imkonini beradi
  const bonusCredits = user?.bonusVipCredits || 0;

  const canOfferVip = mode === 'create' && (hasPlanQuota || bonusCredits > 0);

  // Kvotasi bo'lsa, standart holatda VIP belgilangan bo'lsin (foydalanuvchi xohlasa o'chiradi)
  const [wantVip, setWantVip] = useState(true);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      // Hudud o'zgarsa - eski tuman endi mos kelmaydi
      ...(name === 'region' ? { district: '' } : {}),
    }));
  }

  async function writeWithAi() {
    if ((form.title || '').trim().length < 3) {
      toast.error('Avval sarlavhani yozing (masalan: "Cobalt 2019, oq")');
      return;
    }
    if ((form.description || '').trim().length > 30 && !window.confirm("Hozirgi tavsif yangisi bilan almashtiriladi. Davom etasizmi?")) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((f) => ({ ...f, description: data.description }));
      toast.success(
        data.description.includes('[')
          ? "Tavsif tayyor ✨ [qavs] ichidagi joylarni o'zingiz to'ldiring"
          : 'Tavsif tayyor ✨ Tekshirib, kerak bo\'lsa tahrirlang'
      );
    } catch (err) {
      toast.error(err.message || "Tavsif yozib bo'lmadi");
    } finally {
      setAiLoading(false);
    }
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
      const payload = canOfferVip ? { ...form, wantVip } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Xatolik yuz berdi");
        return;
      }

      toast.success(mode === 'edit' ? "E'lon yangilandi" : "E'lon muvaffaqiyatli joylandi");
      if (mode === 'create') refreshUser(); // qolgan VIP kvota/bonus kredit yangilansin
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
      <ListingQualityMeter form={form} />

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

      {form.region && DISTRICTS[form.region] && (
        <div>
          <label className="block font-semibold mb-1">Tuman / shahar <span className="font-normal text-gray-400">(tavsiya etiladi)</span></label>
          <select name="district" value={form.district || ''} onChange={handleChange} className="input-field">
            <option value="">Tanlang</option>
            {DISTRICTS[form.region].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
        </div>
      )}

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

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
          <input type="checkbox" name="installment" checked={Boolean(form.installment)} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
          💳 Bo'lib to'lash bor
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
          <input type="checkbox" name="exchangeable" checked={Boolean(form.exchangeable)} onChange={handleChange} className="w-4 h-4 accent-purple-600" />
          🔄 Almashtirishga roziman
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="block font-semibold">Batafsil tavsif *</label>
          <button
            type="button"
            onClick={writeWithAi}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-brand-500 text-white disabled:opacity-60"
          >
            <Sparkles size={14} /> {aiLoading ? 'Yozilmoqda...' : 'Tavsifni yozib ber'}
          </button>
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} rows="5" placeholder="Mahsulot/xizmat haqida to'liq ma'lumot..." className="input-field" />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-1">Xaritadagi joylashuv <span className="font-normal text-gray-400">(ixtiyoriy)</span></label>
        <p className="text-xs text-gray-400 mb-2">Belgilasangiz, e'loningiz "🗺 Xarita" bo'limida ham chiqadi va xaridorlar uni osonroq topadi.</p>
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          region={form.region}
          onChange={(latitude, longitude) => setForm((f) => ({ ...f, latitude, longitude }))}
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-1">Rasmlar</label>
        <ImageUploader images={form.images} onChange={handleImagesChange} />
      </div>

      {/* VIP/oddiy tanlovi - faqat FAOL pullik tarifi yoki bonus VIP krediti bor
          foydalanuvchilarga, faqat yangi e'lon qo'shishda ko'rsatiladi */}
      {canOfferVip && (
        <label
          className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition ${
            wantVip
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10'
              : 'border-gray-200 dark:border-white/10'
          }`}
        >
          <input
            type="checkbox"
            checked={wantVip}
            onChange={(e) => setWantVip(e.target.checked)}
            className="mt-1 w-5 h-5 accent-yellow-500 shrink-0"
          />
          <span>
            <span className="font-bold flex items-center gap-1.5">
              <Star size={16} className="text-yellow-500" fill="currentColor" />
              Bu e'lonni VIP qilib joylash
            </span>
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {hasPlanQuota ? (
                <>
                  {PLAN_LABELS[plan]} tarifingiz bor —{' '}
                  {quota === null
                    ? "e'loningiz ro'yxat boshida, ⭐ belgi bilan chiqadi (cheklovsiz)."
                    : `shu oy uchun ${planRemaining} ta VIP joylashtirish huquqingiz qoldi.`}
                </>
              ) : (
                <>🎁 Sizda {bonusCredits} ta referal orqali tekkan bepul VIP kredit bor.</>
              )}
              {' '}Xohlamasangiz, belgini olib tashlab, oddiy e'lon sifatida joylashingiz mumkin.
            </span>
          </span>
        </label>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
        {submitting ? "Saqlanmoqda..." : mode === 'edit' ? "💾 O'zgarishlarni saqlash" : "✅ E'lonni joylash"}
      </button>
    </form>
  );
}
