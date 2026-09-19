// app/api/upload/[key]/route.js - Netlify Blobs'da saqlangan rasmni qaytaradi
import { getStore } from '@netlify/blobs';

export async function GET(request, { params }) {
  try {
    const store = getStore('listing-images');
    const result = await store.getWithMetadata(params.key, { type: 'arrayBuffer' });

    if (!result) {
      return new Response('Rasm topilmadi', { status: 404 });
    }

    const contentType = result.metadata?.contentType || 'image/jpeg';

    return new Response(result.data, {
      headers: {
        'Content-Type': contentType,
        // Rasm hech qachon o'zgarmaydi (har bir yuklash yangi nom oladi),
        // shuning uchun uzoq muddatga keshlashimiz mumkin
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error("Rasmni olishda xatolik:", err);
    return new Response('Rasmni yuklab bo\'lmadi', { status: 500 });
  }
}
