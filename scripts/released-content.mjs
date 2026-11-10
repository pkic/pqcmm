/**
 * Paths where a working model no longer carries a released snapshot's content unchanged.
 *
 * Released content may be added to (typed responses, cross-references, guidance already
 * published for that release) but never edited or removed without a new model version.
 * `schemaVersion` describes the representation, not the content, so it may advance.
 */
export function releasedContentChanges(released, working, path = "") {
  if (path === ".schemaVersion") return [];
  if (Array.isArray(released)) {
    if (!Array.isArray(working)) return [path];
    if (working.length !== released.length) return [path];
    return released.flatMap((item, index) =>
      releasedContentChanges(item, working[index], `${path}[${index}]`),
    );
  }
  if (released && typeof released === "object") {
    if (!working || typeof working !== "object" || Array.isArray(working)) {
      return [path];
    }
    return Object.keys(released).flatMap((key) =>
      key in working
        ? releasedContentChanges(released[key], working[key], `${path}.${key}`)
        : [`${path}.${key}`],
    );
  }
  return released === working ? [] : [path];
}
