# Repository guidance

## Scope

- This repository is the canonical, versioned source package for the PQC Maturity Model (PQCMM).
- Keep normative model content, tool behavior profiles, and their JSON Schemas separate.
- Use US English for prose, comments, identifiers, and documentation.

## Authoring

- Use `pnpm` for repository scripts and local binaries. Do not use `npm` or `npx`.
- Treat a released `model/pqcmm-model-<version>.yaml` file as immutable. Publish substantive changes under a new semantic version.
- Keep criterion, question, and evidence identifiers stable. Never reuse an identifier for a different meaning.
- Advance assessment behavior independently through versioned files under `profiles/`; do not rewrite released normative model text to accommodate tooling.
- Express assessment behavior through schemas and profile data. Do not add executable expressions or model-specific application logic to this repository.
- Preserve CPE and pURL as separate properties and keep the PQCMM subject rule requiring at least one of them.
- Keep browser assurance limited to self-assessment. Qualified third-party and PKI Consortium certification states require external workflows.

## Validation and release

- Run `pnpm run validate` after changing models, profiles, schemas, or validation logic.
- Review `git diff --check` before committing.
- Keep release archives reproducible from committed `model/`, `profiles/`, and `schemas/` files.
- Tag releases as `v<model-version>`, for example `v1.0.1`. Do not move or recreate published version tags.
