# Minimal Intel macOS Release Repository Design

## Goal

Turn the existing fork working tree into a small distribution repository while
preserving all Git history, tags, Releases, and downloadable assets.

## Retained Files

The default branch will retain exactly these functional files:

- `README.md`
- `LICENSE`
- `.github/workflows/build-intel-macos-release.yml`

The README will identify the project as an unofficial Intel macOS rebuild,
provide links to the Latest Release and official upstream source, explain the
six-hour stable-release check, list the macOS 12+ and x86_64 target, and retain
the unsigned/notarized Gatekeeper warning.

The upstream MIT license remains in the current tree to preserve redistribution
notice. The existing workflow remains unchanged.

## Deleted Files

All other tracked files are deleted from the new default-branch snapshot,
including copied upstream source, upstream workflows, tests, documentation, and
the local design/plan files. Their contents remain recoverable from Git history.

No tags are moved or deleted. No GitHub Release metadata or assets are changed.

## Build Behavior

The retained workflow queries `NousResearch/hermes-agent` for its latest stable
Release. On a new version, `actions/checkout` replaces the runner workspace with
the exact upstream Release tag before installing dependencies and building.
Therefore, the workflow has no runtime dependency on the source files stored in
this distribution repository.

Future auto-generated Release source archives will represent the minimal
distribution repository rather than the Hermes Agent upstream source. The
README and Release notes link users to the exact official upstream source.

## Verification

Before pushing the deletion commit:

- Parse and lint the retained GitHub Actions workflow.
- Confirm its checkout repository is `NousResearch/hermes-agent` and its ref is
  the discovered upstream tag.
- Confirm the retained file set is exactly README, LICENSE, and the workflow.
- Confirm the replacement README links to the official source and Latest
  Release and contains the unsigned/notarized warning.

After pushing:

- Confirm the fork default branch contains only the retained files.
- Confirm the current Latest Release and all existing assets are unchanged.
- Manually dispatch the workflow and require the macOS build job to be skipped
  because the current upstream stable Release is already published.
