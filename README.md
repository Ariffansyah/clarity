# Clarity

Aplikasi web untuk studi kasus **The Trust Trap: Navigating Digital Deception** (MIT-Week 2026). Membantu anak muda
Indonesia mengenali tipuan digital, berlatih mengambil keputusan, dan tahu langkah yang harus diambil kalau sudah terlanjur.

## Fitur

| Halaman | Pendekatan | Isi |
| --- | --- | --- |
| `/` Cek pesan | Recognize | Tempel pesan atau tautan. Bagian yang mencurigakan ditandai stabilo, tiap tanda dijelaskan alasannya, tautan dicek (tautan pendek, akhiran domain murah, nama merek palsu, file `.apk`, IP, punycode), lalu diberi langkah aman. |
| `/latihan` | Learn | 9 situasi fiktif (7 penipuan, 2 wajar). Pilih tindakan, kartu berbalik menunjukkan umpan balik dan pesan yang sudah ditandai. Skor di akhir. |
| `/bertindak` | Act | Daftar periksa per kejadian (OTP bocor, sudah transfer, buka tautan palsu, pasang APK, kirim KTP, akun dibajak, ditiru), penyusun pesan peringatan untuk teman, dan saluran lapor resmi. |
| `/simulasi` | Learn (AI) | Ngobrol dengan penipu fiktif yang diperankan AI (6 persona), maksimal 8 balasan, lalu dinilai: aman, hampir kena, atau kena, beserta alasannya. |
| `/` Tanya AI | Recognize (AI) | Setelah pemeriksaan berbasis aturan, pengguna bisa meminta pendapat kedua dari AI. Kutipan AI yang tidak ada di pesan dibuang, jadi setiap sorotan menunjuk teks asli. |

## Cara kerja dan batasannya

- Penilaian memakai aturan (regex dan pengecekan alamat) di `lib/analyze.ts`. Setiap aturan punya alasan yang ditampilkan ke pengguna.
- Hasil **bukan bukti**. "Belum ada pola yang cocok" tidak berarti aman, dan aplikasi menyatakannya di layar.
- Pemeriksaan berbasis aturan berjalan di browser dan tidak mengirim apa pun.
- Fitur AI (Tanya AI dan Simulasi) mengirim teks ke [Groq](https://groq.com) **hanya setelah pengguna menekan tombol**, dan ini dijelaskan di layar. Nomor, angka panjang, dan email disamarkan di browser lalu disamarkan ulang di server (`lib/ai.ts`). Clarity tidak menyimpan teks atau percakapan.
- Tanpa kunci API, fitur AI tampil nonaktif dan fitur lain tetap jalan.
- Semua contoh dan skenario fiktif. Tidak ada tautan berbahaya yang bisa diklik.

## Menjalankan

Fitur AI butuh kunci dari [console.groq.com](https://console.groq.com). Simpan di `.env.local` (tidak ikut di-commit):

```bash
GROQ_API_KEY=isi_kuncimu
# opsional, default openai/gpt-oss-120b
GROQ_MODEL=openai/gpt-oss-120b
```

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm test    # uji aturan pendeteksi
pnpm build
```
