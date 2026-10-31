// Run: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, checkLink } from "./analyze.ts";

const ids = (text: string, ctx: string[] = []) => analyze(text, ctx).flags.map((f) => f.id);

test("phishing SMS lands in the top level", () => {
  const r = analyze("Nasabah Yth, akun Anda akan diblokir dalam 24 jam. Segera konfirmasi di bank-nusantara-tarif.top/login");
  assert.equal(r.level, 3);
  assert.ok(ids("akun Anda akan diblokir").includes("ancam"));
  assert.ok(r.flags.some((f) => f.id === "tautan"));
});

test("a real OTP warning is not read as a request", () => {
  const r = analyze("482913 adalah kode masuk DompetKu kamu. Kode ini rahasia, jangan berikan ke siapa pun.");
  assert.equal(r.level, 0);
  assert.ok(!ids("Bank tidak pernah meminta kode OTP").includes("kode"));
  assert.ok(ids("Tolong kirimkan kode OTP yang masuk ya").includes("kode"));
});

test("context chips count without text, and never twice", () => {
  assert.equal(analyze("", ["kode"]).score, 3);
  assert.equal(analyze("kirim kode OTP-nya", ["kode"]).score, 3);
});

test("link checks", () => {
  assert.equal(checkLink("https://www.bca.co.id/promo").report.issues.length, 0);
  assert.ok(checkLink("bca-verifikasi.xyz").report.issues.some((i) => i.includes("BCA")));
  assert.ok(checkLink("bit.ly/abc").report.issues.length > 0);
  assert.equal(checkLink("danamon.co.id").report.issues.length, 0);
  assert.ok(checkLink("http://192.168.1.4/login").weight > 0);
  assert.ok(checkLink("kirimcepat.com/Foto_Paket.apk").report.issues.some((i) => i.includes(".apk")));
});

test("job and loan scams", () => {
  assert.ok(ids("Tugasnya like dan follow, gaji Rp150.000 per tugas").includes("kerja"));
  assert.ok(ids("Pinjaman cepat cair dalam 10 menit tanpa BI checking").includes("pinjol"));
  assert.ok(ids("Hai, ini aku. HP lamaku rusak. Bisa pinjam Rp500.000 dulu?").includes("kenalan"));
});

test("redaction masks contact data but keeps rupiah amounts", async () => {
  const { redact } = await import("./ai.ts");
  const r = redact("Hubungi +62 812-3456-7890 atau rina@contoh.id, kode 482913, gaji Rp150.000");
  assert.equal(r.text, "Hubungi [ANGKA] atau [EMAIL], kode [ANGKA], gaji Rp150.000");
  assert.equal(r.count, 3);
});
