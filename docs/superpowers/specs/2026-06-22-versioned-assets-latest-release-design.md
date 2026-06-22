# Versioned Assets And Latest Release Design

## Goal

Make each Intel macOS artifact identify the upstream stable Hermes Agent
release that produced it, and make the newest successful rebuild appear as the
repository's Latest Release.

## Future Releases

The existing scheduled workflow continues to discover only the latest stable
release from `NousResearch/hermes-agent`. After building and validating the
DMG and ZIP, it renames them with the upstream tag:

- `Hermes-<upstream-tag>-mac-x64.dmg`
- `Hermes-<upstream-tag>-mac-x64.zip`

For example, upstream `v2026.6.19` produces
`Hermes-v2026.6.19-mac-x64.dmg`. `SHA256SUMS.txt` records the versioned
basenames rather than build-directory paths.

The workflow publishes the validated output as a normal GitHub Release and
explicitly marks it Latest. The release remains prominently labeled
"Unofficial" in its title and notes, and retains the unsigned/notarized warning.

## Existing Releases

The automated `intel-macos-v2026.6.5` and `intel-macos-v2026.6.19` Releases
will have their DMG and ZIP assets renamed to include their respective upstream
tags. Their checksum files will be replaced so the recorded filenames match
the renamed assets while preserving the existing hashes.

Only `intel-macos-v2026.6.19`, the newest automated rebuild, will be converted
from prerelease to normal Release and marked Latest. The older v2026.6.5
Release remains a prerelease to avoid presenting two stable community releases
as current. The original manually published `desktop-v0.15.1-intel-unofficial`
Release and its assets remain unchanged.

## Safety And Verification

Release migration uses GitHub's asset rename API for DMG and ZIP files, so the
binary bytes are not rebuilt or replaced. Before replacing each checksum file,
the current hashes are retained and only the filenames are rewritten.

After migration, verification requires:

- Workflow YAML, expressions, and shell scripts pass static validation.
- Each automated Release contains exactly one versioned DMG, one versioned ZIP,
  and `SHA256SUMS.txt`.
- Every public asset URL returns HTTP 200.
- The latest-release API resolves to `intel-macos-v2026.6.19` with
  `prerelease=false`.
- A manual workflow dispatch detects the existing latest rebuild and skips the
  macOS build job.
