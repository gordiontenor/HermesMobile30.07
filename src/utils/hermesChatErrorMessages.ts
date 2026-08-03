import { isHermesReadonlyGatewayTransportError } from "../api/hermesReadonlyGatewayTransportError";

/**
 * Kullanıcıya gösterilecek Türkçe, anlaşılır hata mesajları.
 * Ham hata kodları (ör. "network_failed") ve İngilizce safeError
 * değerleri burada kullanıcı dostu Türkçe metinlere çevrilir.
 */

const TRANSPORT_ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    "Yetkilendirme başarısız. Gateway kullanıcı adı/şifresi veya seçili provider'ın API key'i hatalı olabilir.",
  network_failed:
    "Gateway'e ulaşılamadı. İnternet bağlantını ve gateway adresini kontrol et.",
  network_timeout:
    "Gateway yanıt vermedi. Birkaç saniye sonra tekrar dene.",
  unexpected_response:
    "Gateway beklenmeyen bir yanıt döndürdü. Tekrar dene.",
  registry_unavailable:
    "Provider listesi alınamadı. Gateway bağlantısını kontrol et.",
  not_configured:
    "Gateway yapılandırılmamış. Ayarlar'dan bağlantı kur.",
};

const VALIDATION_SAFE_ERROR_TRANSLATIONS: Record<string, string> = {
  "Request contains unrecognized fields.":
    "İstek formatı desteklenmiyor. Uygulamayı güncellemeyi dene.",
  "Message cannot be empty.":
    "Mesaj boş olamaz.",
};

const TURKISH_CHARACTER_PATTERN = /[ğüşıöçĞÜŞİÖÇ]/;

/**
 * Yakalanan bir hatayı kullanıcı dostu Türkçe bir mesaja çevirir.
 *
 * - HermesReadonlyGatewayTransportError ise hata kodunu Türkçe mesajla eşleştirir.
 * - Başka bir Error ise: mesajda Türkçe karakter varsa aynen döndürür,
 *   aksi halde (İngilizce/ham kod) fallback'i döndürür.
 * - Eşleşme yoksa fallback'i döndürür.
 */
export function getFriendlyChatErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof Error) {
    if (isHermesReadonlyGatewayTransportError(error)) {
      return TRANSPORT_ERROR_MESSAGES[error.message] ?? fallback;
    }
    if (TURKISH_CHARACTER_PATTERN.test(error.message)) {
      return error.message;
    }
  }
  return fallback;
}

/**
 * Gateway yanıtının status'una göre kullanıcı dostu Türkçe bir mesaj üretir.
 *
 * - validation_error: bilinen safeError değerlerini Türkçeye çevirir,
 *   bilinmeyenleri "Geçersiz istek: <safeError>" olarak gösterir.
 * - unexpected_response: sabit Türkçe mesaj.
 * - Diğer tüm durumlar: genel Türkçe mesaj.
 */
export function getFriendlyChatStatusMessage(
  status: string,
  safeError: string
): string {
  if (status === "validation_error") {
    const translated = VALIDATION_SAFE_ERROR_TRANSLATIONS[safeError];
    if (translated) {
      return translated;
    }
    return `Geçersiz istek: ${safeError}`;
  }
  if (status === "unexpected_response") {
    return TRANSPORT_ERROR_MESSAGES.unexpected_response;
  }
  if (status === "upstream_unavailable") {
    return (
      "Gateway yanıt alamadı. Geçici bir sorun olabilir — birkaç saniye sonra tekrar dene. Sorun sürerse API key'ini kontrol et."
    );
  }
  if (status === "timeout") {
    return "Gateway yanıt vermedi. Birkaç saniye sonra tekrar dene.";
  }
  return "Bir hata oluştu. Tekrar dene.";
}
