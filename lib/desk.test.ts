import { test } from "node:test";
import assert from "node:assert/strict";
import { easeOut, planeFromRect, routeOf } from "./desk.ts";

test("every page maps to its desk, nested paths included", () => {
  assert.equal(routeOf("/"), "home");
  assert.equal(routeOf("/periksa"), "periksa");
  assert.equal(routeOf("/bertindak/apa"), "bertindak");
  assert.equal(routeOf("/tidak-ada"), "lain");
  assert.equal(routeOf("/periksa-palsu"), "lain");
});

test("a box filling the screen fills the view at that distance", () => {
  const p = planeFromRect({ left: 0, top: 0, width: 1000, height: 500 }, 1000, 500, 90, 1);
  assert.ok(Math.abs(p.h - 2) < 1e-9);
  assert.ok(Math.abs(p.w - 4) < 1e-9);
  assert.ok(Math.abs(p.x) < 1e-9);
  assert.ok(Math.abs(p.y) < 1e-9);
});

test("a box in the top right lands up and to the right", () => {
  const p = planeFromRect({ left: 500, top: 0, width: 500, height: 250 }, 1000, 500, 90, 1);
  assert.ok(p.x > 0);
  assert.ok(p.y > 0);
});

test("easing starts and ends in the right place", () => {
  assert.equal(easeOut(0), 0);
  assert.equal(easeOut(1), 1);
});
