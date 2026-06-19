# Intel macOS Release Automation

## Goal

Automatically publish an unofficial Intel macOS build in the user's fork after
Nous Research publishes a new stable Hermes Agent GitHub Release. Drafts,
prereleases, and ordinary commits to the upstream default branch must not
trigger a build.

The fork will be renamed to `hermes-agent-desktop-intel-mac-rebuild`. Its
description and Release notes must make clear that it is a community rebuild,
not an official Nous Research distribution.

## Trigger And Deduplication

A GitHub Actions workflow in the fork runs every six hours and also supports
manual dispatch. It queries the public GitHub API for the latest stable Release
in `NousResearch/hermes-agent`. GitHub's latest-release endpoint excludes draft
and prerelease releases.

The workflow derives a fork Release tag from the upstream tag. If that Release
already exists in the fork, the workflow exits successfully without using a
macOS runner. This makes scheduled runs idempotent and keeps routine checks
inexpensive.

## Build

When a new upstream stable Release is found, the build job runs on the public
`macos-15-intel` GitHub-hosted runner. It checks out the upstream repository at
the exact Release tag, installs dependencies from the committed lockfile, and
runs the desktop Electron build with an explicit `--x64` target. Automatic
certificate discovery is disabled because the community build has no Apple
signing identity.

The job must verify all of the following before publishing:

- The packaged Hermes executable is a Mach-O `x86_64` executable.
- The staged `node-pty` module and `spawn-helper` are `x86_64`.
- The DMG passes `hdiutil verify`.
- Both DMG and ZIP artifacts exist and have SHA-256 checksums.

Any failed check stops the workflow and creates no Release.

## Publishing

The workflow receives only `contents: write` permission and uses the fork's
ephemeral `GITHUB_TOKEN`. It creates a prerelease named for the upstream stable
tag and uploads the Intel DMG, ZIP, and checksum file.

Every generated Release includes:

- A link to the exact upstream Release and source tag.
- The upstream commit SHA used for the build.
- An explicit `x86_64` architecture statement.
- A prominent statement that the build is unofficial, unsigned, and not
  notarized by Apple.
- Gatekeeper guidance that tells users to use the override only if they trust
  the build.

The fork Release remains a prerelease even though its input is an upstream
stable Release. This prevents the community artifact from appearing equivalent
to an official signed distribution.

## Failure Handling

Scheduled failures remain visible in GitHub Actions and are retried on the next
six-hour run. A concurrency group prevents overlapping builds. A Release is
created only after build and validation complete, so interrupted runs cannot
leave a published Release with missing assets.

Manual dispatch supports retrying the latest stable upstream Release. It does
not bypass deduplication unless the existing fork Release is first removed.

## Verification

Before enabling the schedule, manually dispatch the workflow once against the
current latest stable upstream Release. Confirm that the workflow either
recognizes the existing community Release or produces a validated new Release,
and confirm that all public asset URLs return HTTP 200.
