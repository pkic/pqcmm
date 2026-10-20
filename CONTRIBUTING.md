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
