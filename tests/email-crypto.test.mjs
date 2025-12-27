import assert from "node:assert/strict";
import { test } from "node:test";
import { decrypt, encrypt } from "../lib/crypto.mjs";

test("encrypt/decrypt roundtrip", () => {
  process.env.EMAIL_TOKEN_ENCRYPTION_KEY = "a".repeat(64);
  const plain = "super-secret-token";
  const encrypted = encrypt(plain);
  assert.notEqual(encrypted, plain);
  assert.equal(decrypt(encrypted), plain);
});

test("encrypt uses random iv", () => {
  process.env.EMAIL_TOKEN_ENCRYPTION_KEY = "b".repeat(64);
  const plain = "same-input";
  const first = encrypt(plain);
  const second = encrypt(plain);
  assert.notEqual(first, second);
});
