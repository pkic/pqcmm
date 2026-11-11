import { test } from "node:test";
import assert from "node:assert/strict";
import { releasedContentChanges } from "./released-content.mjs";

const released = {
  schemaVersion: "1.0.0",
  levels: [{ number: 1, criteria: { items: [{ id: "1.1.1", text: "Available in a released build." }] } }],
};

test("accepts the released content unchanged", () => {
  assert.deepEqual(releasedContentChanges(released, structuredClone(released)), []);
});

test("reports any change, addition, or removal", () => {
  const edited = structuredClone(released);
  edited.levels[0].criteria.items[0].text = "Available in any build.";
  assert.deepEqual(releasedContentChanges(released, edited), [".levels[0].criteria.items[0].text"]);

  const added = structuredClone(released);
  added.schemaVersion = "1.1.0";
  added.levels[0].sections = [{ id: "1.s.1", title: "What Level 1 Means", body: "Guidance." }];
  assert.deepEqual(releasedContentChanges(released, added), [".schemaVersion", ".levels[0].sections"]);

  const removed = structuredClone(released);
  removed.levels[0].criteria.items.pop();
  assert.deepEqual(releasedContentChanges(released, removed), [".levels[0].criteria.items"]);
});
