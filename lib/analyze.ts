// Rule-based checker. Every flag carries a human reason, so results can be
// explained instead of just scored. Runs fully in the browser.

export type Span = { start: number; end: number; rule: string };
export type Flag = { id: string; label: string; why: string; tip: string; weight: number; hits: string[] };
export type LinkReport = { url: string; host: string; issues: string[] };
export type Level = 0 | 1 | 2 | 3;
export type Result = { score: number; level: Level; flags: Flag[]; spans: Span[]; links: LinkReport[] };

type Rule = { id: string; label: string; why: string; tip: string; weight: number; re?: RegExp };

export const MAX_LENGTH = 5000;

export const RULES: Rule[] = [
  {
    id: "kode",
    label: "Meminta kode rahasia",
    why: "OTP, PIN, dan password adalah kunci akunmu. Bank, e-commerce, dan kurir resmi tidak pernah memintanya lewat chat atau telepon.",
    tip: "Jangan bagikan kode apa pun. Kalau sudah terlanjur, ganti password dan hubungi layanan resminya sekarang.",
    weight: 3,
    re: /\b(?:kirim(?:kan)?|berikan|kasih(?:kan)?|bagikan|sebutkan|infokan|share|bacakan|meminta|minta|fotokan|screenshot|ss)\b[^.!?\n]{0,40}?\b(?:kode|otp|pin|password|kata\s*sandi)\b|\b(?:kode\s+otp|otp|kode\s+verifikasi)\b[^.!?\n]{0,30}?\b(?:ke|kepada)\s+(?:kami|saya|admin|petugas|cs|operator)\b/gi,
  },
  {
    id: "bayar",
    label: "Minta bayar di depan",
    why: "Hadiah asli tidak perlu ditebus, lowongan asli tidak memungut biaya, dan pinjaman resmi tidak minta transfer sebelum dana cair.",
    tip: "Jangan transfer apa pun. Pihak yang sah tidak meminta uang di depan untuk hadiah, pekerjaan, atau pinjaman.",
    weight: 3,
    re: /\bbiaya\s+(?:admin(?:istrasi)?|pendaftaran|registrasi|aktivasi|pengiriman|ongkir|pajak|penarikan|pencairan|asuransi|materai|verifikasi)\b|\buang\s+(?:jaminan|muka|pendaftaran)\b|\bdeposit\b|\btransfer\s+(?:dulu|terlebih\s+dahulu|sebesar|sekarang|ke\s+rekening)\b|\b(?:bayar|tebus)\s+(?:dulu|ongkir|pajak|biaya)\b|\bpajak\s+hadiah\b|\btf\s+dulu\b/gi,
  },
  {
    id: "hadiah",
    label: "Menang hadiah yang tidak kamu ikuti",
    why: "Kalau kamu tidak merasa ikut undian, kabar menang itu umpan. Pemenang undian resmi diumumkan di akun resmi penyelenggara, bukan lewat DM acak.",
    tip: "Cek pengumuman pemenang di akun atau situs resmi penyelenggara yang kamu cari sendiri.",
    weight: 2,
    re: /\bselamat[,!.]?\s+(?:anda|kamu|kak)\b|\b(?:anda|kamu)\s+(?:terpilih|beruntung|memenangkan)\b|\bpemenang\b|\bmenang(?:kan)?\s+(?:hadiah|undian|giveaway)\b|\bgiveaway\b|\bundian\b|\bklaim\s+hadiah\b/gi,
  },
  {
    id: "untung",
    label: "Janji untung yang tidak wajar",
    why: "Investasi legal tidak bisa menjamin untung tetap yang besar. Imbal hasil puluhan persen per minggu adalah ciri money game: member lama dibayar dari uang member baru.",
    tip: "Cek izinnya ke Kontak OJK 157 atau WhatsApp 081 157 157 157 sebelum menyetor apa pun.",
    weight: 2,
    re: /\b(?:profit|untung|keuntungan|return|imbal\s+hasil|bunga)\s+(?:pasti|tetap|dijamin|harian|\d+\s*%)|\bdijamin\s+(?:untung|cuan|profit|balik\s+modal)\b|\btanpa\s+risiko\b|\bpass?if\s+income\b|\bpassive\s+income\b|\bmodal\s+(?:kecil|receh)\b|\bcuan\s+(?:cepat|harian)\b|\b\d+\s*%\s*(?:per|tiap|setiap)\s+(?:hari|minggu|bulan)\b|\brobot\s+trading\b/gi,
  },
  {
    id: "kerja",
    label: "Tawaran kerja yang terlalu mudah",
    why: "Bayaran besar untuk tugas sepele adalah pola penipuan tugas: awalnya kamu dibayar kecil supaya percaya, lalu diminta deposit untuk tugas berikutnya.",
    tip: "Cari nama perusahaannya di situs karier resmi. Lowongan asli tidak meminta deposit atau biaya apa pun.",
    weight: 2,
    re: /\bkerja\s+(?:dari\s+rumah|sampingan|online|paruh\s+waktu)\b|\bpart\s*-?time\b|\btugas\s+(?:harian|mudah|sederhana|ringan)\b|\b(?:like|follow)\s+(?:dan|&)\s+(?:subscribe|follow|like)\b|\b(?:gaji|komisi|bayaran|penghasilan)\s+(?:rp\s*)?[\d.,]+\s*(?:rb|ribu|k|jt|juta)?\s*(?:per|\/)\s*(?:hari|tugas|jam|like)\b|\btanpa\s+(?:pengalaman|interview|wawancara)\b|\blangsung\s+(?:diterima|kerja|gajian)\b/gi,
  },
  {
    id: "data",
    label: "Minta data pribadi",
    why: "Foto KTP, selfie dengan KTP, dan nama ibu kandung bisa dipakai untuk mengajukan pinjaman atau membobol akun atas namamu.",
    tip: "Jangan kirim KTP, selfie, atau data kartu lewat chat. Kalau memang perlu, lakukan di aplikasi atau kantor resminya.",
    weight: 2,
    re: /\bfoto\s+(?:ktp|kk|kartu)\b|\bselfie\b|\bnomor\s+(?:ktp|nik|kartu|rekening|kk)\b|\bnik\b|\bnama\s+ibu\s+kandung\b|\bdata\s+(?:diri|pribadi)\b|\bmasa\s+berlaku\s+kartu\b|\bcvv\b/gi,
  },
  {
    id: "pindah",
    label: "Diajak pindah ke chat pribadi",
    why: "Pindah ke WhatsApp atau Telegram pribadi membuat percakapan lepas dari pengawasan platform dan lebih sulit dilaporkan.",
    tip: "Tetap di kanal resmi. Layanan resmi tidak perlu memindahkanmu ke grup atau nomor pribadi.",
    weight: 1,
    re: /\bwa\.me\/|\bt\.me\/|\b(?:gabung|join|masuk)\s+(?:ke\s+)?(?:grup|group|telegram)\b|\bgrup\s+telegram\b|\b(?:hubungi|chat|kontak)\s+(?:admin|kami|cs)\b|\blink\s+di\s+bio\b/gi,
  },
  {
    id: "resmi",
    label: "Mengaku dari pihak resmi",
    why: "Nama lembaga gampang dicatut. Yang penting bukan nama pengirimnya, tapi apakah kamu bisa memastikannya lewat nomor atau aplikasi resmi.",
    tip: "Hubungi lembaganya lewat nomor di situs resmi atau di balik kartu ATM, bukan kontak yang ada di pesan ini.",
    weight: 1,
    re: /\bpihak\s+(?:bank|resmi|kepolisian|kurir)\b|\bcustomer\s+service\b|\b(?:cs|admin)\s+resmi\b|\bnasabah\s+yth\b|\bpetugas\s+(?:bank|kurir|pajak)\b|\b(?:ojk|polri|kepolisian|bea\s+cukai|kantor\s+pajak)\b|\btim\s+(?:keamanan|verifikasi)\b/gi,
  },
  {
    id: "kenalan",
    label: "Mengaku kenalan dari nomor baru",
    why: "Penipu sering menyamar jadi teman atau keluarga yang ganti nomor, lalu minta transfer. Suara pun sekarang bisa ditiru dengan AI.",
    tip: "Telepon nomor lamanya, atau tanyakan hal yang cuma dia yang tahu.",
    weight: 2,
    re: /\bganti\s+nomor\b|\bnomor\s+baru\b|\bhp\s*(?:lama)?(?:ku)?\s+(?:hilang|rusak|mati|dicuri)\b|\bpinjam\s+(?:uang|duit)\b|\bpinjam\b[^.!?\n]{0,20}?\bdulu\b|\btolong\s+(?:transfer|tf|kirim(?:in)?)\b|\bbesok\s+(?:aku|saya)\s+(?:ganti|balikin|kembalikan)\b|\blagi\s+darurat\b/gi,
  },
  {
    id: "file",
    label: "Menyuruh buka file atau pasang aplikasi",
    why: "File .apk yang dikirim lewat chat adalah aplikasi Android. Setelah dipasang, ia bisa membaca SMS termasuk OTP, lalu menguras rekening. Foto paket, undangan, dan surat tilang asli tidak berbentuk aplikasi.",
    tip: "Jangan buka file .apk dari chat. Cek paket di aplikasi tempat kamu belanja.",
    weight: 3,
    re: /[\w-]+\.apk\b|\bapk\b|\b(?:install|instal|pasang|unduh|download)\s+(?:aplikasi|apk|file)\w*/gi,
  },
  {
    id: "pinjol",
    label: "Pinjaman yang terlalu mudah",
    why: "Pinjol ilegal menawarkan dana cair kilat tanpa syarat, lalu menagih dengan bunga dan denda besar serta meneror kontakmu. OJK menyebut penawaran lewat SMS atau WhatsApp sebagai salah satu cirinya.",
    tip: "Cek legalitasnya lewat WhatsApp OJK 081 157 157 157 sebelum memberi data apa pun.",
    weight: 2,
    re: /\b(?:pinjaman|pinjol|dana\s+tunai|kredit)\s+(?:cepat|kilat|instan|tanpa|mudah)\b|\bcair\s+(?:dalam|hari\s+ini|cepat|langsung|\d+\s*(?:menit|jam))\b|\btanpa\s+(?:agunan|jaminan|bi\s*checking|slik|survei|survey)\b|\bacc\s+(?:langsung|cepat|instan)\b|\blimit\s+(?:besar|hingga|sampai)\b|\bbunga\s+(?:rendah|0|nol)\b/gi,
  },
  {
    id: "rahasia",
    label: "Minta dirahasiakan",
    why: "Penipu ingin kamu tidak sempat bertanya ke orang lain, karena satu pertanyaan ke teman sering cukup untuk membongkar tipuannya.",
    tip: "Ceritakan ke orang yang kamu percaya sebelum memutuskan apa pun.",
    weight: 2,
    re: /\bjangan\s+(?:beri\s*tahu|bilang|kasih\s*tahu|cerita)(?:\s+(?:ke|kepada|sama))?\s+(?:siapa|orang|keluarga|ortu)|\brahasiakan\b|\brahasia\s+(?:kita|ya)\b|\bcukup\s+kita\s+berdua\b/gi,
  },
  {
    id: "ancam",
    label: "Ancaman atau menakut-nakuti",
    why: "Rasa takut membuat orang bertindak tanpa berpikir. Lembaga resmi memakai surat dan prosedur yang jelas, bukan ancaman lewat chat.",
    tip: "Tenang dulu. Cek status akunmu langsung di aplikasi resminya, bukan lewat tautan di pesan.",
    weight: 2,
    re: /\bakan\s+(?:diblokir|dinonaktifkan|dihapus|ditutup|dilaporkan|diproses|ditangkap|disebar(?:kan)?|dibekukan)\b|\b(?:diblokir|dibekukan|ditangguhkan)\s+(?:permanen|sementara)\b|\bdiproses\s+(?:secara\s+)?hukum\b|\bdenda\b|\bsebar(?:kan)?\s+(?:foto|video|data)\b|\bpenjara\b/gi,
  },
  {
    id: "buru",
    label: "Didesak buru-buru",
    why: "Tenggat mepet dibuat supaya kamu tidak sempat mengecek. Urusan yang sah tetap bisa diselesaikan walau kamu menunda sebentar untuk memastikan.",
    tip: "Tunda dulu. Sepuluh menit untuk mengecek tidak akan merugikanmu kalau urusannya memang asli.",
    weight: 1,
    re: /\bsegera\b|\bsekarang\s+juga\b|\bhari\s+ini\s+juga\b|\bsecepatnya\b|\bburuan\b|\bbatas\s+(?:waktu|klaim)\b|\bdalam\s+\d+\s*(?:menit|jam)\b|\b(?:kuota|slot|kesempatan)\s+(?:terbatas|tinggal)\b|\bhanya\s+hari\s+ini\b|\bhangus\b/gi,
  },
  // Only raised by the user's own answers, not by text.
  {
    id: "asing",
    label: "Pengirim tidak dikenal",
    why: "Pesan tak terduga dari nomor atau akun asing patut dicek dulu, apalagi kalau isinya soal uang, hadiah, atau akun.",
    tip: "Cari tahu siapa pengirimnya lewat jalur lain sebelum membalas.",
    weight: 1,
  },
  {
    id: "akun",
    label: "Akun baru atau namanya mirip akun resmi",
    why: "Akun palsu biasanya baru dibuat, pengikutnya sedikit, dan memakai nama seperti official_, cs., atau huruf yang ditukar.",
    tip: "Bandingkan dengan akun resmi: tanda verifikasi, umur akun, dan tautan dari situs resminya.",
    weight: 2,
  },
];

export const CONTEXT: { id: string; label: string }[] = [
  { id: "asing", label: "Pengirimnya tidak kukenal" },
  { id: "kenalan", label: "Ngaku kenalan, tapi nomornya baru" },
  { id: "akun", label: "Akunnya baru atau namanya mirip akun resmi" },
  { id: "bayar", label: "Aku diminta bayar atau transfer" },
  { id: "kode", label: "Aku diminta kode OTP, PIN, atau password" },
  { id: "file", label: "Aku disuruh pasang aplikasi atau buka file" },
];

const LINK_FLAG = {
  id: "tautan",
  label: "Tautan mencurigakan",
  why: "Alamat tautannya punya ciri yang sering dipakai situs palsu. Rinciannya ada di bagian tautan.",
  tip: "Jangan buka tautannya. Ketik sendiri alamat situs resminya, atau buka aplikasinya langsung.",
};

// A request preceded by "jangan" or "tidak pernah" is a warning, not a request.
const NEGATED = /(?:jangan|tidak\s+pernah|bukan|never)\s+$/i;

const URL_RE =
  /\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+(?:com|id|net|org|xyz|top|click|me|ly|link|site|online|info|biz|shop|vip|icu|live|app|io|cc|tk|ml|ga|cf|gq|lol|rest|buzz|cyou|monster|sbs|cfd)\b(?:\/[^\s<>"']*)?/gi;

const SHORTENERS = new Set(["bit.ly", "s.id", "tinyurl.com", "cutt.ly", "t.ly", "shorturl.at", "is.gd", "rebrand.ly", "ow.ly", "rb.gy"]);
const CHEAP_TLDS = new Set(["xyz", "top", "click", "icu", "buzz", "vip", "tk", "ml", "ga", "cf", "gq", "lol", "rest", "cyou", "monster", "sbs", "cfd"]);

// ponytail: hand-picked brand list, grows by adding a line. A real allowlist service would scale further.
const BRANDS: { name: string; keys: string[]; official: string[] }[] = [
  { name: "BCA", keys: ["bca", "klikbca"], official: ["bca.co.id", "klikbca.com"] },
  { name: "BRI", keys: ["bri", "brimo"], official: ["bri.co.id"] },
  { name: "BNI", keys: ["bni"], official: ["bni.co.id"] },
  { name: "Bank Mandiri", keys: ["mandiri", "livin"], official: ["bankmandiri.co.id"] },
  { name: "BSI", keys: ["bsi"], official: ["bankbsi.co.id"] },
  { name: "Shopee", keys: ["shopee"], official: ["shopee.co.id", "shopee.com"] },
  { name: "Tokopedia", keys: ["tokopedia"], official: ["tokopedia.com"] },
  { name: "Lazada", keys: ["lazada"], official: ["lazada.co.id"] },
  { name: "DANA", keys: ["dana"], official: ["dana.id"] },
  { name: "GoPay", keys: ["gopay", "gojek"], official: ["gojek.com", "gopay.co.id"] },
  { name: "OVO", keys: ["ovo"], official: ["ovo.id"] },
  { name: "J&T Express", keys: ["jnt", "jntexpress"], official: ["jet.co.id"] },
  { name: "JNE", keys: ["jne"], official: ["jne.co.id"] },
  { name: "OJK", keys: ["ojk"], official: ["ojk.go.id"] },
  { name: "DJP", keys: ["pajak", "djp"], official: ["pajak.go.id"] },
  { name: "Polri", keys: ["polri", "tilang", "etilang"], official: ["polri.go.id"] },
  { name: "BPJS", keys: ["bpjs"], official: ["bpjs-kesehatan.go.id", "bpjsketenagakerjaan.go.id"] },
  { name: "PLN", keys: ["pln"], official: ["pln.co.id"] },
  { name: "Telkomsel", keys: ["telkomsel"], official: ["telkomsel.com"] },
  { name: "WhatsApp", keys: ["whatsapp"], official: ["whatsapp.com"] },
  { name: "Instagram", keys: ["instagram"], official: ["instagram.com"] },
];

export function checkLink(raw: string): { report: LinkReport; weight: number } {
  const issues: string[] = [];
  let weight = 0;
  const note = (w: number, text: string) => {
    weight += w;
    issues.push(text);
  };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `http://${raw}`);
  } catch {
    return { report: { url: raw, host: raw, issues: ["Alamatnya tidak bisa dibaca sebagai tautan yang wajar."] }, weight: 1 };
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const tokens = host.split(/[.-]/);
  const tld = tokens[tokens.length - 1];

  if (SHORTENERS.has(host)) note(2, "Tautan pendek: alamat tujuan aslinya tersembunyi.");
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) note(3, "Memakai angka IP, bukan nama situs. Situs resmi hampir tidak pernah begini.");
  if (host.includes("xn--")) note(3, "Memakai huruf non-Latin yang bisa menyamar jadi huruf biasa (xn--).");
  if (CHEAP_TLDS.has(tld)) note(2, `Akhiran .${tld} murah dan sering dipakai untuk situs sekali pakai.`);
  for (const b of BRANDS) {
    const mentions = tokens.some((t) => b.keys.some((k) => t === k || (k.length >= 5 && t.startsWith(k))));
    const isOfficial = b.official.some((o) => host === o || host.endsWith(`.${o}`));
    if (mentions && !isOfficial) note(3, `Memakai nama ${b.name}, tapi bukan domain resminya (${b.official[0]}).`);
  }
  if (/\.apk$/i.test(url.pathname)) note(3, "Mengarah ke file .apk (aplikasi Android), bukan halaman web.");
  if (url.username) note(2, "Ada tanda @ yang bisa menyembunyikan alamat sebenarnya.");
  if ((host.match(/-/g) ?? []).length >= 2) note(1, "Banyak tanda hubung, pola umum di alamat tiruan.");
  if (/^http:\/\//i.test(raw)) note(1, "Tidak memakai https. Tapi ingat, https pun tidak menjamin situsnya asli.");

  return { report: { url: raw, host, issues }, weight: Math.min(3, weight) };
}

export function levelFor(score: number): Level {
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  if (score >= 1) return 1;
  return 0;
}

export function analyze(text: string, context: string[] = []): Result {
  const input = text.slice(0, MAX_LENGTH);
  const spans: Span[] = [];
  const hits = new Map<string, string[]>();
  const hit = (rule: string, start: number, end: number) => {
    spans.push({ start, end, rule });
    hits.set(rule, [...(hits.get(rule) ?? []), input.slice(start, end)]);
  };

  for (const r of RULES) {
    if (!r.re) continue;
    for (const m of input.matchAll(r.re)) {
      const i = m.index;
      if (NEGATED.test(input.slice(Math.max(0, i - 16), i))) continue;
      hit(r.id, i, i + m[0].length);
    }
  }

  const links: LinkReport[] = [];
  let linkWeight = 0;
  for (const m of input.matchAll(URL_RE)) {
    const raw = m[0].replace(/[.,;:!?)\]]+$/, "");
    const { report, weight } = checkLink(raw);
    links.push(report);
    if (weight > 0) {
      spans.push({ start: m.index, end: m.index + raw.length, rule: "tautan" });
      linkWeight = Math.max(linkWeight, weight);
    }
  }

  const flags: Flag[] = RULES.filter((r) => hits.has(r.id) || context.includes(r.id)).map((r) => ({
    id: r.id,
    label: r.label,
    why: r.why,
    tip: r.tip,
    weight: r.weight,
    hits: [...new Set(hits.get(r.id) ?? [])],
  }));
  if (linkWeight > 0) {
    flags.push({ ...LINK_FLAG, weight: linkWeight, hits: links.filter((l) => l.issues.length).map((l) => l.host) });
  }
  flags.sort((a, b) => b.weight - a.weight);

  const score = flags.reduce((sum, f) => sum + f.weight, 0);
  return { score, level: levelFor(score), flags, spans, links };
}

export const RULE_LABELS: Record<string, string> = Object.fromEntries([
  ...RULES.map((r) => [r.id, r.label]),
  [LINK_FLAG.id, LINK_FLAG.label],
]);
export const RULE_WEIGHTS: Record<string, number> = Object.fromEntries([...RULES.map((r) => [r.id, r.weight]), [LINK_FLAG.id, 3]]);
