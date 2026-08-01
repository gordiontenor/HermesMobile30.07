import {
  getFriendlyChatErrorMessage,
  getFriendlyChatStatusMessage,
} from "../hermesChatErrorMessages";
import { createHermesReadonlyGatewayTransportError } from "../../api/hermesReadonlyGatewayTransportError";

describe("Hermes chat error messages", () => {
  it("returns a Turkish message for auth_failed", () => {
    expect(
      getFriendlyChatErrorMessage(
        createHermesReadonlyGatewayTransportError("auth_failed"),
        "Genel hata",
      ),
    ).toContain("Yetkilendirme başarısız");
  });

  it("returns a Turkish message for network_timeout", () => {
    expect(
      getFriendlyChatErrorMessage(
        createHermesReadonlyGatewayTransportError("network_timeout"),
        "Genel hata",
      ),
    ).toContain("Gateway yanıt vermedi");
  });

  it("uses the fallback for an unknown Error", () => {
    expect(getFriendlyChatErrorMessage(new Error("Unknown failure"), "Genel hata")).toBe(
      "Genel hata",
    );
  });

  it("translates a validation_error safeError", () => {
    expect(
      getFriendlyChatStatusMessage("validation_error", "Message cannot be empty."),
    ).toBe("Mesaj boş olamaz.");
  });

  it("returns a Turkish message for unexpected_response", () => {
    expect(getFriendlyChatStatusMessage("unexpected_response", "raw error")).toContain(
      "beklenmeyen bir yanıt",
    );
  });
});
