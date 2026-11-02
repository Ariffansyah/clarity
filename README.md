# Clarity

Aplikasi web untuk studi kasus **The Trust Trap: Navigating Digital Deception** (MIT-Week 2026). Membantu anak muda
Indonesia mengenali tipuan digital, berlatih mengambil keputusan, dan tahu langkah yang harus diambil kalau sudah terlanjur.

## Fitur

| Halaman | Pendekatan | Isi |
| --- | --- | --- |
| `/` Meja | Pintu masuk | Tumpukan berkas di atas meja. Klik berkasnya atau sticky note-nya, fiturnya terbuka di pop-up hape. Alamatnya tetap bisa dibagikan: dibuka langsung, tampil sebagai halaman penuh. |
| `/periksa` Cek pesan | Recognize | Tempel pesan atau tautan. Bagian yang mencurigakan ditandai stabilo, tiap tanda dijelaskan alasannya, tautan dicek (tautan pendek, akhiran domain murah, nama merek palsu, file `.apk`, IP, punycode), juga modus yang lebih baru: CS palsu minta berbagi layar, salah transfer, scan QRIS untuk "menerima" uang, dan kabar darurat keluarga yang suaranya bisa ditiru AI. Lalu diberi langkah aman, dan hasilnya bisa dikirim ke keluarga lewat WhatsApp. |
| `/peta` Peta tipuan | Understand | Modusnya ganti-ganti, bagiannya tetap: umpan, kedok, desakan, isolasi, dan permintaan. Tiap bagian diberi definisi, alasan kenapa berhasil, contoh fiktif yang ditandai stabilo, dan cara mematahkannya. Hasil Cek Pesan menautkan ke bagian yang cocok (`/peta#desakan`). Di meja, petanya terlipat dan tersemat di papan pin; diklik, lipatannya terbuka. Di HP papan pinnya tidak tampil, jadi petanya dibuka lewat kalimat pengantar di halaman depan dan terbuka di lembar cek pesan. |
| `/latihan` | Learn | 11 situasi fiktif (9 penipuan, 2 wajar). Pilih tindakan, kartu berbalik menunjukkan umpan balik dan pesan yang sudah ditandai. Skor di akhir. |
| `/amankan` Amankan akun | Prevent | Papan klip berisi 11 pengaturan yang menutup celah sebelum penipu datang (verifikasi dua langkah WhatsApp, bisukan penelepon tak dikenal, larang APK dari luar Play Store, limit transfer, dan lainnya), masing-masing dengan alasan dan cara menyalakannya. Plus usulan kata sandi keluarga untuk melawan suara tiruan AI, dengan pesan grup keluarga yang sengaja tidak memuat katanya. Tidak ada yang disimpan. |
| `/bertindak` | Act | Daftar periksa per kejadian (OTP bocor, sudah transfer, salah transfer, buka tautan palsu, pasang APK atau berbagi layar, kirim KTP, akun dibajak, ditiru), penyusun pesan peringatan untuk teman, dan saluran lapor resmi. |
| `/simulasi` | Learn (AI) | Ngobrol dengan penipu fiktif yang diperankan AI (7 persona), maksimal 8 balasan, lalu dinilai: aman, hampir kena, atau kena, beserta alasannya. |
| `/periksa` Tanya AI | Recognize (AI) | Setelah pemeriksaan berbasis aturan, pengguna bisa meminta pendapat kedua dari AI. Kutipan AI yang tidak ada di pesan dibuang, jadi setiap sorotan menunjuk teks asli. |

## Cara kerja dan batasannya

- Penilaian memakai aturan (regex dan pengecekan alamat) di `lib/analyze.ts`. Setiap aturan punya alasan yang ditampilkan ke pengguna.
- Hasil **bukan bukti**. "Belum ada pola yang cocok" tidak berarti aman, dan aplikasi menyatakannya di layar.
- Pemeriksaan berbasis aturan berjalan di browser dan tidak mengirim apa pun.
- Fitur AI (Tanya AI dan Simulasi) mengirim teks ke [Groq](https://groq.com) **hanya setelah pengguna menekan tombol**, dan ini dijelaskan di layar. Nomor, angka panjang, dan email disamarkan di browser lalu disamarkan ulang di server (`lib/ai.ts`). Clarity tidak menyimpan teks atau percakapan.
- Tanpa kunci API, fitur AI tampil nonaktif dan fitur lain tetap jalan.
- Semua contoh dan skenario fiktif. Tidak ada tautan berbahaya yang bisa diklik.

## Menjalankan

Fitur AI butuh kunci dari [console.groq.com](https://console.groq.com). Salin contohnya ke `.env.local` (tidak ikut di-commit), lalu isi `GROQ_API_KEY`:

```bash
cp .env.example .env.local
```

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm test    # uji aturan pendeteksi
pnpm build
```
