/**
 * The normalised error the UI consumes. Raw axios errors become an AppError in exactly one
 * place (`@/utils/api/errors`); screens never read raw status codes.
 */
export type AppErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "validation"
  | "throttled"
  | "server"
  | "unknown";

export interface AppError {
  kind: AppErrorKind;
  messageKey: string;
  serverMessage?: string;
  status?: number;
}
