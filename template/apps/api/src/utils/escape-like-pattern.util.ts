/**
 * Escapes Postgres LIKE/ILIKE wildcard characters (`%`, `_`, `\`) in raw user
 * input so `contains`/`startsWith`/`endsWith` filters match them literally
 * instead of as pattern wildcards.
 *
 * @param value - Raw user-supplied search string
 * @returns The string with LIKE metacharacters backslash-escaped
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
