/**
 * Shared secret guarding the admin tab and its API. Defaults to a
 * localhost-only value so the site works out of the box on a dev machine;
 * set `DRIOTON_ADMIN_SECRET` in production.
 */
export function adminSecret(): string {
  return process.env.DRIOTON_ADMIN_SECRET ?? "atelier-2026";
}

/** Compares provided secret against the configured one. */
export function secretMatches(provided: string | undefined | null): boolean {
  if (!provided) return false;
  const expected = adminSecret();
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
