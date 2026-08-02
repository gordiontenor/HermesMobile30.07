import { parseHermesSseText } from "../hermesSseParser";

describe("parseHermesSseText", () => {
  it("collects ordered content deltas", () => {
    const raw = [
      'data: {"choices":[{"delta":{"content":"Mer"}}]}',
      '',
      'data: {"choices":[{"delta":{"content":"haba"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["Mer", "haba"]);
    expect(parseHermesSseText(raw).join("")).toBe("Merhaba");
  });

  it("parses a complete message on one line", () => {
    expect(
      parseHermesSseText('data: {"choices":[{"delta":{"content":"Tam metin"}}]}'),
    ).toEqual(["Tam metin"]);
  });

  it("stops processing after the DONE marker", () => {
    const raw = [
      'data: {"choices":[{"delta":{"content":"önce"}}]}',
      "data: [DONE]",
      'data: {"choices":[{"delta":{"content":"sonra"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["önce"]);
  });

  it("skips invalid JSON data lines", () => {
    const raw = [
      "data: not-json",
      'data: {"choices":[{"delta":{"content":"geçerli"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["geçerli"]);
  });

  it("skips empty or incomplete deltas", () => {
    const raw = [
      'data: {"choices":[{"delta":{}}]}',
      'data: {"choices":[]}',
      'data: {"choices":[{}]}',
      'data: {"choices":[{"delta":{"content":null}}]}',
      'data: {"choices":[{"delta":{"content":"son"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["son"]);
  });

  it("ignores reasoning_content unless content is also present", () => {
    const raw = [
      'data: {"choices":[{"delta":{"reasoning_content":"düşünce"}}]}',
      'data: {"choices":[{"delta":{"reasoning_content":"düşünce","content":"yanıt"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["yanıt"]);
  });

  it("returns an empty array for empty or whitespace input", () => {
    expect(parseHermesSseText("")).toEqual([]);
    expect(parseHermesSseText("  \n\t")).toEqual([]);
  });

  it("skips data lines whose payload is not an object", () => {
    const raw = [
      "data: null",
      'data: "string"',
      "data: 42",
      'data: {"choices":[{"delta":{"content":"nesne"}}]}',
    ].join("\n");

    expect(parseHermesSseText(raw)).toEqual(["nesne"]);
  });
});
