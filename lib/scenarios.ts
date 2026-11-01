// All names, numbers, brands, and addresses here are fictional.

export type Grade = "tepat" | "kurang" | "bahaya";

export type Scenario = {
  id: string;
  title: string;
  channel: "WhatsApp" | "SMS" | "Instagram" | "Email" | "Telegram";
  from: string;
  sub: string;
  context: string;
  messages: string[];
  file?: string;
  scam: boolean;
  choices: { text: string; grade: Grade; feedback: string }[];
  tells: string[];
};

export const SCENARIOS: Scenario[] = [
  {
    id: "lowongan",
    title: "Lowongan like dan follow",
    channel: "WhatsApp",
    from: "HRD Rekrutmen Online",
    sub: "+62 857-xxxx-2210 · tidak ada di kontakmu",
    context: "Kamu tidak sedang melamar kerja ke mana pun.",
    messages: [
      "Halo kak, kami sedang buka kerja paruh waktu dari rumah untuk tim pemasaran digital.",
      "Tugasnya cuma like dan follow akun toko, gaji Rp150.000 per tugas, tanpa pengalaman.",
      "Kalau minat, gabung grup Telegram kami ya. Kuota terbatas hari ini.",
    ],
    scam: true,
    choices: [
      {
        text: "Gabung grupnya, lumayan buat tambahan uang jajan",
        grade: "bahaya",
        feedback: "Di grup itu kamu biasanya dibayar kecil dulu supaya percaya. Lalu muncul tugas premium yang butuh deposit, dan deposit itulah yang hilang.",
      },
      {
        text: "Balas dan tanya nama perusahaannya dulu",
        grade: "kurang",
        feedback: "Niatnya bagus, tapi membalas memberi mereka kesempatan meyakinkanmu dengan nama dan dokumen palsu. Cek dari sumber yang kamu cari sendiri.",
      },
      {
        text: "Abaikan, blokir, dan laporkan nomornya",
        grade: "tepat",
        feedback: "Tepat. Lowongan yang datang tanpa kamu melamar, dengan bayaran besar untuk tugas sepele, hampir selalu berujung minta deposit.",
      },
    ],
    tells: [
      "Kamu tidak melamar, tapi tiba-tiba ditawari kerja.",
      "Bayaran besar untuk tugas yang sepele.",
      "Diajak pindah ke grup Telegram.",
      "Kalimat kuota terbatas hari ini untuk mendesak.",
    ],
  },
  {
    id: "kurir",
    title: "Foto paket dari kurir",
    channel: "WhatsApp",
    from: "Kurir KirimCepat",
    sub: "+62 821-xxxx-8841 · tidak ada di kontakmu",
    context: "Kamu memang sedang menunggu paket belanja online.",
    messages: [
      "Permisi kak, paket atas nama kakak tertahan di gudang karena alamatnya kurang lengkap.",
      "Mohon dicek foto paketnya di file berikut ya kak.",
    ],
    file: "Foto_Paket_KirimCepat.apk",
    scam: true,
    choices: [
      {
        text: "Buka filenya, siapa tahu memang paketku",
        grade: "bahaya",
        feedback: "File .apk adalah aplikasi. Setelah dipasang, ia bisa membaca SMS termasuk OTP bank, lalu pelaku menguras rekeningmu tanpa kamu sadari.",
      },
      {
        text: "Cek status paket langsung di aplikasi tempat aku belanja",
        grade: "tepat",
        feedback: "Tepat. Status paket asli selalu ada di aplikasi belanja atau situs ekspedisi yang kamu buka sendiri.",
      },
      {
        text: "Balas, minta dikirim foto biasa saja",
        grade: "kurang",
        feedback: "Kamu tidak membuka filenya, itu bagus. Tapi membalas menandakan nomormu aktif, dan pelaku akan mencoba cara lain.",
      },
    ],
    tells: [
      "Foto tidak pernah berbentuk .apk. Akhiran .apk berarti aplikasi Android.",
      "Hampir semua orang sedang menunggu paket, jadi tebakan itu mudah tepat.",
      "Nomor pribadi yang tidak ada di kontakmu.",
    ],
  },
  {
    id: "nomor-baru",
    title: "Teman ganti nomor",
    channel: "WhatsApp",
    from: "+62 813-xxxx-5521",
    sub: "Nomor baru · foto profilnya foto temanmu",
    context: "Kamu memang punya teman bernama Dina.",
    messages: [
      "Hai, ini aku Dina. HP lamaku rusak jadi pakai nomor baru dulu ya.",
      "Aku lagi darurat banget, bisa pinjam Rp500.000 dulu? Besok aku ganti.",
      "Jangan bilang siapa-siapa ya, malu aku.",
    ],
    scam: true,
    choices: [
      {
        text: "Transfer saja, kasihan dia lagi susah",
        grade: "bahaya",
        feedback: "Foto profil gampang diambil dari media sosial. Tanpa memastikan, uangmu bisa pergi ke orang yang sama sekali bukan Dina.",
      },
      {
        text: "Minta dia kirim voice note dulu",
        grade: "kurang",
        feedback: "Suara sekarang bisa ditiru dengan AI dari video yang pernah diunggah. Lebih aman menelepon nomor lama Dina.",
      },
      {
        text: "Telepon nomor lama Dina atau tanya teman yang kenal dia",
        grade: "tepat",
        feedback: "Tepat. Memastikan lewat jalur yang sudah kamu tahu adalah cara paling cepat membongkar penyamaran.",
      },
    ],
    tells: [
      "Nomor baru yang langsung minta uang.",
      "Ada alasan darurat supaya kamu tidak sempat berpikir.",
      "Diminta merahasiakan, supaya kamu tidak bertanya ke orang lain.",
    ],
  },
  {
    id: "otp-asli",
    title: "SMS kode masuk",
    channel: "SMS",
    from: "DompetKu",
    sub: "Nama pengirim resmi",
    context: "Kamu baru saja menekan Masuk di aplikasi DompetKu di HP-mu sendiri.",
    messages: [
      "482913 adalah kode masuk DompetKu kamu. Berlaku 5 menit. Kode ini rahasia, jangan berikan ke siapa pun, termasuk petugas DompetKu.",
    ],
    scam: false,
    choices: [
      {
        text: "Masukkan kodenya di aplikasi DompetKu",
        grade: "tepat",
        feedback: "Tepat. Kode ini muncul karena kamu sendiri yang masuk. Memakainya di aplikasi resmi itu aman.",
      },
      {
        text: "Abaikan, semua SMS berisi kode itu penipuan",
        grade: "kurang",
        feedback: "Tidak semua. Kode yang kamu minta sendiri itu wajar. Yang berbahaya adalah ketika ada orang lain yang memintanya darimu.",
      },
      {
        text: "Teruskan kodenya ke CS DompetKu biar akunku aman",
        grade: "bahaya",
        feedback: "Pesannya sendiri bilang jangan berikan ke petugas. Siapa pun yang meminta kode ini, termasuk yang mengaku CS, sedang mencoba masuk ke akunmu.",
      },
    ],
    tells: [
      "Kamu sendiri yang memicu kode ini dengan masuk ke aplikasi.",
      "Pesannya tidak meminta apa pun darimu, malah mengingatkan untuk merahasiakan kode.",
      "Tidak ada tautan untuk diklik.",
    ],
  },
  {
    id: "giveaway",
    title: "Menang giveaway",
    channel: "Instagram",
    from: "@tokokita.official.giveaway",
    sub: "Akun dibuat 2 minggu lalu · 38 postingan",
    context: "Kamu memang pernah berkomentar di postingan giveaway akun TokoKita yang asli.",
    messages: [
      "Selamat kak! Kamu terpilih sebagai pemenang giveaway HP dari TokoKita.",
      "Untuk klaim hadiah cukup bayar ongkir Rp75.000 ke rekening admin.",
      "Batas klaim sampai jam 9 malam ini ya kak, setelah itu hangus.",
    ],
    scam: true,
    choices: [
      {
        text: "Bayar ongkirnya, cuma 75 ribu",
        grade: "bahaya",
        feedback: "Setelah ongkir biasanya muncul pajak hadiah, biaya asuransi, dan seterusnya. Hadiahnya tidak pernah ada.",
      },
      {
        text: "Minta bukti foto hadiahnya dulu",
        grade: "kurang",
        feedback: "Foto hadiah gampang diambil dari internet. Bukti yang berarti hanya pengumuman di akun resmi penyelenggara.",
      },
      {
        text: "Cek akun resmi TokoKita, apakah pemenangnya diumumkan di sana",
        grade: "tepat",
        feedback: "Tepat. Penipu memantau komentar di giveaway asli, lalu menghubungi para komentator dengan akun tiruan.",
      },
    ],
    tells: [
      "Nama akun mirip resmi, tapi ditambah official.giveaway. Akunnya baru dan postingannya sedikit.",
      "Hadiah asli tidak perlu ditebus dengan ongkir.",
      "Tenggat malam ini supaya kamu tidak sempat mengecek.",
    ],
  },
  {
    id: "pinjol",
    title: "Pinjaman cair kilat",
    channel: "SMS",
    from: "+62 878-xxxx-1903",
    sub: "Nomor pribadi",
    context: "Bulan ini uangmu memang sedang tipis.",
    messages: [
      "PINJAMAN CEPAT cair dalam 10 menit tanpa BI checking. Limit sampai Rp20 juta, cukup foto KTP dan selfie.",
      "Download aplikasinya di danakilat-cair.xyz/daftar",
    ],
    scam: true,
    choices: [
      {
        text: "Daftar, toh cuma kirim KTP",
        grade: "bahaya",
        feedback: "Foto KTP dan selfie bisa dipakai untuk mengajukan pinjaman atas namamu di tempat lain. Aplikasi pinjol ilegal juga sering menyedot kontakmu untuk meneror.",
      },
      {
        text: "Pinjam sedikit dulu buat coba",
        grade: "bahaya",
        feedback: "Jumlah kecil tetap membuka akses ke data dan kontakmu, dan bunga serta dendanya bisa melonjak jauh melebihi pinjaman.",
      },
      {
        text: "Cek dulu legalitasnya lewat WhatsApp OJK",
        grade: "tepat",
        feedback: "Tepat. Kirim nama aplikasinya ke WhatsApp OJK 081 157 157 157 untuk tahu apakah terdaftar.",
      },
    ],
    tells: [
      "Penawaran pinjaman lewat SMS dari nomor pribadi. OJK menyebut ini salah satu ciri pinjol ilegal.",
      "Cair kilat tanpa pengecekan apa pun.",
      "Diminta foto KTP dan selfie sejak awal.",
      "Aplikasi diunduh dari situs .xyz, bukan toko aplikasi resmi.",
    ],
  },
  {
    id: "investasi",
    title: "Grup investasi cuan",
    channel: "Telegram",
    from: "Mentor Cuan Bareng",
    sub: "Grup · kamu dimasukkan oleh orang asing",
    context: "Kamu dimasukkan ke grup ini oleh akun yang tidak kamu kenal.",
    messages: [
      "Member kami rata-rata profit 30% per minggu, dijamin tanpa risiko.",
      "Modal kecil mulai Rp100.000, pakai robot trading otomatis.",
      "Slot member baru tinggal 5 orang, transfer sekarang juga biar kebagian.",
    ],
    scam: true,
    choices: [
      {
        text: "Coba modal kecil dulu, kalau untung baru tambah",
        grade: "bahaya",
        feedback: "Ini memang jebakannya. Untung pertama sering dibayar supaya kamu menambah setoran, lalu dana besarnya tidak bisa ditarik.",
      },
      {
        text: "Tanya testimoni member lain",
        grade: "kurang",
        feedback: "Testimoni di grup seperti ini sering dari akun palsu atau orang bayaran. Ukurannya adalah izin resmi, bukan cerita sukses.",
      },
      {
        text: "Keluar grup dan cek izinnya ke OJK",
        grade: "tepat",
        feedback: "Tepat. Untung tetap puluhan persen per minggu tanpa risiko tidak masuk akal untuk investasi apa pun.",
      },
    ],
    tells: [
      "Untung tetap yang besar dan dijamin tanpa risiko.",
      "Kamu dimasukkan ke grup tanpa diminta.",
      "Slot terbatas dan desakan transfer sekarang juga.",
    ],
  },
  {
    id: "wawancara",
    title: "Undangan wawancara",
    channel: "Email",
    from: "Tim Rekrutmen Sinar Logistik",
    sub: "Dikirim ke email yang kamu pakai untuk melamar",
    context: "Dua minggu lalu kamu melamar posisi staf administrasi lewat situs karier resmi Sinar Logistik.",
    messages: [
      "Terima kasih sudah melamar posisi Staf Administrasi. Kami mengundangmu wawancara pada Kamis depan pukul 10.00 di kantor kami.",
      "Seluruh proses rekrutmen tidak dipungut biaya apa pun. Silakan konfirmasi kehadiran lewat portal karier tempat kamu melamar.",
    ],
    scam: false,
    choices: [
      {
        text: "Konfirmasi lewat portal karier tempat aku melamar",
        grade: "tepat",
        feedback: "Tepat. Kamu memang melamar, tidak ada permintaan uang, dan konfirmasinya lewat portal yang kamu buka sendiri.",
      },
      {
        text: "Abaikan, semua tawaran kerja lewat email itu palsu",
        grade: "kurang",
        feedback: "Terlalu curiga juga bisa merugikan. Ciri penipuannya tidak ada di sini, dan kamu bisa memastikannya lewat portal resmi.",
      },
      {
        text: "Balas dengan foto KTP dan nomor rekening untuk persiapan",
        grade: "bahaya",
        feedback: "Tidak ada yang memintanya. Jangan kirim data sensitif lewat email sebelum benar-benar diperlukan dan lewat jalur resmi.",
      },
    ],
    tells: [
      "Kamu memang melamar posisi ini.",
      "Tidak ada permintaan uang atau data sensitif. Malah ditegaskan gratis.",
      "Konfirmasi lewat portal yang kamu buka sendiri, bukan tautan di email.",
    ],
  },
  {
    id: "bank",
    title: "Tarif baru m-banking",
    channel: "SMS",
    from: "+62 812-xxxx-0077",
    sub: "Nomor pribadi, bukan nama pengirim resmi",
    context: "Kamu nasabah Bank Nusantara.",
    messages: [
      "Nasabah Yth, akun m-banking Anda akan diblokir dalam 24 jam karena perubahan tarif transfer. Segera konfirmasi di nusantara-tarif-baru.top/konfirmasi",
    ],
    scam: true,
    choices: [
      {
        text: "Klik dan konfirmasi supaya tidak diblokir",
        grade: "bahaya",
        feedback: "Halaman itu meniru tampilan bank untuk mencuri user, password, dan OTP-mu. Begitu diisi, rekeningmu bisa langsung dikuras.",
      },
      {
        text: "Balas SMS-nya, tanya apakah ini resmi",
        grade: "kurang",
        feedback: "Pengirimnya akan bilang resmi. Pastikan lewat jalur yang tidak mereka kendalikan.",
      },
      {
        text: "Buka aplikasi bank langsung atau telepon nomor di balik kartu ATM",
        grade: "tepat",
        feedback: "Tepat. Kalau memang ada perubahan, informasinya juga ada di aplikasi dan situs resmi bank.",
      },
    ],
    tells: [
      "Ancaman pemblokiran dengan tenggat 24 jam.",
      "Dikirim dari nomor pribadi.",
      "Alamatnya berakhiran .top dan bukan domain resmi bank.",
    ],
  },
  {
    id: "salah-transfer",
    title: "Salah transfer",
    channel: "WhatsApp",
    from: "Bu Ratna",
    sub: "+62 831-xxxx-5521 · tidak ada di kontakmu",
    context: "Sejam lalu ada dana masuk Rp1.500.000 ke rekeningmu dari nama yang tidak kamu kenal.",
    messages: [
      "Assalamualaikum kak, mohon maaf sekali, tadi saya salah transfer Rp1.500.000 ke rekening kakak.",
      "Itu uang buat biaya rumah sakit anak saya kak. Tolong segera dikembalikan ya.",
      "Kirim ke rekening suami saya saja kak, nomornya saya kirim sebentar lagi.",
    ],
    scam: true,
    choices: [
      {
        text: "Kirim balik ke rekening suaminya, kasihan",
        grade: "bahaya",
        feedback: "Uang yang masuk bisa saja pinjol yang dicairkan atas namamu. Kalau kamu kirim ke rekening lain, utangnya tetap ditagih ke kamu, lengkap dengan bunganya.",
      },
      {
        text: "Kirim balik sendiri ke rekening yang tadi mentransfer",
        grade: "kurang",
        feedback: "Lebih baik daripada rekening lain, tapi tetap tanpa catatan resmi. Kalau dananya ternyata pinjaman atas namamu, kamu yang tercatat menerimanya.",
      },
      {
        text: "Cek mutasi di aplikasi bank, lalu laporkan ke bank biar bank yang mengembalikan",
        grade: "tepat",
        feedback: "Tepat. Bank bisa mengembalikan dana ke pengirim asal lewat jalur resmi, dan kamu punya bukti bahwa uangnya tidak kamu pakai.",
      },
    ],
    tells: [
      "Minta dikembalikan ke rekening lain, bukan ke pengirim asal.",
      "Cerita sedih dan desakan supaya kamu tidak sempat mengecek.",
      "Uang nyasar bisa berasal dari pinjol yang memakai datamu.",
    ],
  },
  {
    id: "cs-layar",
    title: "CS yang membalas keluhanmu",
    channel: "Instagram",
    from: "@dompetku.care.id",
    sub: "Akun dibuat 5 hari lalu · logo DompetKu di foto profil",
    context: "Semalam kamu mengeluh di kolom komentar akun DompetKu yang asli karena saldomu tertahan.",
    messages: [
      "Halo kak, kami dari tim DompetKu Care, sudah lihat keluhan kakak soal saldo tertahan.",
      "Supaya cepat, silakan unduh aplikasi BantuLayar lalu nyalakan berbagi layar. Kirimkan 9 angka yang muncul ya kak.",
      "Prosesnya hanya 5 menit dan harus segera, sebelum saldonya hangus.",
    ],
    scam: true,
    choices: [
      {
        text: "Pasang aplikasinya, yang penting saldoku cepat kembali",
        grade: "bahaya",
        feedback: "Sembilan angka itu kunci akses ke HP-mu. Begitu layar terbagi, mereka melihat PIN dan OTP yang kamu ketik, lalu menguras saldo dari jauh.",
      },
      {
        text: "Minta mereka telepon dulu biar yakin",
        grade: "kurang",
        feedback: "Telepon tidak membuktikan apa-apa. Penipu yang menyamar jadi CS memang siap menelepon dengan naskah yang meyakinkan.",
      },
      {
        text: "Abaikan DM-nya, hubungi CS lewat menu Bantuan di aplikasi DompetKu",
        grade: "tepat",
        feedback: "Tepat. Penipu memantau keluhan di kolom komentar lalu menyamar jadi CS. Jalur resmi ada di dalam aplikasi, dan CS asli tidak pernah minta berbagi layar.",
      },
    ],
    tells: [
      "Akun baru yang muncul setelah kamu mengeluh di tempat umum.",
      "Diminta memasang aplikasi dan berbagi layar.",
      "Diminta mengirim angka dari aplikasi itu, yang sebenarnya kunci akses ke HP-mu.",
      "Didesak segera sebelum saldo hangus.",
    ],
  },
];
