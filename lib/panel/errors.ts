/**
 * Locked API error response contract — see DESIGN.md and design doc.
 * Every API route returns either a success payload or this shape.
 */

export type ApiErrorCode =
  | "EMBED_FAILED"
  | "PGVECTOR_UNAVAILABLE"
  | "RATE_LIMITED"
  | "QUESTION_TOO_LONG"
  | "CITATION_VALIDATION_FAILED"
  | "GATEWAY_TIMEOUT"
  | "OPTED_OUT"
  | "SPEND_CAP_HIT"
  | "MISSING_QUESTION";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    user_message: string;
    retry_after?: number;
  };
}

export function apiError(
  code: ApiErrorCode,
  user_message: string,
  retry_after?: number,
): ApiError {
  return { error: { code, user_message, ...(retry_after ? { retry_after } : {}) } };
}

/** HTTP status mapping. 200 for logical-but-not-transport errors. */
export function statusForCode(code: ApiErrorCode): number {
  switch (code) {
    case "MISSING_QUESTION":
    case "QUESTION_TOO_LONG":
      return 400;
    case "RATE_LIMITED":
      return 429;
    case "SPEND_CAP_HIT":
      return 429;
    case "PGVECTOR_UNAVAILABLE":
    case "EMBED_FAILED":
    case "GATEWAY_TIMEOUT":
      return 503;
    case "CITATION_VALIDATION_FAILED":
    case "OPTED_OUT":
      return 200; // logical outcome, rendered inline
  }
}
