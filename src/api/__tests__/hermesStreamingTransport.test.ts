import { parseChatResponse } from "../hermesChatValidation";
import { parseHermesStreamingText } from "../hermesLiveChatTransport";

describe("Hermes streaming transport helpers", () => {
  it("parses SSE chunks and their combined text", () => {
    const result = parseHermesStreamingText(
      [
        'data: {"choices":[{"delta":{"content":"Mer"}}]}',
        'data: {"choices":[{"delta":{"content":"haba"}}]}',
        "data: [DONE]",
      ].join("\n"),
    );

    expect(result).toEqual({ chunks: ["Mer", "haba"], text: "Merhaba", hasError: false, done: true });
  });

  it("keeps JSON responses on the normal JSON path", () => {
    expect(parseChatResponse({ status: "ok", assistantText: "JSON yanıt" })).toEqual({
      status: "ok",
      text: "JSON yanıt",
    });
  });

  it("returns empty text for empty or invalid SSE", () => {
    expect(parseHermesStreamingText("")).toEqual({ chunks: [], text: "", hasError: false, done: false });
    expect(parseHermesStreamingText("data: not-json")).toEqual({
      chunks: [],
      text: "",
      hasError: false,
      done: false,
    });
  });

  it("stops at DONE and ignores following frames", () => {
    const result = parseHermesStreamingText(
      [
        'data: {"choices":[{"delta":{"content":"önce"}}]}',
        "data: [DONE]",
        'data: {"choices":[{"delta":{"content":"sonra"}}]}',
      ].join("\n"),
    );

    expect(result.text).toBe("önce");
    expect(result.chunks).toEqual(["önce"]);
    expect(result.done).toBe(true);
  });
});
