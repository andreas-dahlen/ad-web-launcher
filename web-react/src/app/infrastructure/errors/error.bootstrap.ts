import type { AppConfig } from '@config/app.config';

type CapturedError = Error | string | unknown;

type NormalizedError = {
  message: string;
  stack?: string;
  type: string;
};

export function registerErrorHooks() {
  window.removeEventListener("error", handleError);
  window.removeEventListener("unhandledrejection", handleError);

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleError);
}

function handleError(event: ErrorEvent | PromiseRejectionEvent) {
  const error = "reason" in event ? event.reason : event.error;

  const normalized = normalizeError(error);

  dispatchError(normalized);
}

function normalizeError(error: CapturedError): NormalizedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: error.name,
    };
  }

  return {
    message: String(error),
    stack: undefined,
    type: "UnknownError",
  };
}

/**
 * Single extension point for your system
 */
let errorHandler: ((err: NormalizedError) => void) | null = null;

export function setErrorHandler(fn: (err: NormalizedError) => void) {
  errorHandler = fn;
}

function dispatchError(error: NormalizedError) {
  if (errorHandler) {
    errorHandler(error);
  } else {
    console.log("[APP ERROR]", error);
  }
}

export function bootstrapApp(debugMode: AppConfig["debugMode"]) {
  if (debugMode) {
    console.log("DEBUG MODE");
    registerErrorHooks();
  } else {
    console.log("PRODUCTION MODE");
  }
}