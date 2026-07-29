import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fetchHermesProviderModelRegistryWithDiagnostics,
} from "../src/api/hermesProviderModelRegistryTransport";
import { hermesBuildInfo } from "../src/config/hermesBuildInfo";
import {
  inspectHermesProviderModelRegistryShape,
  validateHermesProviderModelRegistry,
} from "../src/viewModels/hermesProviderModelRegistryViewModel";
import type { HermesGatewaySetupConfig } from "../src/viewModels/hermesGatewaySetupViewModel";

const baseConfig: HermesGatewaySetupConfig = {
  url: "http://preview.invalid:8443/",
  username: "testuser",
  password: "testpassword",
  isDirty: false,
};

describe("hermesProviderModelRegistryValidation", () => {
  it("accepts valid safe registry", () => {
    const valid = {
      registryVersion: "1.0",
      generatedAt: "today",
      policy: { textOnlyAllowed: true, toolsAllowed: false, skillExecutionAllowed: false },
      providers: [{ providerId: "test-provider", providerLabel: "Test", providerDescription: "Test desc", enabled: true, defaultModelId: "test-model", models: [{ modelId: "test-model", modelLabel: "Test Model", modelDescription: "Test Model desc", capabilities: { supportsStreaming: true, supportsVision: false, supportsTools: false }, riskLevel: "low", isDefault: true, enabled: true }] }],
    };
    const res = validateHermesProviderModelRegistry(valid);
    assert.strictEqual(res.status, "ok");
  });

  it("accepts registry with previously-forbidden strings (validation relaxed)", () => {
    const res = validateHermesProviderModelRegistry({ registryVersion: "1.0", policy: { textOnlyAllowed: true, toolsAllowed: true, skillExecutionAllowed: true }, providers: [], mySecretUrl: "http://example.com" });
    assert.strictEqual(res.status, "ok");
  });

  it("rejects missing required fields", () => {
    const res = validateHermesProviderModelRegistry({ registryVersion: "1.0", policy: { textOnlyAllowed: true, toolsAllowed: false, skillExecutionAllowed: false } });
    assert.strictEqual(res.status, "validation_error");
    if (res.status === "validation_error") assert.equal(res.failureClass, "missing_required_field");
  });

  it("inspects required fields and safe flags without exposing raw values", () => {
    const summary = inspectHermesProviderModelRegistryShape({ registryVersion: "1.0", providers: [], policy: { textOnlyAllowed: true, providerRoutingAllowed: false, toolsAllowed: false, skillExecutionAllowed: false }, privateUrl: "https://secret.invalid" });
    assert.deepEqual(summary.requiredFieldsPresent, { registryVersion: true, providers: true, policy: true });
    assert.equal(summary.safeFlags.textOnlyAllowed, true);
    assert.equal(summary.safeFlags.providerRoutingAllowed, false);
    assert.equal(summary.safeFlags.toolsAllowed, false);
    assert.equal(summary.safeFlags.skillExecutionAllowed, false);
    assert.equal("privateUrl" in (summary.safeFlags as Record<string, unknown>), false);
  });

  it("classifies non-ok http safely", async () => {
    globalThis.fetch = async () => new Response("Not found", { status: 404 });
    const result = await fetchHermesProviderModelRegistryWithDiagnostics(baseConfig);
    assert.equal(result.status, "error");
    assert.equal(result.diagnostics.requestStage, "http_response");
    assert.equal(result.diagnostics.failureClass, "non_ok_http");
    assert.equal(result.diagnostics.httpStatusCode, 404);
  });

  it("classifies parse failure safely", async () => {
    globalThis.fetch = async () => new Response("<html>Not JSON</html>", { status: 200 });
    const result = await fetchHermesProviderModelRegistryWithDiagnostics(baseConfig);
    assert.equal(result.status, "error");
    assert.equal(result.diagnostics.requestStage, "parse_json");
    assert.equal(result.diagnostics.failureClass, "parse_failed");
    assert.equal(result.diagnostics.jsonParsed, false);
  });

  it("classifies missing required field safely", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ policy: { textOnlyAllowed: true, toolsAllowed: false, skillExecutionAllowed: false }, providers: [] }), { status: 200 });
    const result = await fetchHermesProviderModelRegistryWithDiagnostics(baseConfig);
    assert.equal(result.status, "error");
    assert.equal(result.diagnostics.failureClass, "missing_required_field");
    assert.equal(result.diagnostics.requiredFieldsPresent.registryVersion, false);
    assert.equal(result.diagnostics.requiredFieldsPresent.providers, true);
    assert.equal(result.diagnostics.requiredFieldsPresent.policy, true);
  });

  it("accepts gateway response with URLs (forbidden field check removed)", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ registryVersion: "1.0", providers: [], policy: { textOnlyAllowed: true, toolsAllowed: false, skillExecutionAllowed: false }, safeLookingUrl: "http://example.com" }), { status: 200 });
    const result = await fetchHermesProviderModelRegistryWithDiagnostics(baseConfig);
    assert.equal(result.status, "success");
  });

  it("surfaces build metadata and no secret-like strings in diagnostics output", async () => {
    globalThis.fetch = async () => { const error = new Error("AbortError"); error.name = "AbortError"; throw error; };
    const result = await fetchHermesProviderModelRegistryWithDiagnostics(baseConfig);
    assert.equal(result.status, "error");
    assert.equal(result.diagnostics.buildPhase, hermesBuildInfo.phase);
    assert.ok(result.diagnostics.buildLabel.includes("settings connected"));
    const serialized = JSON.stringify(result.diagnostics).toLowerCase();
    assert.equal(serialized.includes("preview.invalid"), false);
    assert.equal(serialized.includes("testpassword"), false);
    assert.equal(serialized.includes("authorization"), false);
    assert.equal(serialized.includes("token"), false);
    assert.equal(serialized.includes("env"), false);
  });
});
