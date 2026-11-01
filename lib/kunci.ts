// Settings that stop a scam before it starts. Menu names follow the Indonesian UI and differ a little between phones.

export type Lock = { id: string; title: string; why: string; how: string };

export const LOCKS: { group: string; items: Lock[] }[] = [
  {
    group: "WhatsApp",
    items: [
      {
        id: "wa-pin",
        title: "Nyalakan verifikasi dua langkah",
        why: "Kalau kode OTP WhatsApp-mu sempat terpancing, pelaku tetap butuh PIN ini untuk mengambil alih akunmu.",
        how: "Setelan › Akun › Verifikasi dua langkah › Aktifkan. Buat PIN 6 angka yang bukan tanggal lahir.",
      },
      {
        id: "wa-grup",
        title: "Atur siapa yang bisa memasukkanmu ke grup",
        why: "Grup investasi dan lowongan palsu dimulai dari kamu dimasukkan tanpa ditanya.",
        how: "Setelan › Privasi › Grup › Kontak saya.",
      },
      {
        id: "wa-senyap",
        title: "Bisukan panggilan dari nomor tak dikenal",
        why: "Telepon penipu, termasuk yang memakai suara tiruan AI, tidak lagi berdering. Panggilannya tetap tercatat kalau ternyata penting.",
        how: "Setelan › Privasi › Panggilan, lalu nyalakan pilihan untuk membisukan penelepon tak dikenal.",
      },
      {
        id: "wa-tertaut",
        title: "Cek perangkat tertaut",
        why: "WhatsApp Web yang tersambung diam-diam bisa membaca semua chat-mu.",
        how: "Menu titik tiga (di iPhone: Setelan) › Perangkat tertaut. Keluarkan yang tidak kamu kenal.",
      },
    ],
  },
  {
    group: "HP",
    items: [
      {
        id: "apk",
        title: "Larang pemasangan aplikasi dari luar Play Store",
        why: "Ini yang menghentikan file .apk dari kurir atau undangan palsu, bahkan kalau sempat terbuka.",
        how: "Android: Setelan › Aplikasi › Akses aplikasi khusus › Instal aplikasi tidak dikenal. Pastikan WhatsApp, Telegram, dan browser tidak diizinkan.",
      },
      {
        id: "play-protect",
        title: "Pastikan Google Play Protect menyala",
        why: "Play Protect memindai aplikasi berbahaya, termasuk yang sudah terlanjur terpasang.",
        how: "Play Store › foto profil › Play Protect › ikon roda gigi › Pindai aplikasi dengan Play Protect.",
      },
      {
        id: "kunci-layar",
        title: "Kunci layar dengan PIN atau sidik jari",
        why: "HP hilang tanpa kunci layar berarti chat, email, dan m-banking di dalamnya ikut terbuka.",
        how: "Setelan › Keamanan (atau Kunci layar). Pilih PIN, pola panjang, atau sidik jari.",
      },
    ],
  },
  {
    group: "Akun dan bank",
    items: [
      {
        id: "email",
        title: "Lindungi email utamamu dengan verifikasi dua langkah",
        why: "Email adalah kunci pemulihan hampir semua akun lain. Kalau email jatuh, sisanya ikut.",
        how: "Untuk Gmail: Akun Google › Keamanan › Verifikasi 2 Langkah.",
      },
      {
        id: "sosmed",
        title: "Nyalakan autentikasi dua faktor di Instagram dan Facebook",
        why: "Akun media sosial yang dibajak dipakai untuk menipu teman-temanmu atas namamu.",
        how: "Pusat Akun › Kata sandi dan keamanan › Autentikasi dua faktor.",
      },
      {
        id: "password",
        title: "Pakai password berbeda untuk email dan bank",
        why: "Kalau satu situs bocor, password yang sama akan dicoba ke akunmu yang lain.",
        how: "Simpan di pengelola password bawaan HP-mu, supaya tidak perlu menghafal semuanya.",
      },
      {
        id: "bank",
        title: "Nyalakan notifikasi transaksi dan turunkan limit transfer",
        why: "Kamu langsung tahu kalau ada uang keluar, dan limit kecil membatasi kerugian terbesar.",
        how: "Cari menu Notifikasi dan Limit Transaksi di aplikasi bank-mu. Naikkan limitnya hanya saat perlu.",
      },
    ],
  },
];

// Two everyday words make a code word that is easy to say on the phone and hard to guess.
export const KATA = {
  benda: ["kancil", "rambutan", "layangan", "bakwan", "kerupuk", "becak", "kelereng", "gerobak", "nanas", "cendol", "angklung", "wayang", "dodol", "salak", "lumpia", "bakpao", "sandal", "tikar", "bantal", "payung", "sapu", "kecap", "kemangi", "gembok"],
  sifat: ["ngantuk", "terbang", "goyang", "berkumis", "nyasar", "kesiangan", "bersin", "joget", "melamun", "pemalu", "kepedasan", "kebanjiran", "berdasi", "ngambek", "berkacamata", "kedinginan"],
};
