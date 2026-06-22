# Versioned Assets And Latest Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every automated Intel macOS artifact an upstream-versioned filename and expose the newest successful community rebuild as GitHub's Latest Release.

**Architecture:** The scheduled workflow renames validated build outputs using the discovered upstream tag before checksumming and publishing them. It creates a normal Release with `--latest`; a one-time API migration renames existing binary assets without replacing their bytes, regenerates their checksum manifests, and promotes only the newest rebuild.

**Tech Stack:** GitHub Actions, Bash, GitHub CLI/REST API, Electron Builder, SHA-256.

---

### Task 1: Version Future Build Assets

**Files:**
- Modify: `.github/workflows/build-intel-macos-release.yml`

- [ ] **Step 1: Rename validated DMG and ZIP outputs**

After confirming exactly one x64 DMG and ZIP, derive:

```bash
versioned_base="Hermes-${UPSTREAM_TAG}-mac-x64"
versioned_dmg="release/${versioned_base}.dmg"
versioned_zip="release/${versioned_base}.zip"
mv "${dmgs[0]}" "$versioned_dmg"
mv "${zips[0]}" "$versioned_zip"
```

The upstream tag comes from GitHub's stable Release API and is already checked
out exactly by the build job.

- [ ] **Step 2: Generate portable checksums**

Run `shasum` from inside the release directory so `SHA256SUMS.txt` contains
asset basenames rather than `release/` paths:

```bash
(
  cd release
  shasum -a 256 "$(basename "$versioned_dmg")" "$(basename "$versioned_zip")" > SHA256SUMS.txt
)
```

Expose the renamed paths through the validation step outputs.

- [ ] **Step 3: Publish as Latest Release**

Remove `--prerelease` from `gh release create` and add `--latest`. Keep
"Unofficial" in the Release title and retain the signing/notarization warning.

- [ ] **Step 4: Run static validation**

```bash
ruby -e 'require "yaml"; YAML.safe_load(File.read(ARGV[0]), [], [], true)' .github/workflows/build-intel-macos-release.yml
npx prettier --check .github/workflows/build-intel-macos-release.yml
actionlint .github/workflows/build-intel-macos-release.yml
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 5: Commit the workflow**

```bash
git add .github/workflows/build-intel-macos-release.yml
git commit -m "feat: version Intel release assets"
```

### Task 2: Publish Workflow To The Fork

**Files:**
- No additional files changed.

- [ ] **Step 1: Rebase if fork main advanced**

Fetch `fork/main`. If it is not an ancestor of the feature branch, rebase the
feature branch onto it and update only the feature branch with
`--force-with-lease`.

- [ ] **Step 2: Push branch and fast-forward main**

```bash
git push fork codex/intel-mac-release-automation
git push fork codex/intel-mac-release-automation:main
```

Expected: the workflow commit is the fork's new default-branch HEAD.

### Task 3: Migrate Existing Automated Releases

**Files:**
- No repository files changed; GitHub Release metadata and assets change.

- [ ] **Step 1: Snapshot release and asset metadata**

Read `intel-macos-v2026.6.5` and `intel-macos-v2026.6.19` through the GitHub
API. Record each asset ID, name, size, and server-provided SHA-256 digest before
mutation.

- [ ] **Step 2: Rename DMG and ZIP assets in place**

PATCH each asset by ID so the names become:

```text
Hermes-v2026.6.5-mac-x64.dmg
Hermes-v2026.6.5-mac-x64.zip
Hermes-v2026.6.19-mac-x64.dmg
Hermes-v2026.6.19-mac-x64.zip
```

Require HTTP 200 and verify asset ID, size, and digest remain unchanged.

- [ ] **Step 3: Replace checksum manifests**

For each Release, preserve the two existing hashes, rewrite only the filenames
to their versioned basenames, delete the old `SHA256SUMS.txt` asset, and upload
the corrected file under the same name.

- [ ] **Step 4: Promote the newest rebuild**

PATCH `intel-macos-v2026.6.19` with:

```json
{"prerelease":false,"make_latest":"true"}
```

Leave `intel-macos-v2026.6.5` and the original manual Release unchanged as
prereleases.

### Task 4: Verify Latest And Deduplication

**Files:**
- No repository files changed.

- [ ] **Step 1: Verify public assets and digests**

Require each automated Release to contain one correctly versioned DMG, one ZIP,
and `SHA256SUMS.txt`. Require HTTP 200 for all assets and require each checksum
line to match the corresponding GitHub asset digest.

- [ ] **Step 2: Verify GitHub Latest**

Call `GET /repos/evencj11/hermes-agent-desktop-intel-mac-rebuild/releases/latest`
and require tag `intel-macos-v2026.6.19`, `draft=false`, and
`prerelease=false`.

- [ ] **Step 3: Verify workflow deduplication**

Manually dispatch the workflow on `main`. Require a successful discovery job
and a skipped `Build and publish Intel macOS artifacts` job because the latest
upstream tag already exists.
