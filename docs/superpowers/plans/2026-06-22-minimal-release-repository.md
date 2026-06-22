# Minimal Intel macOS Release Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the fork's default-branch snapshot to a README, MIT license, and the Intel macOS Release workflow without changing history, tags, Releases, or assets.

**Architecture:** Snapshot GitHub Release metadata first, replace the README with distribution-specific documentation, then use sparse checkout plus Git index removal to stage every other tracked file as deleted. Validate the exact retained set and workflow before fast-forwarding the fork default branch, then verify Releases and deduplication remotely.

**Tech Stack:** Git sparse checkout/index, GitHub Actions, GitHub REST API, Markdown.

---

### Task 1: Snapshot Remote Distribution State

**Files:**
- Create temporary snapshots under `/tmp`; no tracked files changed.

- [ ] **Step 1: Record the current Latest Release**

Query `GET /repos/evencj11/hermes-agent-desktop-intel-mac-rebuild/releases/latest`
and save its ID, tag, prerelease state, and HTML URL.

- [ ] **Step 2: Record all existing asset identities**

For every current Release, save each asset's ID, name, size, and GitHub
SHA-256 digest. This snapshot is the post-push invariant.

### Task 2: Replace The Repository README

**Files:**
- Replace: `README.md`

- [ ] **Step 1: Write a distribution-specific README**

The README must contain:

- A prominent unofficial Intel macOS rebuild title.
- A direct Latest Release/download link.
- A link to `NousResearch/hermes-agent` as the official source.
- Stable upstream Release polling every six hours.
- Intel `x86_64` and declared macOS 12+ compatibility.
- The unsigned/notarized Gatekeeper warning and right-click Open guidance.
- SHA-256 verification guidance.
- A statement that the repository intentionally does not vendor upstream code.

- [ ] **Step 2: Check README links and required warnings**

Use `rg` to require the Latest Release URL, upstream repository URL,
`x86_64`, `macOS 12`, `not signed or notarized`, and `SHA256SUMS.txt`.

### Task 3: Stage The Minimal Repository Tree

**Files:**
- Retain: `README.md`
- Retain: `LICENSE`
- Retain: `.github/workflows/build-intel-macos-release.yml`
- Delete: every other tracked path.

- [ ] **Step 1: Narrow the local sparse checkout**

Set non-cone sparse patterns for the three retained files so unneeded tracked
files leave the working tree before their index entries are removed.

- [ ] **Step 2: Remove all non-retained paths from the Git index**

Generate the removal list from `git ls-files`, explicitly excluding only the
three retained paths. Use Git's sparse-aware removal rather than filesystem
wildcards.

- [ ] **Step 3: Prove the staged tree is exact**

Require `git ls-files` after staging to equal exactly:

```text
.github/workflows/build-intel-macos-release.yml
LICENSE
README.md
```

- [ ] **Step 4: Validate retained content**

```bash
ruby -e 'require "yaml"; YAML.safe_load(File.read(ARGV[0]), [], [], true)' .github/workflows/build-intel-macos-release.yml
npx prettier --check .github/workflows/build-intel-macos-release.yml
actionlint .github/workflows/build-intel-macos-release.yml
git diff --check
```

Also require the workflow to query the official latest stable Release and check
out `NousResearch/hermes-agent` at the discovered upstream tag.

- [ ] **Step 5: Commit the minimal tree**

```bash
git add README.md LICENSE .github/workflows/build-intel-macos-release.yml
git commit -m "chore: reduce repository to Intel release automation"
```

### Task 4: Publish The Minimal Default Branch

**Files:**
- No additional tracked files changed.

- [ ] **Step 1: Rebase if fork main advanced**

Fetch `fork/main`; rebase only if necessary. Update the feature branch with
`--force-with-lease` only when rebasing changed its history.

- [ ] **Step 2: Push and fast-forward main**

```bash
git push fork codex/intel-mac-release-automation
git push fork codex/intel-mac-release-automation:main
```

- [ ] **Step 3: Verify the remote tree**

Use the GitHub Git Trees API recursively and require exactly three blob paths,
matching the retained set.

### Task 5: Verify Distribution State And Automation

**Files:**
- No tracked files changed.

- [ ] **Step 1: Compare Release assets to the snapshot**

Require every Release asset ID, name, size, and digest to match Task 1 exactly.

- [ ] **Step 2: Verify Latest Release**

Require the latest endpoint to resolve to the same normal Release recorded in
Task 1.

- [ ] **Step 3: Dispatch the workflow**

Manually dispatch on `main`. Require the discovery job to succeed and the Intel
macOS build job to be skipped because the current upstream stable Release is
already published.
