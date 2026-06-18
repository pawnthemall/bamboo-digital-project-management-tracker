import { useAppStore } from "@/stores/appStore";

const TIMEZONE_LOCALES: Record<string, string> = {
  "Pacific/Auckland": "en-NZ",
  "Australia/Sydney": "en-AU",
  "Europe/London": "en-GB",
  "Europe/Paris": "fr-FR",
  "Europe/Berlin": "de-DE",
  "Asia/Tokyo": "ja-JP",
  "Asia/Shanghai": "zh-CN",
  "America/New_York": "en-US",
  "America/Los_Angeles": "en-US",
  "America/Chicago": "en-US",
  "America/Denver": "en-US",
  "America/Toronto": "en-CA",
  "America/Vancouver": "en-CA",
  "Asia/Dubai": "en-AE",
  "Asia/Singapore": "en-SG",
  "Asia/Hong_Kong": "zh-HK",
  "Asia/Seoul": "ko-KR",
  "Asia/Mumbai": "en-IN",
  "Africa/Johannesburg": "en-ZA",
  "America/Sao_Paulo": "pt-BR",
  "America/Mexico_City": "es-MX",
};

function getLocale(timezone: string): string {
  if (TIMEZONE_LOCALES[timezone]) return TIMEZONE_LOCALES[timezone];
  // Fallback: try to infer from timezone region
  if (timezone.startsWith("Europe/") && timezone.includes("London")) return "en-GB";
  if (timezone.startsWith("Pacific/") || timezone.startsWith("Australia/")) return "en-AU";
  if (timezone.startsWith("America/")) return "en-US";
  if (timezone.startsWith("Asia/")) return "en-SG";
  return typeof navigator !== "undefined" ? navigator.language : "en-US";
}

export function useFormatDate() {
  const timezone = useAppStore((s) => s.timezone);
  const locale = getLocale(timezone);

  function formatDate(
    value: string | Date | null | undefined,
    opts: Intl.DateTimeFormatOptions = {}
  ): string {
    if (!value) return "—";
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "—";

    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      ...opts,
    };

    // Default to short date if no options provided
    if (!opts.year && !opts.month && !opts.day && !opts.hour && !opts.minute) {
      options.year = "numeric";
      options.month = "2-digit";
      options.day = "2-digit";
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  function formatDateTime(value: string | Date | null | undefined): string {
    return formatDate(value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatTime(value: string | Date | null | undefined): string {
    return formatDate(value, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatISODate(value: string | Date | null | undefined): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  return { formatDate, formatDateTime, formatTime, formatISODate, locale, timezone };
}
