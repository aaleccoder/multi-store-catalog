import { Prisma } from "@/generated/prisma/client";

const RETRYABLE_PRISMA_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const DATABASE_UNAVAILABLE_MESSAGE = "DATABASE_TEMPORARILY_UNAVAILABLE";

const hasCode = (error: unknown): error is { code: string } => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("code" in error)) {
    return false;
  }

  return typeof (error as { code: unknown }).code === "string";
};

const hasMessage = (error: unknown): error is { message: string } => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("message" in error)) {
    return false;
  }

  return typeof (error as { message: unknown }).message === "string";
};

const sleep = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

export class DatabaseUnavailableError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super(DATABASE_UNAVAILABLE_MESSAGE);
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

export const isDatabaseUnavailableError = (error: unknown): error is DatabaseUnavailableError => {
  return error instanceof DatabaseUnavailableError;
};

export const isTransientPrismaError = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_PRISMA_CODES.has(error.code);
  }

  if (hasCode(error) && RETRYABLE_PRISMA_CODES.has(error.code)) {
    return true;
  }

  if (!hasMessage(error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("can't reach database server") || message.includes("server has closed the connection");
};

export const withPrismaRetry = async <T>(
  operation: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
  },
): Promise<T> => {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 3);
  const initialDelayMs = Math.max(1, options?.initialDelayMs ?? 250);
  const maxDelayMs = Math.max(initialDelayMs, options?.maxDelayMs ?? 1500);

  let lastTransientError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientPrismaError(error)) {
        throw error;
      }

      lastTransientError = error;

      if (attempt === maxAttempts) {
        break;
      }

      const delayMs = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
      await sleep(delayMs);
    }
  }

  throw new DatabaseUnavailableError(lastTransientError);
};
