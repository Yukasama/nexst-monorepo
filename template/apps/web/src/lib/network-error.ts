/**
 * Wording each engine puts on the `TypeError` `fetch` rejects with when the
 * request never got an HTTP response (offline, DNS, refused connection, CORS
 * block): Firefox, Chromium, Safari, and Node's undici for server-side calls.
 */
const FETCH_FAILURE_MESSAGE =
  /^(?:networkerror when attempting to fetch resource|failed to fetch|load failed|fetch failed|network request failed)/i;

/**
 * Whether `error` is a request that never reached the API, as opposed to one
 * the API answered with an error. The browser's wording for it (e.g. "NetworkError
 * when attempting to fetch resource.") is meaningless to a user, so callers
 * show translated copy instead of `error.message`.
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && FETCH_FAILURE_MESSAGE.test(error.message);
}
