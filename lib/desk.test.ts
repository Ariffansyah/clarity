import { test } from "node:test";
import assert from "node:assert/strict";
import { catPose, easeOut, planeFromRect, routeOf } from "./desk.ts";

test("Sorot rests between blinks and waves, then does each briefly", () => {
  assert.deepEqual([catPose(0).eyes, catPose(0).arm], [1, 0]);
  assert.equal(catPose(4.5 * 0.97).eyes, 0.1);
  assert.notEqual(catPose(7 * 0.85).arm, 0);
  assert.equal(catPose(7 * 0.5).arm, 0);
});

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
