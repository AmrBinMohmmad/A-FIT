/**
 * The one sanctioned place `console.*` may be used (ESLint bans it elsewhere).
 * debug/info are dev-only; warn/error always fire and are the hook for crash reporting.
 */
type LogArgs = readonly unknown[];

export interface Logger {
  debug: (...args: LogArgs) => void;
  info: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (message: string, error?: unknown) => void;
}

export const logger: Logger = {
  debug: (...args) => {
    if (__DEV__) console.debug("[debug]", ...args);
  },
  info: (...args) => {
    if (__DEV__) console.info("[info]", ...args);
  },
  warn: (...args) => {
    console.warn("[warn]", ...args);
  },
  error: (message, error) => {
    console.error("[error]", message, error ?? "");
  },
};
