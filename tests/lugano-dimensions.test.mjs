import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  buildLuganoFloorPlans,
  MM_PER_PX,
} from "../src/data/lugano/floorplan-data.js";

const cmPerPx = MM_PER_PX / 10;
const pxToCm = (value) => value * cmPerPx;

const readJson = (relativePath) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const absolutePath = path.resolve(dirname, "..", relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
};

const approxEqual = (actual, expected, tolerance = 0.5) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

const getFloorRooms = (floor) => floor.rooms.filter((room) => !room.isExterior);

const getRoomById = (floor, roomId) =>
  getFloorRooms(floor).find((room) => room.id === roomId);

const getOpeningById = (floor, openingId) =>
  floor.openings.find((opening) => opening.id === openingId);

const getBounds = (rooms) => {
  const minX = Math.min(...rooms.map((room) => room.x));
  const minY = Math.min(...rooms.map((room) => room.y));
  const maxX = Math.max(...rooms.map((room) => room.x + room.width));
  const maxY = Math.max(...rooms.map((room) => room.y + room.height));
  return { minX, minY, maxX, maxY };
};

const getOpeningLengthCm = (opening) => {
  const lengthPx = Math.hypot(opening.x2 - opening.x1, opening.y2 - opening.y1);
  return pxToCm(lengthPx);
};

const floorPlans = buildLuganoFloorPlans();
const firstSpec = readJson("src/data/lugano/dimensionSpec.firstFloor.json");
const groundSpec = readJson("src/data/lugano/dimensionSpec.groundFloor.json");

const assertRoomDimensions = (floor, spec) => {
  Object.entries(spec.rooms).forEach(([roomId, roomSpec]) => {
    const room = getRoomById(floor, roomId);
    assert.ok(room, `Missing room ${roomId}`);
    if (Number.isFinite(roomSpec.width)) {
      approxEqual(pxToCm(room.width), roomSpec.width);
    }
    if (Number.isFinite(roomSpec.height)) {
      approxEqual(pxToCm(room.height), roomSpec.height);
    }
  });
};

const assertOpeningDimensions = (floor, spec) => {
  Object.entries(spec.openings).forEach(([openingId, openingSpec]) => {
    const opening = getOpeningById(floor, openingId);
    assert.ok(opening, `Missing opening ${openingId}`);
    if (Number.isFinite(openingSpec.width)) {
      approxEqual(getOpeningLengthCm(opening), openingSpec.width);
    }
    if (Number.isFinite(openingSpec.height)) {
      assert.equal(opening.heightMm, openingSpec.height * 10);
    }
  });
};

const assertOuterBounds = (floor, spec) => {
  const rooms = getFloorRooms(floor);
  const bounds = getBounds(rooms);
  const widthCm = pxToCm(bounds.maxX - bounds.minX);
  const heightCm = pxToCm(bounds.maxY - bounds.minY);
  if (
    Number.isFinite(spec.outer?.width) &&
    spec.outer?.enforceWidth !== false
  ) {
    approxEqual(widthCm, spec.outer.width);
  }
  if (
    Number.isFinite(spec.outer?.height) &&
    spec.outer?.enforceHeight !== false
  ) {
    approxEqual(heightCm, spec.outer.height);
  }
};

test("first floor room dimensions match spec", () => {
  assertRoomDimensions(floorPlans.upper, firstSpec);
});

test("ground floor room dimensions match spec", () => {
  assertRoomDimensions(floorPlans.ground, groundSpec);
});

test("first floor openings match spec mapping", () => {
  assertOpeningDimensions(floorPlans.upper, firstSpec);
});

test("ground floor openings match spec mapping", () => {
  assertOpeningDimensions(floorPlans.ground, groundSpec);
});

test("outer bounds follow spec", () => {
  assertOuterBounds(floorPlans.upper, firstSpec);
  assertOuterBounds(floorPlans.ground, groundSpec);
});
