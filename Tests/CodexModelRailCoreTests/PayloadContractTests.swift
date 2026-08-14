import Foundation
import Testing

@Test func payloadUsesOnlyVersionedCodexDOMAnchors() throws {
    let testFile = URL(fileURLWithPath: #filePath)
    let repositoryRoot = testFile
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    let payloadURL = repositoryRoot
        .appendingPathComponent("Sources/CodexModelRailInjector/Resources/model-rail.js")
    let payload = try String(contentsOf: payloadURL, encoding: .utf8)

    #expect(payload.contains("data-codex-intelligence-trigger"))
    #expect(payload.contains("data-model-picker-model-row"))
    #expect(payload.contains("data-composer-overlay-floating-ui"))
    #expect(payload.contains("data-list-navigation-item"))
    #expect(payload.contains("attachShadow"))
    #expect(payload.contains("MutationObserver"))
    #expect(!payload.contains("fetch("))
    #expect(!payload.contains("XMLHttpRequest"))
    #expect(!payload.contains("localStorage"))
    #expect(!payload.contains("sessionStorage"))
    #expect(!payload.contains("indexedDB"))
    #expect(!payload.contains("document.cookie"))
}
