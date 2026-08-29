import Foundation
import Testing
@testable import CopickerCore

private let documentationRepositoryRoot = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent()
    .deletingLastPathComponent()
    .deletingLastPathComponent()

private func documentationText(_ path: String) throws -> String {
    try String(
        contentsOf: documentationRepositoryRoot.appendingPathComponent(path),
        encoding: .utf8
    )
}

private func acceptedBaselineValues(_ text: String) throws -> [String: String] {
    let marker = "<!-- COPICKER_ACCEPTED_BASELINE_V1"
    var reading = false
    var values: [String: String] = [:]

    for rawLine in text.components(separatedBy: .newlines) {
        let line = rawLine.trimmingCharacters(in: .whitespaces)
        if line == marker {
            reading = true
            continue
        }
        if reading, line == "-->" {
            return values
        }
        guard reading, let separator = line.firstIndex(of: "=") else {
            continue
        }
        let key = String(line[..<separator])
        let value = String(line[line.index(after: separator)...])
        values[key] = value
    }

    Issue.record("The accepted baseline metadata block is missing or unterminated")
    return values
}

@Test
func acceptedDocumentationVersionLayersMatchSourceContracts() throws {
    let baseline = try documentationText("docs/accepted-baseline.md")
    let values = try acceptedBaselineValues(baseline)
    let renderer = try documentationText("Sources/CopickerCLI/Resources/model-rail.js")
    let settingsHTML = try documentationText(
        "Sources/CopickerCLI/Resources/copicker-settings-v2.html"
    )
    let pluginData = try Data(
        contentsOf: documentationRepositoryRoot.appendingPathComponent(
            "Plugin/copicker/.codex-plugin/plugin.json"
        )
    )
    let plugin = try #require(
        JSONSerialization.jsonObject(with: pluginData) as? [String: Any]
    )
    let rendererVersion = try #require(values["renderer_version"])

    #expect(values["accepted_runtime_commit"] == "c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb")
    #expect(values["accepted_live_cli_version"] == "0.12.0-dev")
    #expect(values["published_release_tag"] == "v0.99.0")
    #expect(values["published_release_commit"] == "v0.99.0^{commit}")
    #expect(values["cli_version"] == ProjectInfo.version)
    #expect(plugin["version"] as? String == ProjectInfo.version)
    #expect(rendererVersion == "0.12.11")
    #expect(renderer.contains("const VERSION = \"\(rendererVersion)\""))
    #expect(values["settings_schema_version"] == String(CopickerSettings.currentSchemaVersion))
    #expect(values["settings_resource_uri"] == CopickerMCPProtocol.settingsResourceURI)
    #expect(values["marketplace_name"] == "copicker-local")
    #expect(values["plugin_id"] == "copicker@copicker-local")

    #expect(settingsHTML.contains("--copicker-page-top-inset: 20px"))
    #expect(settingsHTML.contains("width: min(100%, 768px)"))
    #expect(settingsHTML.contains("--copicker-line-page-title: var(--font-heading-lg-line-height, 1.2)"))
    #expect(renderer.contains("nativeSettingsScrollViewport"))
    #expect(renderer.contains("rect.width >= containerRect.width * 0.85"))
    #expect(renderer.contains("[\"--font-heading-lg-line-height"))
    #expect(!renderer.contains("\"--text-2xl--line-height\""))
}

@Test
func publicGuidesAnchorInstallBehaviorAndAcceptedMeasurements() throws {
    let baseline = try documentationText("docs/accepted-baseline.md")
    let values = try acceptedBaselineValues(baseline)
    let readme = try documentationText("README.md")
    let installation = try documentationText("docs/installation.md")
    let usage = try documentationText("docs/usage.md")
    let pluginSettings = try documentationText("docs/plugin-settings.md")
    let development = try documentationText("docs/development.md")
    let validation = try documentationText("docs/validation.md")
    let architecture = try documentationText("docs/architecture.md")
    let contributing = try documentationText("CONTRIBUTING.md")
    let designQA = try documentationText("design-qa.md")
    let releaseNotes = try documentationText("docs/releases/v0.99.0.md")
    let installer = try documentationText("script/install.sh")

    let acceptedCommit = try #require(values["accepted_runtime_commit"])
    let publishedTag = try #require(values["published_release_tag"])
    for document in [readme, installation] {
        #expect(document.contains(acceptedCommit))
        #expect(document.contains(publishedTag))
        #expect(document.contains("full-feature"))
    }

    for requirement in [
        "CP-ACT-001",
        "CP-SEL-007",
        "CP-MOD-004",
        "CP-PLC-004",
        "CP-SET-005",
        "CP-SAFE-006",
    ] {
        #expect(baseline.contains(requirement))
    }

    #expect(readme.contains("does **not** modify, unpack into, replace, or re-sign"))
    #expect(installation.contains("never with `sudo`"))
    #expect(installation.contains("Optional preference migration"))
    #expect(usage.contains("New unsent task"))
    #expect(usage.contains("original 240-millisecond fill/thumb positional transition"))
    #expect(pluginSettings.contains("Apply now"))
    #expect(development.contains(
        "documentation-only and version-only commits do not become runtime acceptance anchors"
    ))
    #expect(validation.contains("Use `not tested`"))
    #expect(architecture.contains("thread/settings/update"))
    #expect(architecture.contains("CSS transition never determines selection intent"))
    #expect(contributing.contains("Never terminate or restart Codex"))
    #expect(installer.contains("codex plugin add copicker@copicker-local"))
    #expect(releaseNotes.contains("Copicker v0.99.0"))
    #expect(releaseNotes.contains("no unsigned or non-notarized prebuilt executable"))
    #expect(releaseNotes.contains("35 offline tests"))

    #expect(values["official_settings_toolbar_height_css_px"] == "46")
    #expect(values["official_settings_panel_inset_css_px"] == "20")
    #expect(values["official_settings_content_max_width_css_px"] == "768")
    #expect(values["official_settings_heading_font_size_css_px"] == "24")
    #expect(values["official_settings_heading_line_height_css_px"] == "28.8")
    #expect(values["official_settings_heading_to_group_title_css_px"] == "70.3")
    #expect(values["official_settings_heading_bottom_to_group_title_css_px"] == "41.5")

    #expect(pluginSettings.contains("42-pixel iframe inset is superseded"))
    #expect(!pluginSettings.contains("42-pixel page-top inset"))
    #expect(designQA.contains("Superseded screenshot-derived page-top inset"))
    #expect(designQA.contains("CoPicker live native settings viewport alignment"))
    #expect(designQA.contains("final result: passed for the exact runtime and Codex build above"))
}
