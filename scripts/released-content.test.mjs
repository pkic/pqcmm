import { test } from "node:test";
import assert from "node:assert/strict";
import { releasedContentChanges } from "./released-content.mjs";

const released = {
  schemaVersion: "1.0.0",
  levels: [{ number: 1, criteria: { items: [{ id: "1.1.1", text: "Available in a released build." }] } }],
};

test("allows additions and a newer representation", () => {
  const working = structuredClone(released);
  working.schemaVersion = "1.1.0";
  working.levels[0].sections = [{ id: "1.s.1", title: "What Level 1 Means", body: "Guidance." }];
  working.levels[0].criteria.items[0].assessmentQuestionIds = ["1.2.1"];
  assert.deepEqual(releasedContentChanges(released, working), []);
});

test("reports edited, removed and reordered released content", () => {
  const edited = structuredClone(released);
  edited.levels[0].criteria.items[0].text = "Available in any build.";
  assert.deepEqual(releasedContentChanges(released, edited), [".levels[0].criteria.items[0].text"]);

  const removed = structuredClone(released);
  delete removed.levels[0].criteria.items[0].text;
  assert.deepEqual(releasedContentChanges(released, removed), [".levels[0].criteria.items[0].text"]);

  const added = structuredClone(released);
  added.levels[0].criteria.items.push({ id: "1.1.2", text: "New obligation." });
  assert.deepEqual(releasedContentChanges(released, added), [".levels[0].criteria.items"]);
});
