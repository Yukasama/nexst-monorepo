/**
 * Converts an unknown error to a string message.
 *
 * @param error - The error to convert
 * @returns Error message string
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
