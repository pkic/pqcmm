/**
 * Paths where a working model differs from a released snapshot.
 *
 * A released version is immutable: any change, including additions and a newer `schemaVersion`,
 * needs a new model version (a patch release at minimum).
 */
export function releasedContentChanges(released, working, path = "") {
  if (Array.isArray(released)) {
    if (!Array.isArray(working) || working.length !== released.length) return [path];
    return released.flatMap((item, index) =>
      releasedContentChanges(item, working[index], `${path}[${index}]`),
    );
  }
  if (released && typeof released === "object") {
    if (!working || typeof working !== "object" || Array.isArray(working)) {
      return [path];
    }
    const keys = new Set([...Object.keys(released), ...Object.keys(working)]);
    return [...keys].flatMap((key) =>
      key in released && key in working
        ? releasedContentChanges(released[key], working[key], `${path}.${key}`)
        : [`${path}.${key}`],
    );
  }
  return released === working ? [] : [path];
}
