'use client';
// components/PrintButton.jsx - Sahifani chop etish tugmasi
export default function PrintButton({ label = '🖨 Chop etish' }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary !py-2 !px-5 !text-sm">
      {label}
    </button>
  );
}
