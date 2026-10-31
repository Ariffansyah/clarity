// Shared by the browser and the API routes. Nothing here talks to the network.

export type AIOpinion = {
  level: 0 | 1 | 2 | 3;
  ringkasan: string;
  modus: string;
  tanda: { kutipan: string; alasan: string }[];
  langkah: string[];
  balasan: string;
};

export type SimLine = { from: "penipu" | "kamu"; text: string };
export type SimReply = { balasan: string; selesai: boolean };
export type SimReview = {
  hasil: "aman" | "hampir" | "kena";
  ringkasan: string;
  bagus: string[];
  perbaiki: string[];
  tanda: string[];
};

export const MAX_AI_TEXT = 4000;
export const MAX_SIM_TURNS = 8;

// Masks emails and long digit runs (phone, account, NIK, OTP) before text leaves the device.
// Rupiah amounts are kept because they matter for judging the offer.
export function redact(input: string): { text: string; count: number } {
  let count = 0;
  const text = input
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, () => {
      count++;
      return "[EMAIL]";
    })
    .replace(/\+?\d(?:[\s.-]?\d){5,}/g, (m: string, offset: number, s: string) => {
      if (/rp\.?\s*$/i.test(s.slice(Math.max(0, offset - 4), offset))) return m;
      count++;
      return "[ANGKA]";
    });
  return { text, count };
}

// All fictional. `brief` is the role the AI plays; the rest is shown in the UI.
export const PERSONAS = [
  {
    id: "kerja",
    name: "Rekruter kerja online",
    sender: "HRD Kreasi Digital",
    channel: "WhatsApp",
    situasi: "Nomor asing menawarimu kerja sampingan.",
    brief:
      "Kamu 'Rina', mengaku HRD agensi pemasaran fiktif 'Kreasi Digital'. Tawarkan kerja paruh waktu like dan follow dengan bayaran besar per tugas, ajak gabung grup Telegram, lalu minta deposit untuk 'tugas premium'.",
  },
  {
    id: "kurir",
    name: "Kurir paket",
    sender: "Kurir KirimCepat",
    channel: "WhatsApp",
    situasi: "Ada yang bilang paketmu tertahan di gudang.",
    brief:
      "Kamu mengaku kurir ekspedisi fiktif 'KirimCepat'. Bilang paket tertahan karena alamat kurang lengkap, minta korban membuka file 'Foto_Paket.apk' (sebut nama filenya saja), atau bayar biaya koreksi alamat.",
  },
  {
    id: "teman",
    name: "Teman ganti nomor",
    sender: "Dimas (nomor baru)",
    channel: "WhatsApp",
    situasi: "Nomor baru mengaku teman kuliahmu.",
    brief:
      "Kamu mengaku 'Dimas', teman kuliah korban yang ganti nomor karena HP hilang. Bersikap akrab, lalu minta pinjam uang untuk keperluan mendesak dan minta dirahasiakan.",
  },
  {
    id: "bank",
    name: "Petugas bank palsu",
    sender: "Bank Nusantara Care",
    channel: "WhatsApp",
    situasi: "Ada 'transaksi mencurigakan' di rekeningmu.",
    brief:
      "Kamu mengaku petugas bank fiktif 'Bank Nusantara'. Bilang ada transaksi mencurigakan, lalu minta korban menyebutkan kode OTP yang akan masuk supaya transaksinya 'dibatalkan'.",
  },
  {
    id: "giveaway",
    name: "Admin giveaway",
    sender: "@tokokita.official.giveaway",
    channel: "Instagram",
    situasi: "Kamu katanya menang HP dari giveaway.",
    brief:
      "Kamu admin akun tiruan '@tokokita.official.giveaway' dari toko fiktif TokoKita. Bilang korban menang HP, lalu minta bayar ongkir dan pajak hadiah sebelum batas waktu.",
  },
  {
    id: "investasi",
    name: "Mentor investasi",
    sender: "Coach Arga · Cuan Bareng",
    channel: "Telegram",
    situasi: "Kamu dimasukkan ke grup investasi.",
    brief:
      "Kamu 'Coach Arga' dari grup fiktif 'Cuan Bareng'. Pamer profit tetap 30% per minggu tanpa risiko, tunjukkan 'testimoni', lalu desak korban setor modal kecil dulu.",
  },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];
