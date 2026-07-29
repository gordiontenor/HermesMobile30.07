import assert from "node:assert";
import test from "node:test";
import { hermesBuildInfo } from "../src/config/hermesBuildInfo";

test("H51.5A build label constant exists", () => {
  assert.strictEqual(hermesBuildInfo.phase, "H51.5A");
  assert.ok(hermesBuildInfo.label.includes("settings connected"));
  assert.strictEqual(
    hermesBuildInfo.gitCheckpointExpected,
    "stable-hermes-mobile-h51-5a-settings-connected-gateway-testable",
  );
});
