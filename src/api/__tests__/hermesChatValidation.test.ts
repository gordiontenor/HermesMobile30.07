import {
  parseChatResponse,
} from "../hermesChatValidation";
import { getFriendlyChatStatusMessage } from "../../utils/hermesChatErrorMessages";

describe("Hermes chat response validation", () => {
  it("maps an assistantText success response", () => {
    expect(parseChatResponse({ status: "ok", assistantText: "Merhaba" })).toEqual({
      status: "ok",
      text: "Merhaba",
    });
  });

  it("maps a text fallback response to success", () => {
    expect(parseChatResponse({ text: "fallback" })).toEqual({
      status: "ok",
      text: "fallback",
    });
  });

  it("preserves validation errors", () => {
    expect(
      parseChatResponse({
        status: "validation_error",
        safeError: "Message cannot be empty.",
      }),
    ).toEqual({
      status: "validation_error",
      safeError: "Message cannot be empty.",
    });
  });

  it("preserves upstream_unavailable responses", () => {
    expect(
      parseChatResponse({
        status: "upstream_unavailable",
        safeError: "Text facade is unavailable right now.",
      }),
    ).toEqual({
      status: "upstream_unavailable",
      safeError: "Text facade is unavailable right now.",
    });
  });

  it("preserves timeout responses", () => {
    expect(
      parseChatResponse({
        status: "timeout",
        safeError: "Gateway timed out.",
      }),
    ).toEqual({
      status: "timeout",
      safeError: "Gateway timed out.",
    });
  });

  it.each([null, {}, { status: "garip" }])(
    "returns unexpected_response for invalid response %#",
    (response) => {
      expect(parseChatResponse(response)).toEqual({
        status: "unexpected_response",
        safeError: expect.any(String),
      });
    },
  );
});

describe("Friendly chat status messages", () => {
  it("localizes upstream_unavailable", () => {
    expect(getFriendlyChatStatusMessage("upstream_unavailable", "raw error")).toBe(
      "Gateway yanıt alamadı. Geçici bir sorun olabilir — birkaç saniye sonra tekrar dene. Sorun sürerse API key'ini kontrol et.",
    );
  });

  it("localizes timeout", () => {
    expect(getFriendlyChatStatusMessage("timeout", "raw error")).toBe(
      "Gateway yanıt vermedi. Birkaç saniye sonra tekrar dene.",
    );
  });

  it("translates a known validation error", () => {
    expect(
      getFriendlyChatStatusMessage("validation_error", "Message cannot be empty."),
    ).toBe("Mesaj boş olamaz.");
  });

  it("returns the Turkish unexpected response message", () => {
    expect(getFriendlyChatStatusMessage("unexpected_response", "raw error")).toBe(
      "Gateway beklenmeyen bir yanıt döndürdü. Tekrar dene.",
    );
  });
});
