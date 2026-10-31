/**
 * The ONE place raw failures become a typed AppError. Prefers the backend's single
 * localized `message`; falls back to an i18n key by error kind.
 */
import axios from "axios";

import type { ApiEnvelope } from "@/types/api";
import type { AppError, AppErrorKind } from "@/types/error";

const MESSAGE_KEY: Record<AppErrorKind, string> = {
  network: "errors.network",
  timeout: "errors.timeout",
  unauthorized: "errors.unauthorized",
  forbidden: "errors.forbidden",
  notFound: "errors.notFound",
  conflict: "errors.conflict",
  validation: "errors.validation",
  throttled: "errors.throttled",
  server: "errors.server",
  unknown: "errors.generic",
};

function kindFromStatus(status: number): AppErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "throttled";
  if (status >= 500) return "server";
  return "unknown";
}

export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return { kind: "timeout", messageKey: MESSAGE_KEY.timeout };
    if (!error.response) return { kind: "network", messageKey: MESSAGE_KEY.network };
    const status = error.response.status;
    const kind = kindFromStatus(status);
    const body = error.response.data as ApiEnvelope<unknown> | undefined;
    return {
      kind,
      status,
      messageKey: MESSAGE_KEY[kind],
      serverMessage: typeof body?.message === "string" ? body.message : undefined,
    };
  }
  return { kind: "unknown", messageKey: MESSAGE_KEY.unknown };
}

export function errorMessage(error: AppError, t: (key: string) => string): string {
  return error.serverMessage ?? t(error.messageKey);
}
