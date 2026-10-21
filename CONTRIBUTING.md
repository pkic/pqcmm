# Contributing to PQCMM

PQCMM is maintained by the PKI Consortium Post-Quantum Cryptography Working Group. Contributions from members and non-members are welcome and are subject to the PKI Consortium [Intellectual Property Rights Agreement](https://pkic.org/ipr/).

## Suggest a change without editing YAML

Use [Suggest a model improvement](https://github.com/pkic/pqcmm/issues/new?template=model-feedback.yml). Describe the problem in your own words. Include the page, version, and criterion or question if you know them. Replacement wording is welcome but not required. You do not need to decide whether the change is patch, minor, or major.

Feedback on older releases is welcome too. Maintainers decide which release lines need a correction and carry applicable fixes forward.

## Edit on GitHub

1. Open the stable [working model](https://github.com/pkic/pqcmm/edit/main/model/pqcmm-model.yaml) in GitHub. For an active draft, use its advertised contribution branch instead. Do not edit a released snapshot.
2. Make one focused change. Preserve criterion and question identifiers, and leave version numbers unchanged.
3. Use GitHub's option to propose the change in a new branch and open a pull request. GitHub can guide you through creating a fork when needed.
4. In the PR description, identify the page and version you were reading, explain the improvement, and choose the closest plain-language category. “Not sure” is welcome.

No local setup is required. CI validates the YAML and package contracts. Maintainers help resolve failures and make the release decisions.

## Maintainer triage and release preparation

Classify the effect on criteria/objectives, assessment methods, and consumer contracts. Assign accepted contributions to a release milestone; multiple changes can share a milestone. Keep proposals separate from agreed changes.

Contribution PRs normally leave version fields untouched. A separate release-preparation PR updates the affected model, profile, schema, package versions, and references after the release scope is agreed. Use the Semantic versioning guidance in README.md; classification remains a maintainer decision.

To correct an older release while a newer major version exists, start a maintenance branch at the older release tag and review the fix against that branch. For example, prepare `v1.1.2` from the appropriate `v1.1.1` source even if `main` is on 2.0. Do not edit the old release or move its tag. Review whether to carry the fix into newer release lines; backports and forward ports are explicit PRs, not automatic merges. The tagged maintenance branch runs its own release workflow and must contain that workflow; use the existing release's publication process when maintaining older tags that predate automation.

Publish approved releases through GitHub as described in README.md. The workflow generates versioned assets from the tagged branch, so a maintenance release does not need to include newer `main` changes. In GitHub, keep an older maintenance release from replacing the newer major release as “Latest.”

For local development, use `pnpm install --frozen-lockfile`, `pnpm run validate`, `pnpm test`, and `git diff --check`.

## Repository contracts

- `model/` contains the stable working model and immutable versioned release snapshots.
- `profiles/` contains the stable working assessment profile and immutable versioned snapshots referencing a specific model version.
- `schemas/` contains the JSON Schemas for those contracts.
- `scripts/validate.mjs` validates schemas and cross-file invariants.

The website and assessment tooling consume pinned releases of these files. A pull request must not silently change the meaning of an existing release.

## Review feedback and draft changes

Keep each issue concise. Use the issue form for new feedback; maintainers summarize older discussions in the issue body without replacing contributors' comments. Record:

- **Item and source:** criterion, question or evidence identifier; model version; page and source link. Use “General” when no item applies.
- **Current wording:** an exact block quote from that source. Distinguish the released model from a draft and the workbook from the model.
- **Problem:** one or two bullets explaining the observed ambiguity or defect.
- **Proposed wording:** a quoted replacement. If no replacement is agreed, write “Decision needed” and state the question or alternatives.
- **Impact and decision:** editorial, assessment-method, criteria/objectives, or tooling; proposed, agreed, incorporated into draft, deferred, declined, or clarification only. Link the human decision; a proposal in YAML is not approval.
- **Implementation:** the focused PR, or the relevant file/line or review thread in a combined PR. A pinned source permalink records the text reviewed; it does not replace the PR link.

Preserve longer rationale under a collapsed “Background” section where useful. Split independently decidable changes into focused issues; keep their parent as an index. Reuse existing issues instead of duplicating them. Do not publish private attachments, email addresses, mailbox links, or internal correspondence in issues or PRs. Refer to public discussions or summarize feedback already authorized for publication.

### Shared draft and contribution PRs

The [PQCMM 1.1.0 draft](https://github.com/pkic/pqcmm/pull/37) uses `agent/pqcmm-1.1.0-draft`. The [feedback index](https://github.com/pkic/pqcmm/issues/26) records decisions and implementation links. Target this branch for 1.1.0 model contributions; confirm the current branch and registry before using these links for a later release. Tooling and contribution-process changes can target main independently. Main retains released model content until release preparation is approved.

Prefer one decision per PR, grouping changes only when they must be reviewed together. Link the issue in the PR and the PR in the issue. Record whether a change is merely proposed in the shared draft or has been reviewed and accepted. Contributions do not bump versions or edit released snapshots.

GitHub's closing keywords apply to PRs targeting the default branch, not the shared draft branch. Do not rely on `Fixes #…` to update draft contribution status. Explicitly record “incorporated into draft” after a reviewed merge, and distinguish that from release publication. Request the reporter's review when the wording or interpretation needs their confirmation and the user has authorized that notification. No response is not agreement.

### Read changes without reading YAML

Run `pnpm review:changes --base <base-ref> --head <head-ref>` to see added, removed, and changed criteria, questions, evidence, and supporting model content with before/after wording. The PR validation workflow publishes the same report in its job summary. This is a structural comparison, not a verdict on semantic versioning, technical correctness, or approval.

Review linked criteria, questions, response contracts, evidence, checklists, and consumers together. State whether obligations, thresholds, applicability, required evidence, or pass conditions change. Follow README.md for semantic versioning; a maintainer decides the release scope. Preserve the accessible self-assessment route and distinguish migration maturity from additional verification depth.

Repository agent workflows: `.agents/skills/review-model-change/SKILL.md` and `.agents/skills/resolve-model-feedback/SKILL.md`.
