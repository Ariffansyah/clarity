import { test } from "node:test";
import assert from "node:assert/strict";
import { RULES } from "./analyze.ts";
import { stagesFor } from "./peta.ts";

const names = (ids: string[]) => stagesFor(ids).map((s) => s.id);

test("a flag can touch more than one part, and the parts keep the map's order", () => {
  assert.deepEqual(names(["salah"]), ["umpan", "permintaan"]);
  assert.deepEqual(names(["kode", "buru", "resmi"]), ["kedok", "desakan", "permintaan"]);
  assert.deepEqual(names(["ancam"]), ["desakan", "isolasi"]);
});

test("ids no part claims are ignored", () => {
  assert.deepEqual(names(["asing", "tidak-ada"]), []);
  assert.deepEqual(names([]), []);
});

test("every detection rule but the weak stranger one lands somewhere on the map", () => {
  for (const r of RULES) if (r.id !== "asing") assert.ok(names([r.id]).length > 0, r.id);
  assert.ok(names(["tautan"]).length > 0);
});
