export type Step = {
  when: "Sekarang juga" | "Hari ini" | "Setelahnya";
  title: string;
  detail: string;
  link?: { href: string; label: string };
};

export type Situation = { id: string; title: string; steps: Step[] };

const WARN = { href: "#peringatkan", label: "Tulis pesan peringatan" };
const IASC = { href: "https://iasc.ojk.go.id", label: "iasc.ojk.go.id" };
const IDEBKU = { href: "https://idebku.ojk.go.id", label: "idebku.ojk.go.id" };
const OJK_WA = { href: "https://wa.me/6281157157157", label: "WhatsApp OJK" };

export const SITUATIONS: Situation[] = [
  {
    id: "kode",
    title: "Aku memberikan kode OTP, PIN, atau password",
    steps: [
      { when: "Sekarang juga", title: "Ganti password atau PIN akun itu", detail: "Lakukan dari aplikasi resminya. Pakai kombinasi baru yang belum pernah kamu pakai di tempat lain." },
      { when: "Sekarang juga", title: "Telepon layanan resmi akun tersebut", detail: "Minta pemblokiran sementara dan cek transaksi. Ambil nomornya dari aplikasi, situs resmi, atau balik kartu ATM, jangan dari pesan pelaku." },
      { when: "Sekarang juga", title: "Keluarkan perangkat yang tidak kamu kenal", detail: "Cari menu Perangkat Tertaut, Sesi Aktif, atau Keamanan, lalu keluarkan semua yang asing." },
      { when: "Hari ini", title: "Nyalakan verifikasi dua langkah", detail: "Dengan ini, password saja tidak cukup untuk masuk ke akunmu." },
      { when: "Hari ini", title: "Periksa riwayat transaksi dan pengaturan akun", detail: "Lihat apakah ada transfer, email pemulihan, atau nomor HP yang diganti tanpa sepengetahuanmu." },
      { when: "Hari ini", title: "Kabari orang terdekat", detail: "Kalau akun chat atau media sosialmu ikut dikuasai, pelaku bisa memakainya untuk minta uang ke teman-temanmu.", link: WARN },
      { when: "Setelahnya", title: "Laporkan nomor atau akun pelaku", detail: "Pakai tombol Laporkan di aplikasi tempat pelaku menghubungimu supaya akunnya bisa ditindak." },
    ],
  },
  {
    id: "transfer",
    title: "Aku sudah transfer uang",
    steps: [
      { when: "Sekarang juga", title: "Telepon bank atau e-wallet yang kamu pakai", detail: "Minta pemblokiran dana di rekening tujuan. Makin cepat kamu melapor, makin besar peluang dananya masih bisa ditahan." },
      { when: "Sekarang juga", title: "Laporkan ke Indonesia Anti-Scam Centre (IASC)", detail: "Pusat penanganan penipuan transaksi keuangan dari OJK. Siapkan KTP, bukti kepemilikan rekening, dan kronologi. Laporan hanya lewat situs resminya.", link: IASC },
      { when: "Sekarang juga", title: "Simpan semua bukti", detail: "Tangkapan layar chat, nomor rekening tujuan, bukti transfer, dan nama akun pelaku. Jangan hapus percakapannya." },
      { when: "Hari ini", title: "Laporkan rekening pelaku", detail: "Laporanmu membantu orang lain yang mengecek rekening yang sama sebelum mentransfer.", link: { href: "https://cekrekening.id", label: "cekrekening.id" } },
      { when: "Hari ini", title: "Berhenti membalas pelaku", detail: "Tolak tawaran bantuan menarik dana kembali yang meminta biaya. Itu biasanya penipuan kedua." },
      { when: "Setelahnya", title: "Buat laporan ke polisi", detail: "Datang ke kantor polisi terdekat dengan bukti-buktimu, atau buat laporan kejahatan siber lewat situs resmi Polri.", link: { href: "https://patrolisiber.id", label: "patrolisiber.id" } },
      { when: "Setelahnya", title: "Ceritakan ke orang lain", detail: "Malu itu wajar, tapi ceritamu bisa mencegah temanmu kena modus yang sama.", link: WARN },
    ],
  },
  {
    id: "salah-transfer",
    title: "Ada uang \"salah transfer\" masuk dan aku diminta mengembalikannya",
    steps: [
      { when: "Sekarang juga", title: "Jangan pakai dan jangan kirim balik sendiri", detail: "Walau yang menghubungi terdengar sopan atau memelas. Mengirim ke rekening yang mereka sebut adalah inti modusnya." },
      { when: "Sekarang juga", title: "Cek mutasi langsung di aplikasi bank", detail: "Pastikan uangnya benar-benar masuk. Bukti transfer yang dikirim lewat chat bisa saja editan." },
      { when: "Hari ini", title: "Laporkan ke bank-mu lewat nomor resmi", detail: "Minta bank yang memproses pengembalian ke rekening asal. Dengan begitu ada catatan resmi bahwa kamu tidak memakai uangnya." },
      { when: "Hari ini", title: "Cek apakah ada pinjaman atas namamu", detail: "Uang nyasar kadang berasal dari pinjol yang memakai datamu. Pinjaman dari lembaga berizin tercatat di iDebKu OJK. Yang ilegal tidak, jadi waspadai juga SMS atau telepon penagihan.", link: IDEBKU },
      { when: "Setelahnya", title: "Laporkan penagih pinjaman yang tidak pernah kamu ajukan", detail: "Telepon OJK di 157 atau lewat WhatsApp, lalu simpan semua bukti penagihannya.", link: OJK_WA },
    ],
  },
  {
    id: "tautan",
    title: "Aku membuka tautan dan mengisi data di sana",
    steps: [
      { when: "Sekarang juga", title: "Ganti password akun yang datanya kamu isi", detail: "Ganti juga di akun lain yang memakai password yang sama." },
      { when: "Sekarang juga", title: "Kalau yang kamu isi data kartu atau m-banking, telepon bank", detail: "Minta blokir kartu atau akses m-banking sementara. Nomornya ada di balik kartu ATM atau di aplikasi resmi." },
      { when: "Hari ini", title: "Nyalakan verifikasi dua langkah", detail: "Supaya password yang bocor saja tidak cukup untuk masuk." },
      { when: "Hari ini", title: "Laporkan situs palsunya", detail: "Laporan ke Komdigi bisa membuat situs itu diblokir sebelum memakan korban lain.", link: { href: "https://aduankonten.id", label: "aduankonten.id" } },
      { when: "Setelahnya", title: "Pantau akun dan transaksi beberapa minggu", detail: "Data curian kadang baru dipakai belakangan. Waspadai juga pesan dari bank palsu yang menyebut datamu dengan lengkap." },
    ],
  },
  {
    id: "apk",
    title: "Aku memasang aplikasi dari chat atau berbagi layar",
    steps: [
      { when: "Sekarang juga", title: "Matikan data seluler dan Wi-Fi", detail: "Memutus internet menghentikan aplikasi itu mengirim SMS dan OTP-mu ke pelaku." },
      { when: "Sekarang juga", title: "Telepon bank untuk memblokir m-banking sementara", detail: "Pakai telepon lain kalau perlu. Nomornya ada di balik kartu ATM." },
      { when: "Sekarang juga", title: "Hapus aplikasinya", detail: "Buka Pengaturan, lalu Aplikasi. Cari aplikasi yang baru terpasang, namanya bisa menyamar seperti Undangan atau Lihat Paket, atau aplikasi remote untuk berbagi layar. Kalau tidak bisa dihapus, cabut dulu izin Aksesibilitas dan SMS-nya." },
      { when: "Hari ini", title: "Ganti password dari perangkat lain", detail: "Gunakan HP atau laptop lain yang bersih, karena HP-mu mungkin masih disusupi." },
      { when: "Hari ini", title: "Pertimbangkan reset pabrik", detail: "Cara paling tuntas membersihkan HP. Cadangkan foto dan kontak dulu, tapi jangan cadangkan aplikasinya." },
      { when: "Setelahnya", title: "Laporkan nomor pengirimnya", detail: "Tekan Laporkan di WhatsApp atau aplikasi chat yang dipakai pelaku." },
    ],
  },
  {
    id: "data",
    title: "Aku mengirim foto KTP, selfie, atau data pribadi",
    steps: [
      { when: "Sekarang juga", title: "Catat apa yang terkirim dan ke siapa", detail: "Foto KTP, selfie, nomor rekening, atau nama ibu kandung? Catatan ini berguna saat melapor." },
      { when: "Sekarang juga", title: "Hentikan percakapan dan simpan buktinya", detail: "Jangan kirim apa pun lagi, walaupun pelaku bilang datanya kurang lengkap." },
      { when: "Hari ini", title: "Cek apakah ada pinjaman atas namamu", detail: "Layanan iDebKu dari OJK menampilkan riwayat kredit yang tercatat atas NIK-mu.", link: IDEBKU },
      { when: "Hari ini", title: "Tanyakan ke Kontak OJK", detail: "Kalau muncul pinjaman yang tidak pernah kamu ajukan, laporkan dan simpan buktinya. Bisa telepon 157 atau WhatsApp 081 157 157 157.", link: OJK_WA },
      { when: "Setelahnya", title: "Waspadai pesan lanjutan yang terdengar meyakinkan", detail: "Penipu yang memegang datamu bisa menyebut nama lengkap dan NIK-mu supaya terlihat resmi." },
    ],
  },
  {
    id: "dibajak",
    title: "Akun media sosial atau chat-ku diambil alih",
    steps: [
      { when: "Sekarang juga", title: "Pulihkan lewat fitur resmi", detail: "Gunakan Lupa Password atau Akun Diretas dari aplikasi resminya. Abaikan jasa pemulihan yang menawarkan diri lewat DM." },
      { when: "Sekarang juga", title: "Untuk WhatsApp: masuk lagi dengan nomormu", detail: "Masukkan kode verifikasi yang dikirim ke nomormu. Orang lain yang memakai nomormu akan otomatis keluar." },
      { when: "Sekarang juga", title: "Kabari kontakmu lewat jalur lain", detail: "Lewat status, akun lain, atau grup keluarga. Minta mereka mengabaikan permintaan uang dari akunmu.", link: WARN },
      { when: "Hari ini", title: "Minta teman ikut melaporkan akunmu", detail: "Laporan dari beberapa orang membantu platform bergerak lebih cepat." },
      { when: "Hari ini", title: "Ganti password email yang terhubung", detail: "Email adalah kunci pemulihan. Kalau email ikut dikuasai, akunmu bisa diambil lagi." },
      { when: "Setelahnya", title: "Nyalakan verifikasi dua langkah", detail: "Lakukan begitu akunmu kembali, supaya tidak terulang." },
    ],
  },
  {
    id: "menyamar",
    title: "Ada yang menyamar jadi aku atau orang yang kukenal",
    steps: [
      { when: "Sekarang juga", title: "Simpan tangkapan layar akun palsunya", detail: "Nama akun, foto profil, dan pesan yang dikirim. Berguna untuk laporan." },
      { when: "Sekarang juga", title: "Laporkan akun palsunya", detail: "Buka profilnya, pilih Laporkan, lalu pilih alasan berpura-pura menjadi orang lain." },
      { when: "Hari ini", title: "Umumkan dari akun asli", detail: "Beri tahu bahwa akun itu palsu dan kamu tidak pernah meminta uang lewat sana.", link: WARN },
      { when: "Hari ini", title: "Minta teman-temanmu ikut melapor", detail: "Makin banyak laporan, makin cepat akun palsunya ditindak." },
      { when: "Setelahnya", title: "Batasi apa yang bisa dilihat orang asing", detail: "Daftar teman dan foto publik adalah bahan utama peniru. Atur siapa yang bisa melihatnya." },
    ],
  },
];

export const WARNINGS = [
  { id: "lowongan", name: "Lowongan kerja palsu", ciri: "ditawari kerja padahal tidak melamar, tugasnya cuma like atau follow tapi bayarannya besar, lalu diminta deposit", jangan: "gabung grupnya atau transfer deposit apa pun" },
  { id: "apk", name: "File .apk dari kurir atau undangan", ciri: "dikirimi file berakhiran .apk yang katanya foto paket, undangan, atau surat tilang", jangan: "buka atau pasang filenya, karena bisa mencuri OTP dan menguras rekening" },
  { id: "nomor", name: "Teman atau keluarga ganti nomor", ciri: "chat dari nomor baru yang mengaku kenalan, langsung pinjam uang dan minta dirahasiakan", jangan: "transfer sebelum menelepon nomor lamanya" },
  { id: "giveaway", name: "Giveaway palsu", ciri: "dibilang menang giveaway oleh akun yang mirip resmi, lalu disuruh bayar ongkir atau pajak hadiah", jangan: "bayar apa pun untuk menebus hadiah" },
  { id: "pinjol", name: "Pinjol ilegal", ciri: "tawaran pinjaman cair kilat lewat SMS atau WA, cukup foto KTP dan selfie", jangan: "kirim KTP atau pasang aplikasinya. Cek dulu ke WhatsApp OJK 081 157 157 157" },
  { id: "investasi", name: "Investasi bodong", ciri: "janji untung tetap puluhan persen per minggu, katanya tanpa risiko, dan didesak segera transfer", jangan: "setor uang, walaupun katanya coba kecil dulu" },
  { id: "bank", name: "Link palsu atas nama bank", ciri: "SMS atau WA bilang akun mau diblokir atau ada tarif baru, lalu kasih link untuk konfirmasi", jangan: "klik linknya. Buka aplikasi bank langsung atau telepon nomor di balik kartu ATM" },
  { id: "salah", name: "Salah transfer", ciri: "ada uang masuk ke rekening, lalu orang asing memelas minta dikirim balik ke rekening lain", jangan: "kirim balik sendiri. Laporkan ke bank supaya bank yang mengembalikan" },
  { id: "layar", name: "CS palsu minta berbagi layar", ciri: "mengaku CS bank atau e-wallet, sering setelah kita mengeluh di media sosial, lalu menyuruh pasang aplikasi remote atau berbagi layar", jangan: "pasang aplikasinya atau berbagi layar. CS resmi tidak pernah meminta itu" },
  { id: "darurat", name: "Kabar darurat dan suara tiruan AI", ciri: "telepon atau chat bilang keluarga kecelakaan atau ditangkap, suaranya bisa mirip sekali karena ditiru AI, lalu minta transfer saat itu juga", jangan: "transfer sebelum menelepon langsung orangnya lewat nomor yang sudah kamu simpan" },
  { id: "dibajak", name: "Akun dibajak", ciri: "akun teman tiba-tiba pinjam uang atau minta kode OTP", jangan: "kirim uang atau kode apa pun sebelum memastikan lewat telepon" },
];

export const CHANNELS = [
  { name: "Indonesia Anti-Scam Centre", use: "Penipuan transaksi keuangan, terutama kalau uangmu sudah terkirim.", href: "https://iasc.ojk.go.id", label: "iasc.ojk.go.id" },
  { name: "Kontak OJK", use: "Cek legalitas pinjol atau investasi, dan aduan jasa keuangan. Telepon 157.", href: "https://wa.me/6281157157157", label: "WhatsApp 081 157 157 157" },
  { name: "Cek Rekening", use: "Cek apakah rekening tujuan pernah dilaporkan, atau laporkan rekening penipu.", href: "https://cekrekening.id", label: "cekrekening.id" },
  { name: "Aduan Konten Komdigi", use: "Laporkan situs palsu atau akun penipuan supaya diblokir.", href: "https://aduankonten.id", label: "aduankonten.id" },
  { name: "Patroli Siber Polri", use: "Laporan kejahatan siber ke kepolisian.", href: "https://patrolisiber.id", label: "patrolisiber.id" },
];
