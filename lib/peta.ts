// The parts almost every scam is built from, in the order they usually come. All names, numbers, and brands are fictional.

export type Stage = {
  id: string;
  name: string;
  def: string;
  why: string;
  examples: { from: string; text: string }[];
  counter: string;
  rules: string[]; // the checker's rule ids that touch this part
};

export const STAGES: Stage[] = [
  {
    id: "umpan",
    name: "Umpan",
    def: "Alasan supaya kamu mau menanggapi: hadiah, untung besar, kerja gampang, pinjaman kilat, atau kabar yang bikin cemas.",
    why: "Umpan menyentuh yang sedang kamu butuhkan atau takutkan. Begitu kamu menginginkannya, kamu mulai mencari alasan untuk percaya, bukan alasan untuk ragu.",
    examples: [
      { from: "@tokokita.official.giveaway", text: "Selamat kak! Kamu terpilih sebagai pemenang giveaway HP dari TokoKita." },
      { from: "HRD Rekrutmen Online", text: "Tugasnya cuma like dan follow akun toko, gaji Rp150.000 per tugas, tanpa pengalaman." },
      { from: "Bu Ratna", text: "Mohon maaf sekali kak, tadi saya salah transfer Rp1.500.000 ke rekening kakak." },
    ],
    counter: "Tanya dirimu: aku pernah ikut, melamar, atau meminta ini? Kalau tidak, anggap tawarannya tidak pernah ada.",
    rules: ["hadiah", "untung", "kerja", "pinjol", "salah", "darurat"],
  },
  {
    id: "kedok",
    name: "Kedok",
    def: "Topeng supaya pesannya terlihat bisa dipercaya: nama bank, kurir, CS, atau teman yang kamu kenal.",
    why: "Orang atau lembaga yang sudah kita percaya jarang kita periksa ulang. Logo, nama yang mirip resmi, dan foto profil teman meminjam kepercayaan itu.",
    examples: [
      { from: "Bank Nusantara Care", text: "Selamat siang, kami dari tim keamanan Bank Nusantara. Ada transaksi mencurigakan di rekening Anda." },
      { from: "+62 813-xxxx-5521", text: "Hai, ini aku Dina. HP lamaku rusak jadi pakai nomor baru dulu ya." },
    ],
    counter: "Hubungi balik lewat jalur yang kamu cari sendiri: aplikasi resmi, nomor di balik kartu ATM, atau nomor lama temanmu.",
    rules: ["resmi", "kenalan", "akun", "tautan"],
  },
  {
    id: "desakan",
    name: "Desakan",
    def: "Batas waktu atau ancaman supaya kamu bertindak sebelum sempat berpikir.",
    why: "Saat panik atau takut ketinggalan, kita memutuskan cepat dan berhenti mengecek. Penipu butuh kamu bertindak sekarang, karena besok kamu mungkin sudah sadar.",
    examples: [
      { from: "+62 812-xxxx-0077", text: "Nasabah Yth, akun m-banking Anda akan diblokir dalam 24 jam karena perubahan tarif transfer." },
      { from: "Mentor Cuan Bareng", text: "Slot member baru tinggal 5 orang, transfer sekarang juga biar kebagian." },
      { from: "@tokokita.official.giveaway", text: "Batas klaim sampai jam 9 malam ini ya kak, setelah itu hangus." },
    ],
    counter: "Beri jeda. Taruh HP-nya sepuluh menit, lalu cek lewat jalur resmi. Urusan yang asli masih ada setelah sepuluh menit.",
    rules: ["buru", "ancam"],
  },
  {
    id: "isolasi",
    name: "Isolasi",
    def: "Cara menjauhkanmu dari orang dan jalur yang bisa membongkar tipuannya: disuruh merahasiakan, atau dipindah ke chat lain.",
    why: "Satu pertanyaan ke teman atau keluarga sering cukup untuk membongkar tipuan. Karena itu penipu ingin kamu sendirian, di tempat yang mereka kendalikan.",
    examples: [
      { from: "+62 813-xxxx-5521", text: "Jangan bilang siapa-siapa ya, malu aku." },
      { from: "HRD Rekrutmen Online", text: "Kalau minat, gabung grup Telegram kami ya. Kuota terbatas hari ini." },
    ],
    counter: "Justru ceritakan ke satu orang yang kamu percaya, dan tetap di aplikasi atau situs resmi. Disuruh merahasiakan adalah alasan untuk bercerita.",
    rules: ["rahasia", "pindah", "ancam"],
  },
  {
    id: "permintaan",
    name: "Permintaan",
    def: "Ujung dari semuanya: kode OTP, transfer, data pribadi, memasang aplikasi, atau berbagi layar.",
    why: "Semua bagian sebelumnya ada untuk sampai ke sini. Permintaannya sering dibuat terdengar kecil dan wajar: cuma ongkir, cuma kode, cuma lima menit.",
    examples: [
      { from: "@tokokita.official.giveaway", text: "Untuk klaim hadiah cukup bayar ongkir Rp75.000 ke rekening admin." },
      { from: "Kurir KirimCepat", text: "Mohon dicek foto paketnya di file Foto_Paket_KirimCepat.apk ya kak." },
      { from: "@dompetku.care.id", text: "Silakan unduh aplikasi BantuLayar lalu nyalakan berbagi layar. Kirimkan 9 angka yang muncul ya kak." },
    ],
    counter: "Jangan berikan kode, uang, data, atau akses ke HP-mu lewat chat, siapa pun yang meminta. Kalau memang perlu, lakukan sendiri dari aplikasi resminya.",
    rules: ["kode", "bayar", "data", "file", "layar", "qris", "salah", "darurat", "tautan"],
  },
];

/** The parts of the map a checked message touches, in the map's order. Ids no part claims are ignored. */
export function stagesFor(ids: string[]) {
  return STAGES.filter((s) => s.rules.some((r) => ids.includes(r)));
}
