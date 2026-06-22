# Hermes Desktop for Intel macOS (Unofficial)

Community-built Intel (`x86_64`) macOS packages for
[Hermes Agent](https://github.com/NousResearch/hermes-agent).

> This repository is not affiliated with Nous Research. Packages are built
> from official stable Hermes Agent Release tags, but they are not signed or
> notarized by Apple.

## Download

Download the newest DMG or ZIP from the
[Latest Release](https://github.com/evencj11/hermes-agent-desktop-intel-mac-rebuild/releases/latest).

Each automated Release includes:

- `Hermes-<official-version>-mac-x64.dmg`
- `Hermes-<official-version>-mac-x64.zip`
- `SHA256SUMS.txt`

## Compatibility

- Intel Mac (`x86_64`)
- macOS 12 or later

The package declares macOS 12 as its minimum version. Automated builds and
validation currently run on GitHub's macOS 15 Intel runner.

## Gatekeeper Notice

These community packages are **not signed or notarized by Apple**, so macOS may
block the first launch. Right-click `Hermes.app`, choose **Open**, and confirm
the prompt.

Only if you trust the downloaded package, you can alternatively run:

```bash
xattr -dr com.apple.quarantine /Applications/Hermes.app
```

Verify the download against `SHA256SUMS.txt` before bypassing Gatekeeper.

## How Releases Are Built

The GitHub Actions workflow checks every six hours for the latest stable
[official Hermes Agent Release](https://github.com/NousResearch/hermes-agent/releases).
When it finds a new version, it:

1. Checks out the exact official Release tag from `NousResearch/hermes-agent`.
2. Builds the Electron desktop app for `x86_64` on an Intel macOS runner.
3. Verifies the app and native Node modules are Intel binaries.
4. Verifies the DMG and publishes versioned assets with SHA-256 checksums.

This repository intentionally does not vendor the upstream Hermes Agent source
tree. Browse or audit the complete source in the
[official repository](https://github.com/NousResearch/hermes-agent).

## License

Hermes Agent is distributed under the MIT License. See [LICENSE](LICENSE).
