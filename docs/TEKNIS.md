# Dokumentasi Teknis Clarity

Dokumen ini untuk pengembang dan juri yang ingin tahu cara Clarity bekerja di balik layar: arsitektur, cara pemeriksa
pesan menilai, kontrak API, langkah keamanan, cara menambah konten, dan pengujiannya. Petunjuk pemakaian dan cara
menjalankan ada di [README](../README.md).

## Arsitektur

Clarity adalah aplikasi Next.js (App Router). Hampir semuanya berjalan di browser. Server hanya dipakai untuk dua API
route yang memanggil AI, karena hanya di situ kunci API boleh berada.

```
Browser                                              Server (Next.js)            Pihak ketiga
───────────────────────────────────────────────      ────────────────────────    ────────────
Cek Pesan ── lib/analyze.ts (aturan, tanpa jaringan)
     │
     └─ tombol "Kirim ke AI" ── redact() ──────────▶ /api/periksa ── redact() ─▶ Groq API
Simulasi ──────────────────────────────────────────▶ /api/simulasi ─ redact() ─▶ Groq API
Latihan, Peta, Amankan, Sudah Terlanjur? ── data statis di lib/
Meja 3D ── three.js + lib/desk.ts (hiasan; tanpa WebGL jatuh ke daftar tombol)
```

Prinsip pembagiannya:

- **Konten dipisah dari tampilan.** Aturan, skenario, langkah, dan pengaturan ada di `lib/` sebagai data biasa.
  Komponen di `app/` hanya menampilkannya.
- **Logika tanpa DOM bisa diuji di Node.** `lib/analyze.ts`, `lib/peta.ts`, dan `lib/desk.ts` tidak bergantung pada
  React atau three.js, jadi diuji langsung dengan `node --test`.
- **Kode server terpisah.** `lib/groq.ts` memegang kunci API dan hanya diimpor oleh route handler. `lib/ai.ts` (penyamaran
  data dan persona) tidak menyentuh jaringan, jadi aman dipakai di browser maupun server.

## Struktur folder

```
app/
  layout.tsx            kerangka HTML, font, skrip tema terang/gelap (dijalankan sebelum render agar tidak berkedip)
  page.tsx              halaman depan: meja 3D
  world.tsx             meja 3D, dipasang di layout root: pindah halaman cukup menggerakkan kamera
  world-scene.ts        adegan three.js: model, kamera, animasi
  world-phone.ts        hape di atas meja yang menampilkan pesan masuk
  world-ink.ts          efek garis tinta ala buku cerita
  checker.tsx           antarmuka Cek Pesan (hasil, stabilo, cek tautan, kirim ke WhatsApp)
  ai-opinion.tsx        kartu pendapat kedua dari AI
  contoh.tsx            contoh hasil pemeriksa asli untuk pesan fiktif
  marked.tsx            teks dengan stabilo sesuai rentang yang ditandai
  lembar.tsx, stamp.tsx lembar kertas dan cap hasil
  tema.tsx              tombol tema terang/gelap
  periksa/ latihan/ simulasi/ amankan/ bertindak/ peta/   satu folder per halaman (page.tsx + komponennya)
  api/periksa/route.ts  POST: pendapat kedua AI untuk Cek Pesan
  api/simulasi/route.ts POST: balasan penipu dan penilaian akhir Simulasi
lib/
  analyze.ts            aturan pendeteksi, pengecek tautan, perhitungan skor
  peta.ts               lima bagian Peta Tipuan dan pemetaan aturan ke bagiannya
  scenarios.ts          11 situasi Latihan
  situations.ts         daftar periksa Sudah Terlanjur?, templat peringatan, saluran lapor resmi
  kunci.ts              11 pengaturan Amankan Akun dan usulan kata sandi keluarga
  ai.ts                 tipe data AI, penyamaran data, 7 persona Simulasi (browser dan server)
  groq.ts               pemanggil Groq, pembatas permintaan, penanganan galat (hanya server)
  desk.ts               aturan meja 3D yang bisa diuji tanpa three.js
  *.test.ts             uji unit
public/models/kenney/   model 3D meja (CC0, lisensi di folder yang sama)
```

## Cek Pesan: cara menilai

Semua ada di `lib/analyze.ts` dan berjalan di browser. Tidak ada yang dikirim ke mana pun.

1. **Teks dipotong** ke 5.000 karakter (`MAX_LENGTH`).
2. **Setiap aturan di `RULES` dicocokkan** dengan regex-nya. Aturan punya `id`, `label`, `why` (alasan yang ditampilkan),
   `tip` (langkah aman), dan `weight` 1 sampai 3.
3. **Kalimat peringatan tidak dihitung.** Kalau 16 karakter sebelum kecocokan berisi "jangan", "tidak pernah", "bukan",
   atau "never", kecocokan dilewati. Jadi "jangan berikan OTP ke siapa pun" tidak dianggap meminta OTP.
4. **Konteks dari pengguna ikut dihitung.** Pilihan seperti "Pengirimnya tidak kukenal" (`CONTEXT`) menyalakan aturan
   yang sama walau teksnya tidak cocok, dan tidak pernah dihitung dua kali.
5. **Setiap tautan diperiksa** oleh `checkLink()`:

   | Ciri | Bobot |
   | --- | --- |
   | Angka IP sebagai alamat, punycode (`xn--`), nama merek di domain yang bukan domain resminya, file `.apk` | 3 |
   | Tautan pendek (bit.ly, s.id, dan lainnya), akhiran domain murah (.xyz, .top, dan lainnya), tanda `@` di alamat | 2 |
   | Dua tanda hubung atau lebih, tanpa `https` | 1 |

   Bobot tautan dibatasi 3. Daftar merek resmi ada di `BRANDS` (bank, e-commerce, e-wallet, kurir, lembaga pemerintah).
6. **Skor** adalah jumlah bobot semua tanda, lalu diubah jadi tingkat:

   | Skor | Tingkat | Yang tampil |
   | --- | --- | --- |
   | 0 | 0 | Belum ada pola yang cocok (dengan catatan bahwa ini bukan jaminan aman) |
   | 1–2 | 1 | Perlu dicek lagi |
   | 3–5 | 2 | Waspada |
   | 6+ | 3 | Sangat mencurigakan |

7. **Hasil** berisi daftar tanda (urut dari bobot terbesar), rentang teks untuk stabilo, dan laporan tiap tautan.
   `stagesFor()` di `lib/peta.ts` lalu memetakan tanda ke bagian Peta Tipuan yang cocok, sehingga hasil bisa menautkan
   ke `/peta#desakan` dan seterusnya.

## API

Kedua route mengembalikan JSON. Galat selalu berbentuk `{ "error": "<pesan dalam bahasa Indonesia>" }`.

### `POST /api/periksa`

Pendapat kedua AI untuk Cek Pesan.

```json
{ "text": "Selamat! Anda terpilih ..." }
```

`text` wajib, maksimal 4.000 karakter. Respons:

```json
{
  "level": 2,
  "ringkasan": "Pesan ini kemungkinan ...",
  "modus": "penipuan hadiah",
  "tanda": [{ "kutipan": "potongan teks asli", "alasan": "..." }],
  "langkah": ["...", "..."],
  "balasan": "..."
}
```

`level` 0 sampai 3, sama dengan tingkat pemeriksa aturan. Maksimal 6 tanda dan 4 langkah. Batas: 20 permintaan per menit
per IP.

### `POST /api/simulasi`

Satu route untuk dua hal, dipilih lewat `mode`.

```json
{
  "persona": "kurir",
  "mode": "balas",
  "history": [
    { "from": "penipu", "text": "..." },
    { "from": "kamu", "text": "..." }
  ]
}
```

- `persona`: salah satu id di `PERSONAS` (`kerja`, `kurir`, `teman`, `bank`, `giveaway`, `investasi`, `salah`).
- `mode`: `"balas"` (bawaan) untuk balasan penipu berikutnya, `"nilai"` untuk penilaian akhir.
- `history`: maksimal 18 baris. Tiap baris dipotong 600 karakter.

Respons `balas`: `{ "balasan": "...", "selesai": false }`. Respons `nilai`:

```json
{ "hasil": "aman", "ringkasan": "...", "bagus": ["..."], "perbaiki": ["..."], "tanda": ["..."] }
```

`hasil` salah satu dari `aman`, `hampir`, `kena`. Batas: 40 permintaan per menit per IP.

### Kode status

| Status | Arti |
| --- | --- |
| 400 | Isi permintaan kosong, terlalu panjang, atau persona tidak dikenal |
| 429 | Terlalu banyak permintaan dari IP ini, atau Groq sedang membatasi |
| 502 | Groq galat atau jawabannya tidak bisa dibaca |
| 503 | `GROQ_API_KEY` belum diisi. Biasanya tidak sampai terjadi: halaman `/periksa` dan `/simulasi` sudah memeriksa kunci saat render dan menonaktifkan tombol AI-nya |
| 504 | Groq tidak menjawab dalam 25 detik |

## Keamanan dan privasi

| Risiko | Penanganan | Letak |
| --- | --- | --- |
| Data pribadi terkirim ke AI | Email dan deretan 6 angka atau lebih (nomor HP, rekening, NIK, OTP) diganti `[EMAIL]` dan `[ANGKA]`. Nominal rupiah dibiarkan karena penting untuk menilai tawaran. Dilakukan di browser, lalu diulang di server karena server adalah batas kepercayaan. | `redact()` di `lib/ai.ts` |
| Pengiriman tanpa izin | Teks hanya dikirim setelah pengguna menekan tombol, dan teks yang sudah disamarkan bisa dilihat dulu. | `app/checker.tsx` |
| Prompt injection | Pesan dibungkus `<pesan>` atau `<transkrip>`, dan prompt sistem menyatakan isinya data, bukan perintah. Jawaban dipaksa mengikuti JSON schema yang ketat. | route `api/*` |
| AI mengarang kutipan | Kutipan yang tidak ada di pesan asli dibuang, jadi setiap stabilo menunjuk teks yang benar-benar ada. | `app/api/periksa/route.ts` |
| Penipu simulasi memberi tautan | Prompt melarang tautan, nomor, dan merek sungguhan; sisa yang mirip URL tetap diganti `[tautan]`. | `app/api/simulasi/route.ts` |
| Jawaban AI terlalu panjang atau rusak | Setiap kolom dipotong panjangnya, nilai di luar pilihan diganti nilai aman. | `clip()` di `lib/groq.ts` |
| Kunci API bocor | Kunci hanya dibaca di `lib/groq.ts`, yang tidak pernah diimpor komponen browser. `.env.local` tidak di-commit. | `lib/groq.ts` |
| Penyalahgunaan kuota | Pembatas permintaan per IP dan batas waktu 25 detik. | `rateLimited()` di `lib/groq.ts` |

Batasan yang diketahui: pembatas permintaan disimpan di memori satu instance server, jadi ter-reset saat redeploy dan
tidak dibagi antar-instance. Kalau kuncinya mulai disalahgunakan, pindahkan ke penyimpanan KV.

Clarity tidak punya basis data dan tidak menyimpan teks atau percakapan. Satu-satunya yang disimpan adalah pilihan
tema di `localStorage` browser.

## Menambah konten

Semua konten adalah data di `lib/`, jadi menambah modus baru tidak perlu menyentuh komponen.

| Ingin menambah | Caranya |
| --- | --- |
| Aturan pendeteksi | Tambah entri di `RULES` (`lib/analyze.ts`) dengan `id`, `label`, `why`, `tip`, `weight`, dan `re` (regex dengan flag `gi`). Masukkan `id`-nya ke `rules` salah satu bagian di `lib/peta.ts`; `peta.test.ts` gagal kalau lupa. Tambah satu kasus di `analyze.test.ts`. |
| Merek untuk pengecek tautan | Tambah satu baris di `BRANDS` (`lib/analyze.ts`): nama, kata kunci di domain, dan domain resminya. |
| Situasi Latihan | Tambah objek `Scenario` di `lib/scenarios.ts`. Setiap pilihan diberi `grade` (`tepat`, `kurang`, `bahaya`) dan `feedback`. |
| Kejadian Sudah Terlanjur? | Tambah objek `Situation` di `lib/situations.ts`. Langkah dikelompokkan lewat `when`: `Sekarang juga`, `Hari ini`, `Setelahnya`. |
| Pengaturan Amankan Akun | Tambah `Lock` (`title`, `why`, `how`) ke grup yang cocok di `lib/kunci.ts`. |
| Persona Simulasi | Tambah objek di `PERSONAS` (`lib/ai.ts`). `brief` adalah peran yang dimainkan AI; semua nama dan merek harus fiktif. |

## Meja 3D

Meja 3D adalah adegan three.js yang dipasang sekali di layout root, jadi tidak dimuat ulang saat pindah halaman:
membuka berkas hanya menggerakkan kamera ke berkas itu. Aturan yang bisa diuji tanpa three.js (rute ke berkas, posisi pop-up di layar,
easing, jadwal hape bergetar) ada di `lib/desk.ts`. Meja ini hanya hiasan: kalau WebGL tidak tersedia, halaman menampilkan
berkasnya sebagai daftar tombol biasa, dan setiap fitur tetap bisa dibuka langsung lewat alamatnya. Animasi
menghormati pengaturan `prefers-reduced-motion`.

## Pengujian

```bash
pnpm test   # 16 uji, berjalan di Node 22.18+ tanpa langkah build
pnpm lint
pnpm build
```

| File | Yang diuji |
| --- | --- |
| `lib/analyze.test.ts` | Pesan phishing masuk tingkat tertinggi, kalimat peringatan tidak dianggap permintaan, konteks tidak dihitung dua kali, pengecekan tautan, lowongan dan pinjol, modus baru (berbagi layar, salah transfer, QRIS, kabar darurat), penyamaran data |
| `lib/peta.test.ts` | Pemetaan tanda ke bagian peta dan urutannya, serta setiap aturan (kecuali "pengirim asing") punya tempat di peta |
| `lib/desk.test.ts` | Rute ke berkas, posisi pop-up di layar, easing, jadwal hape |

## Keputusan desain

- **Aturan dulu, AI belakangan.** Pemeriksa aturan berjalan tanpa internet, tanpa biaya, tanpa mengirim data, dan setiap
  tandanya bisa dijelaskan. AI hanya pendapat kedua yang diminta pengguna, sehingga aplikasi tetap berguna saat kuota
  AI habis atau kunci tidak diisi.
- **Penjelasan, bukan skor.** Tujuannya melatih pengguna mengenali sendiri, jadi setiap tanda membawa alasan dan langkah.
- **Tidak pernah bilang "pasti aman".** Tingkat terendah berbunyi "Belum ada pola yang cocok", dan AI diminta memakai
  bahasa kemungkinan.
- **Semua contoh fiktif.** Tidak ada nomor, rekening, atau tautan berbahaya sungguhan yang bisa diklik.
- **Tanpa dependensi tambahan.** Selain Next.js, React, dan three.js, semuanya memakai fitur bawaan platform (regex,
  `URL`, `fetch`, `node --test`).
