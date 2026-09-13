# Source-sharing and privacy boundary

Public source and a local development folder are different deliverables. Export a reviewed Git ref rather than compressing a working directory with ignored files.

## Exclude local artifacts

- Never distribute `.git`, `.build`, `.swiftpm`, `local-docs`, logs, or Finder metadata in an ordinary source package.
- Do not include extracted third-party application bundles, local screenshots, app/account state, or diagnostic captures.
- Keep required plugin metadata: `.agents/plugins/marketplace.json`, the plugin's `.mcp.json`, and `.codex-plugin/plugin.json` are part of the installable source.
- Public documentation must omit personal home-directory paths, local temporary artifact locations, concrete process identifiers, and personal preference snapshots. Use generic descriptions instead.

Normal authorship, repository links, public compatibility versions, and legacy runtime identifiers are intentionally retained. This is privacy-sanitized source, not an anonymous redistribution or a change of license.

## Before a push or release

1. Inspect the exact tracked file list and staged changes, including documentation and hidden metadata.
2. Run `swift test`; the documentation privacy test rejects personal machine paths and concrete process identifiers.
3. Scan for credentials and inspect non-text assets separately. Passing the documentation test alone is not a complete secrets audit.
4. Inspect the intended source archive and Release attachments, not just the development working tree.
5. Keep private recovery bundles and audit records outside the repository.

## 2026-09-13 history maintenance

The owner authorized a one-time privacy rewrite of the public history and its four existing release tags. Machine-specific paths and diagnostic details were removed; versioned runtime source was preserved. Affected commit IDs and tag objects changed, and release snapshots were reissued solely for this cleanup. This is an explicit exception to the usual immutable-release policy, not permission for routine tag movement.

Do not merge or push a pre-cleanup clone into the rewritten repository. Re-clone from the remote, or carefully transfer only reviewed patches, so the old history is not reintroduced. Retain old recovery copies privately, not under a public ref.

History rewriting cannot recall copies already downloaded by others. Old GitHub cached commit views may require separate support handling; completion of reachable-history cleanup is not a claim that every cached or third-party copy has disappeared. See [GitHub's removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
