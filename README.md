# 📢 ElonUz — O'zbekiston e'lonlar platformasi (to'liq versiya)

OLX/Avtoelon uslubidagi, ishga to'liq tayyor e'lonlar platformasi.
Next.js 14 (App Router) + PostgreSQL + Prisma ORM asosida qurilgan.

## 🆕 Oxirgi yangilanish (muhim — ikkita buyruq talab qiladi)

Bu safar bazaga yangi jadval (`Favorite` — sevimlilar) qo'shildi, shuning
uchun **avval bazani yangilashingiz kerak**, aks holda sayt xato beradi:

```bash
npx prisma generate
npx prisma migrate dev --name add_favorites
```

(Agar oldingi "Avto ehtiyot qismlar" migratsiyasini hali qilmagan bo'lsangiz,
avval o'shani bajaring, keyin shuni.)

Bundan tashqari, 5 ta yangi funksiya qo'shildi:
- 🗺️ **Xarita orqali qidirish** — `/elonlar` sahifasida O'zbekiston viloyatlari xaritasi orqali vizual qidirish
- 🛡️ **Admin: e'lonlarni boshqarish** — `/admin` sahifasida istalgan e'lonni yashirish/qayta ko'rsatish yoki o'chirish
- ❤️ **Sevimlilar** — e'lonlarni saqlab, kabinetdagi "Sevimlilarim" sahifasida ko'rish
- 🔁 **O'xshash e'lonlar** — e'lon sahifasida bir xil kategoriyadagi boshqa e'lonlar
- 📤 **Ulashish tugmasi** — Telegram/WhatsApp'ga yoki havola sifatida nusxalash

## 🧱 Texnik stek

- **Freymvork:** Next.js 14 (App Router) — frontend va backend bitta loyihada
- **Ma'lumotlar bazasi:** PostgreSQL + Prisma ORM
- **Uslub:** Tailwind CSS, Lucide React ikonkalari, to'liq responsive
- **Tema:** Dark/Light (next-themes)
- **Autentifikatsiya:** JWT, httpOnly cookie orqali
- **Bildirishnomalar:** react-hot-toast

## 📁 To'liq loyiha tuzilmasi

```
elonuz-v2/
├── prisma/
│   └── schema.prisma              # User, Listing modellari + enumlar
├── src/
│   ├── middleware.js               # Himoyalangan sahifalarga erta yo'naltirish
│   ├── app/
│   │   ├── layout.jsx              # Ildiz layout
│   │   ├── providers.jsx           # Tema + Toast
│   │   ├── page.jsx                # Bosh sahifa
│   │   ├── not-found.jsx           # 404 sahifasi
│   │   ├── globals.css
│   │   ├── kirish/page.jsx                    # Login
│   │   ├── royxatdan-otish/page.jsx           # Register
│   │   ├── elonlar/
│   │   │   ├── page.jsx                        # Qidiruv/filtr/pagination
│   │   │   └── loading.jsx
│   │   ├── elon/[id]/
│   │   │   ├── page.jsx                        # E'lon tafsilotlari
│   │   │   ├── loading.jsx
│   │   │   └── tahrirlash/page.jsx             # Tahrirlash (faqat egasi)
│   │   ├── elon-qoshish/page.jsx               # Yangi e'lon qo'shish
│   │   ├── kabinet/page.jsx                    # Foydalanuvchi dashboard'i
│   │   ├── tariflar/page.jsx                   # Tarif tanlash/ariza
│   │   ├── admin/page.jsx                      # Admin panel (faqat role=ADMIN)
│   │   └── api/
│   │       ├── auth/{register,login,logout,me}/route.js
│   │       ├── subscription/request/route.js
│   │       ├── admin/pending-requests/route.js
│   │       ├── admin/approve-subscription/[userId]/route.js
│   │       └── listings/
│   │           ├── route.js                    # GET (filtr), POST (yaratish)
│   │           ├── my/route.js                 # Kabinet uchun ro'yxat
│   │           └── [id]/route.js                # GET/PUT/DELETE
│   ├── components/
│   │   ├── Navbar.jsx, Footer.jsx, ThemeToggle.jsx
│   │   ├── ListingCard.jsx, SearchBar.jsx, FilterBar.jsx, Pagination.jsx
│   │   ├── ListingForm.jsx          # Qo'shish/tahrirlash uchun umumiy forma
│   │   ├── ImageUrlInput.jsx        # Bir nechta rasm URL kiritish
│   │   ├── ImageGallery.jsx         # Tafsilotlar sahifasidagi galereya
│   │   ├── ContactActions.jsx       # Qo'ng'iroq/Telegram tugmalari
│   │   ├── MyListingsList.jsx       # Kabinetdagi o'chirish/tahrirlash
│   │   ├── TariffForm.jsx           # Tarif tanlash/ariza berish
│   │   └── AdminPanel.jsx           # Tasdiq kutayotgan arizalar
│   ├── context/AuthContext.jsx
│   └── lib/
│       ├── prisma.js, auth.js, validators.js, labels.js
│       ├── subscription.js          # Obuna muddati/holat tekshiruvi
│       └── telegram.js              # Telegram Bot API xabar yuborish
├── scripts/
│   └── make-admin.js                # Birinchi adminni tayinlash
```

## ✅ To'liq funksionallik ro'yxati

**Autentifikatsiya**
- Ro'yxatdan o'tish, kirish, chiqish — bcrypt + JWT (httpOnly cookie)
- Har bir yozish amalida server-side validatsiya

**E'lonlar**
- Yaratish: sarlavha, kategoriya, hudud, narx+valyuta, aloqa raqami, tavsif, **galereyadan to'g'ridan-to'g'ri rasm yuklash** (8 tagacha, Cloudinary orqali)
- Tahrirlash/o'chirish — faqat egasiga ruxsat (API darajasida VA sahifa darajasida tekshiriladi)
- Qidiruv (kalit so'z), kategoriya/hudud/narx oralig'i filtrlari, sahifalash (pagination)
- Tafsilotlar sahifasi: rasm galereyasi, ko'rishlar soni, muallif kartasi, qo'ng'iroq va Telegram tugmalari

**Tariflar va admin tasdiqlash (yangi)**
- `/tariflar` — 3 ta tarif: Boshlang'ich (bepul), Tadbirkor (50 000 so'm/oy), Biznes/Makler (120 000 so'm/oy)
- Tizimga kirgan foydalanuvchi tarif tanlab ariza beradi → holat `PENDING` bo'ladi → operatorga (Telegram bot) darhol xabar boradi
- `/admin` (faqat `role: ADMIN`) — tasdiq kutayotgan arizalar ro'yxati, "Tasdiqlash (1 oy)" tugmasi bosilgach obuna `ACTIVE` bo'lib, aniq 30 kunga uzaytiriladi
- Obuna muddati o'tib ketsa, keyingi kirishda avtomatik `EXPIRED`ga o'tadi
- "Biznes/Makler" tarifi faol bo'lgan foydalanuvchining har bir yangi e'loni avtomatik ⭐ VIP bo'lib, ro'yxatlarda birinchi qatorda chiqadi
- Birinchi adminni tayinlash: `node scripts/make-admin.js +998901234567`

**Foydalanuvchi kabineti**
- O'z e'lonlari ro'yxati, tahrirlash/o'chirish (joyida, sahifa qayta yuklanmasdan)
- Joriy obuna holati belgisi (faol/kutilmoqda/tugagan/bepul)

**Dizayn va UX**
- To'liq responsive (mobil/planshet/desktop), Admin panel mobilda kartochka / desktopda jadval
- Dark/Light tema, Toast bildirishnomalar, yuklanish skeletonlari, 404 sahifasi

**Xavfsizlik**
- Parollar bcrypt bilan xeshlanadi; JWT httpOnly cookie'da
- `middleware.js` — himoyalangan sahifalarga (`/kabinet`, `/elon-qoshish`, `/admin`, tahrirlash) erta yo'naltirish
- Har bir himoyalangan sahifa/API'da serverning o'zida ham qayta tekshiruv (rol va egalik)
- Admin endpointlari `role: ADMIN` bo'lmasa 403 qaytaradi
- Har joyda try/catch — server yoki tarmoq xatosi ilovani qulatmaydi

## 🚀 O'rnatish (bosqichma-bosqich)

### 1) PostgreSQL tayyorlash

Lokal PostgreSQL o'rnating yoki [Neon](https://neon.tech) /
[Supabase](https://supabase.com) kabi bepul bulutli xizmatdan bir daqiqada
baza oching.

### 2) Rasm saqlash (avtomatik, sozlash shart emas)

E'lon qo'shishda foydalanuvchi telefon/kompyuter **galereyasidan** rasm
tanlab yuklaydi. Bu rasmlar **Netlify Blobs**da (Netlify'ning o'z fayl
saqlash xizmati) saqlanadi — Netlify'ga joylashtirilganda **avtomatik
ishlaydi**, alohida hisob ochish yoki maxfiy kalit kiritish shart emas.

> Eslatma: avval Cloudinary xizmati ko'zda tutilgan edi, lekin u
> O'zbekistondan ro'yxatdan o'tishni bloklaydi ("geo_location_not_permitted"),
> shuning uchun Netlify'ning o'z xizmatiga o'tkazildi.

### 3) Sozlash

```bash
npm install
cp .env.example .env
```

`.env` faylida:

- `DATABASE_URL` — haqiqiy PostgreSQL manzilingiz
- `JWT_SECRET` — uzun, tasodifiy maxfiy matn
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — tarif arizalari uchun (ixtiyoriy, lekin tavsiya etiladi)

### 4) Bazani yaratish

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5) O'zingizni admin qiling (ixtiyoriy)

Avval saytda oddiy foydalanuvchi sifatida ro'yxatdan o'ting, so'ng:

```bash
node scripts/make-admin.js +998901234567
```

### 6) Ishga tushirish

```bash
npm run dev
```

`http://localhost:3000` ni oching — platforma to'liq ishlashga tayyor.

## 🌐 Internetga joylash (deploy)

```bash
npm run build
npm run start
```

Eng qulay variant — [Vercel](https://vercel.com) (Next.js'ning o'z kompaniyasi).
GitHub repo'ni ulab, quyidagilarni bajaring:

1. **Environment Variables** bo'limiga `DATABASE_URL`, `JWT_SECRET`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`ni kiriting.
2. `package.json`da `postinstall: "prisma generate"` skripti allaqachon
   qo'shilgan — Vercel `npm install` vaqtida buni avtomatik ishga
   tushiradi, alohida sozlash shart emas.
3. **Production bazada jadvallarni yaratish** — bu avtomatik amalga
   oshmaydi, bir marta qo'lda bajarish kerak:
   ```bash
   DATABASE_URL="production_baza_manzili" npx prisma migrate deploy
   ```
   (Buni o'z kompyuteringizdan, production `DATABASE_URL` bilan ishga tushirasiz.)
4. **Ulanishlar soni (connection pooling):** Vercel kabi serverless
   muhitda bir vaqtda ko'p so'rov kelsa, oddiy PostgreSQL ulanishi tezda
   tugab qolishi mumkin. [Neon](https://neon.tech) yoki
   [Supabase](https://supabase.com) ishlatsangiz, ular taqdim etadigan
   **pooler/pgbouncer** ulanish satridan (odatda "Connection pooling"
   deb nomlangan alohida URL) foydalaning — oddiy to'g'ridan-to'g'ri
   ulanish emas.
5. Birinchi marta joylagandan keyin, saytda o'zingiz uchun admin
   yaratishni unutmang (4-qadamdagi kabi, lekin production bazaga qarab).

## 📱 Mobil ilova (Android/iOS) — Capacitor orqali

Ilova alohida kod emas — u shunchaki sizning **jonli saytingizni** ko'rsatib
turadigan "qobiq" (WebView). Saytga har qanday yangilanish kiritsangiz
(server orqali), veb-brauzer HAM, Android ilova HAM, iPhone ilova HAM —
uchalasi bir vaqtda, avtomatik yangilanadi. Do'konga qayta yuborish faqat
ilova nomi/ikonkasi/ruxsatlarini o'zgartirganda yoki native funksiya
qo'shganda kerak bo'ladi.

### 1) Domenni ulash

`capacitor.config.js` faylini oching va `APP_URL` qatoridagi
`https://SIZNING-DOMENINGIZ.uz`ni haqiqiy production domeningizga
almashtiring (masalan `https://elonuz.uz`).

**Domen hali tayyor bo'lmasa** — telefoningizda sinab ko'rish uchun ikkita yo'l bor:
- **Lokal tarmoq:** kompyuteringiz va telefoningiz bir Wi-Fi'da bo'lsa,
  `npm run dev` ishlab turganda kompyuteringizning lokal IP manzilidan
  foydalaning (masalan `http://192.168.1.5:3000`) — buni `CAPACITOR_APP_URL`
  muhit o'zgaruvchisi orqali berásiz:
  ```bash
  CAPACITOR_APP_URL=http://192.168.1.5:3000 npx cap sync
  ```
- **Ngrok (tavsiya etiladi):** [ngrok.com](https://ngrok.com)dan bepul
  hisob oching, `ngrok http 3000` buyrug'ini bering — u sizga vaqtinchalik
  `https://xxxx.ngrok-free.app` havolasini beradi, shuni `CAPACITOR_APP_URL`
  sifatida ishlating. Bunday holda `cleartext` xavfsizlik cheklovi
  muammo qilmaydi, chunki ngrok HTTPS beradi.

### 2) Kerakli paketlarni o'rnatish

```bash
npm install
```

(`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
allaqachon `package.json`ga qo'shilgan.)

### 3) Android va iOS "qobiqlarini" yaratish (bir martalik)

```bash
npm run cap:add:android
npm run cap:add:ios
```

Bu `android/` va `ios/` papkalarini yaratadi — bular native loyihalar,
Git'ga qo'shib qo'yish tavsiya etiladi.

### 4) Sozlamalarni native loyihalarga singdirish

Har safar `capacitor.config.js`ni o'zgartirganingizda (masalan domenni
almashtirganda), shuni ishga tushiring:

```bash
npm run cap:sync
```

**Muhim farq:** oddiy kontent (matn, e'lonlar, dizayn) o'zgarishi uchun
`cap:sync` shart EMAS — chunki ilova jonli saytni ko'rsatadi, kontent
serverdan real vaqtda keladi. `cap:sync` faqat native sozlamalar
(domen manzili, ilova nomi, plaginlar) o'zgarganda kerak.

### 5) Android'da ishga tushirish va sinash

```bash
npm run cap:open:android
```

Bu buyruq Android Studio'ni ochadi (avval [Android Studio](https://developer.android.com/studio)
o'rnatilgan bo'lishi kerak). Ochilgach, yuqoridagi ▶️ "Run" tugmasini
bosib, ulangan telefon yoki emulyatorda sinab ko'rasiz.

### 6) iOS'da ishga tushirish (faqat Mac kompyuterda)

```bash
npm run cap:open:ios
```

Bu [Xcode](https://developer.apple.com/xcode/)ni ochadi (Mac va Xcode
talab qilinadi — Windows'da iOS ilova qurib bo'lmaydi, bu Apple'ning
o'z cheklovi).

### 7) Ilova ikonkasi va yuklanish ekrani (splash screen)

Sizning logotipingiz asosida tayyorlangan rasmlar allaqachon `public/`
papkasida (`icon-512.png`). Barcha o'lchamlardagi ikonka/splash
fayllarini avtomatik yaratish uchun:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#04060b' --splashBackgroundColor '#04060b'
```

(Fon rangi sifatida logotipingizdagi qora rangni ishlatdik — `#04060b`.)

### 8) Play Market va App Store'ga chiqarish (yuqori darajadagi qadamlar)

Bu alohida, biroz uzunroq jarayon — qisqacha:

- **Google Play:** [Google Play Console](https://play.google.com/console)da
  hisob oching ($25, bir martalik). Android Studio'da "Build > Generate
  Signed App Bundle" orqali `.aab` fayl tayyorlaysiz va Play Console'ga
  yuklaysiz.
- **App Store:** [Apple Developer](https://developer.apple.com/programs/)
  hisobi kerak ($99/yil). Xcode'da "Archive" qilib, App Store Connect
  orqali yuborasiz.

Bu bosqichga yetganingizda, aynan sizning holatingizga qarab
(ekran suratlari, tavsif matni, kategoriya tanlash va h.k.) batafsil
yordam beraman — shunchaki ayting.

## ⚠️ Ushbu muhitda nima tekshirilgan (ochiq va aniq)

- ✅ **Barcha 30+ JS/JSX fayl** `next build` orqali sintaksis jihatdan
  tekshirildi: **"Compiled successfully"** — hech qanday sintaksis xatosi yo'q.
- ❌ **Prisma Client generatsiyasi va haqiqiy PostgreSQL bilan ishlash** bu
  qumli quti (sandbox) muhitida tekshirilmadi, chunki tarmoq faqat
  cheklangan domenlarga ruxsat beradi va Prisma'ning binar fayl manzili
  (`binaries.prisma.sh`) bu ro'yxatda yo'q. Buni **soxta (mock) Prisma
  Client bilan to'liq build qilishga harakat qildim**, lekin modul
  format nomuvofizligi tufayli bu ham to'liq muvaffaqiyatli bo'lmadi —
  vaqtni behuda sarflamaslik uchun to'xtatdim.
- ➡️ **Tavsiya:** o'zingizning kompyuteringizda oddiy internet ulanishi
  bilan `npx prisma generate` va `npx prisma migrate dev` ishga
  tushirilganda muammosiz ishlashi kerak (bu standart, keng qo'llaniladigan
  Prisma buyruqlari), lekin **birinchi marta ishga tushirganda albatta har
  bir sahifani qo'lda sinab ko'ring** — ayniqsa ro'yxatdan o'tish → e'lon
  qo'shish → tahrirlash → o'chirish to'liq zanjirini.

## 🔮 Kelajakda qo'shsa bo'ladigan narsalar

- E'lonlar moderatsiyasi (admin panelda e'lonlarni yopish/o'chirish huquqi)
- Sevimlilar (bookmark) funksiyasi
- SMS orqali telefon raqamni tasdiqlash
- "Tadbirkor" tarifi uchun oylik VIP e'lon kvotasi (hozircha faqat "Biznes" avtomatik VIP oladi)
# elonuzbekistan
