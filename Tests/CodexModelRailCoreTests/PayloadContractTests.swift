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
    #expect(payload.contains("data-composer-navigation-target=\"reasoning\""))
    #expect(payload.contains("data-radix-menu-content"))
    #expect(payload.contains("data-reasoning-slider"))
    #expect(payload.contains("data-composer-overlay-floating-ui"))
    #expect(payload.contains("data-list-navigation-item"))
    #expect(payload.contains("isSecondarySurface"))
    #expect(payload.contains("isSecondaryPickerOpen"))
    #expect(payload.contains("querySelectorAll(SECONDARY_ITEM_SELECTOR).length >= 2"))
    #expect(payload.contains("if (isSecondaryPickerOpen()) return null"))
    #expect(payload.contains("visualPending: true"))
    #expect(payload.contains("document.body.append(host)"))
    #expect(payload.contains("computePlacement"))
    #expect(payload.contains("hidden-no-fit"))
    #expect(payload.contains("!overlaps(rect, anchorRect)"))
    #expect(payload.contains("ResizeObserver"))
    #expect(!payload.contains("attachShadow"))
    #expect(payload.contains("MutationObserver"))
    #expect(!payload.contains("fetch("))
    #expect(!payload.contains("XMLHttpRequest"))
    #expect(!payload.contains("localStorage"))
    #expect(!payload.contains("sessionStorage"))
    #expect(!payload.contains("indexedDB"))
    #expect(!payload.contains("document.cookie"))
}
