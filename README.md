# PQC Maturity Model (PQCMM)

This repository is the versioned, machine-readable source package for the PKI Consortium PQC Maturity Model.

[![Validate model package](https://github.com/pkic/pqcmm/actions/workflows/validate.yml/badge.svg)](https://github.com/pkic/pqcmm/actions/workflows/validate.yml)

## Package contents

- `model/pqcmm-model.yaml` is the editable working model; versioned files in `model/` are immutable release snapshots.
- `profiles/pqcmm-self-assessment-profile.yaml` is the editable working profile; versioned files preserve released assessment behavior.
- `schemas/pqcmm-model.schema.json` and `schemas/assessment-profile.schema.json` are the working schemas; versioned files preserve released contracts. Portable assessment packages use the model-neutral schema maintained by the assessment tool.
- `scripts/validate.mjs` validates all current package contracts and stable identifiers.

The model and assessment profile are deliberately separate. Criteria and assessment questions remain immutable within a released model version, while form defaults, cross-field subject rules, evidence limits, assurance states, report sections, and registered policy identifiers can advance in a separately versioned profile. Model 1.1.0 adds explicit criterion-to-question links and machine-readable response definitions. The profile supplies generic defaults and finding statuses, so assessment tools do not need PQCMM-specific rendering or scoring code.

PQCMM requires at least one canonical CPE 2.3 name or package URL (pURL) for inventory correlation. The profile expresses that requirement through a generic `at-least-one` subject rule. Portable assessment credentials expose CPE and pURL as separate named properties; the runtime does not use a PQCMM-specific validation branch.

## Assurance boundary

The browser profile issues self-assessments only and does not apply signatures. It defines qualified third-party and PKI Consortium certification as external workflow states so a browser user cannot self-select them. The assessment does not store a proposed signer. Instead, the profile defines optional approval roles and PDF signature fields, and the external PAdES workflow establishes each actual signer at signing time. The current profile provides optional accountable-executive and security-executive fields and permits additional signatures. Identity, organization binding, role authority, document signature, trusted time, evidence review, assessor qualification, and certification issuance are separate assurance facets, allowing stronger combinations without imposing one credential stack on every user.

The planned PKI Consortium submission service may charge for processing, review, publication, signatures, status services, and long-term storage. That service is intentionally outside this repository and the offline assessment tool.

## Validate

```sh
pnpm install
pnpm run validate
```

## Releases

Edit the stable working paths above in pull requests so GitHub shows changes to the same files across versions. Internal model, profile, and schema versions identify the intended release; an unversioned filename does not imply approval or publication. Keep model and profile versions independent. When changing a released contract, advance its version before tagging a release.

For review, compare the same working path between a draft branch and its intended base. Link proposed changes to the relevant feedback or tracking issues; merging draft work does not itself approve or publish a release.

### Semantic versioning

Versions follow `MAJOR.MINOR.PATCH`, for example `1.2.3`. Choose the increment by its effect on existing consumers and assessments:

| Increment | Meaning | Example |
| --- | --- | --- |
| **Patch** (`1.0.1 → 1.0.2`) | Backward-compatible corrections that preserve requirements, pass conditions, and data contracts. | Correct a typo or replace an obsolete documentation link without changing the obligation. |
| **Minor** (`1.0.1 → 1.1.0`) | Backward-compatible additions; existing valid data and supported behavior continue to work. | Add optional guidance or an optional field that existing consumers can safely ignore. |
| **Major** (`1.0.1 → 2.0.0`) | Incompatible changes to meaning, requirements, or data contracts. | Change a pass condition, remove or repurpose a question, or introduce a required field that makes existing data invalid. |

A small wording edit can be a breaking change if it changes what must be demonstrated. Adding a mandatory criterion is not automatically a minor change. Review both the assessment meaning and machine-readable compatibility; an added field is only compatible if the applicable schema and consumers permit it. Working-group agreement is still required for requirement changes, regardless of the chosen version.

The model, assessment profile, and schemas have independent versions. Advance each affected contract according to its own compatibility impact, and update references so the package remains consistent. The GitHub release tag follows the **model version**; generated profile and schema filenames use their own versions. For example, a model patch can retain an unchanged profile and schema version.

Drafts may carry their intended release version while they are under review; a branch's internal version alone does not make it a release. Published tags and assets are immutable. For an explicitly labeled preview, pin the draft commit rather than presenting it as an approved release.

### Parallel release tracks

Patch, minor, and major releases can be prepared in parallel on separate branches. Each branch edits the same stable filenames and carries its own intended internal versions. The example below starts from released `v1.0.1`; branch names are illustrative. Each track is reviewed and approved independently.

```mermaid
flowchart LR
    BASE([Released v1.0.1])

    subgraph PATCH["PATCH · corrections"]
        direction LR
        P["release/1.0.x<br/>Working version 1.0.2"] --> PR["Review and approve"] --> PT([Tag v1.0.2])
    end
    subgraph MINOR["MINOR · compatible additions"]
        direction LR
        M["release/1.1<br/>Working version 1.1.0"] --> MR["Review and approve"] --> MT([Tag v1.1.0])
    end
    subgraph MAJOR["MAJOR · breaking changes"]
        direction LR
        N["release/2.0<br/>Working version 2.0.0"] --> NR["Review and approve"] --> NT([Tag v2.0.0])
    end

    BASE --> P
    BASE --> M
    BASE --> N
    PT --> CI["GitHub Actions<br/>Validate each tagged source"]
    MT --> CI
    NT --> CI
    CI --> ASSETS["Each release gets its own assets<br/>Versioned files · archives · checksums"]

    style PATCH fill:#eaf5ee,stroke:#287a46,color:#183d26
    style MINOR fill:#eaf2fb,stroke:#356da8,color:#193b60
    style MAJOR fill:#fff3e6,stroke:#b96a19,color:#63390e
```

Choose the version according to the change's compatibility impact, not the size of the edit. Carry applicable fixes forward to other active tracks through reviewed pull requests; this is not automatic. Avoid merging unfinished minor or major work into a patch branch. Keep model, profile, and schema versions consistent within each track, advancing their versions independently when their contracts change.

Start a maintenance branch from the release tag it maintains. Tag the approved commit on that branch, even if `main` has moved on to a newer release line; a patch release does not need to include the latest `main`. Compare against that track's base when reviewing changes. Parallel tracks do not require separate working filenames or committed copies of future releases.

### Publish a release

After release approval, open **Releases → Draft a new release** in GitHub, choose the approved commit or branch, create a new `v<model-version>` tag (for example, `v1.1.0`), and publish the release. No local commands are required for release managers.

GitHub Actions validates the tagged source, verifies the tag matches the model version, and automatically generates versioned model, profile, and schema assets, archives, and checksums. Wait for the release workflow to succeed before sharing the assets. Pushing a release tag directly also triggers this workflow and creates a release if needed.

Generated copies are attached to the GitHub release; they are not committed back into the repository. The tag preserves the exact working source. Asset filenames use the model version, independent profile version, and each document's schema version. Existing committed release snapshots remain unchanged, and generation rejects differences from an existing snapshot with the same version. Never move a published tag or replace published assets. Archives contain only the selected versioned assets and documentation.

The PKI Consortium website and assessment tooling should consume pinned, versioned release assets or a pinned commit. Reviewers and draft integrations may use the stable paths at an explicit commit.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring and versioning workflow. This repository is available under the [MIT License](LICENSE), and contributions are subject to the PKI Consortium [Intellectual Property Rights Agreement](https://pkic.org/ipr/).
