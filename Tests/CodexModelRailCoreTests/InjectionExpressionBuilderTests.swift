import Foundation
import Testing
@testable import CodexModelRailCore

@Test func safelyEmbedsPayloadAsAJavaScriptLiteral() throws {
    let payload = """
    (() => ({ text: "quote: \\\" and newline\\n", installed: true }))();
    """

    let expression = try InjectionExpressionBuilder.makeInstallerExpression(payload: payload)

    #expect(expression.contains("executeJavaScript"))
    #expect(expression.contains("com.jonas.codex-model-rail.main-state"))
    #expect(expression.contains("quote:"))
    #expect(!expression.contains("conversation"))
}

@Test func decodesInspectorTarget() throws {
    let data = Data(
        """
        [{
          "id": "target-1",
          "title": "ChatGPT",
          "type": "node",
          "url": "file://",
          "webSocketDebuggerUrl": "ws://127.0.0.1:9229/example"
        }]
        """.utf8
    )

    let targets = try JSONDecoder().decode([InspectorTarget].self, from: data)

    #expect(targets.count == 1)
    #expect(targets[0].type == "node")
    #expect(targets[0].webSocketDebuggerURL?.host == "127.0.0.1")
}

@Test func rendererProbeExcludesUserContentSurfaces() {
    let expression = InjectionExpressionBuilder.rendererProbeExpression

    #expect(expression.contains("exactSelectors"))
    #expect(expression.contains("relatedAttributeNames"))
    #expect(expression.contains("overlay.querySelectorAll(\"button\")"))
    #expect(expression.contains("[data-codex-composer-root] button"))
    #expect(expression.contains("modelRailDescriptors"))
    #expect(expression.contains("detachedPopoverDescriptors"))
    #expect(expression.contains("parentIsBody"))
    #expect(expression.contains("overlapsPrimarySurface"))
    #expect(expression.contains("selectorTopTextInset"))
    #expect(expression.contains("selectorLeftTextInset"))
    #expect(expression.contains("selectorBottomTextInset"))
    #expect(expression.contains("selectorActiveModelFontSize"))
    #expect(expression.contains("selectorFillWidth"))
    #expect(expression.contains("keyboardNavigation"))
    #expect(expression.contains("const previewWidth = 289.75"))
    #expect(expression.contains("const previewHeight = 134.75"))
    #expect(expression.contains("popoverPadding"))
    #expect(!expression.contains("document.body.innerText"))
    #expect(!expression.contains("document.body.textContent"))
    #expect(!expression.contains("document.title"))
    #expect(!expression.contains("location.href"))
}

@Test func modelPickerShortcutUsesTheDocumentedBundleCommand() {
    let expression = InjectionExpressionBuilder.openModelPickerShortcutExpression

    #expect(expression.contains("keyCode: \"M\""))
    #expect(expression.contains("\"control\", \"shift\""))
    #expect(expression.contains("data-codex-composer-root"))
    #expect(!expression.contains("innerText"))
}

@Test func removalDisposesRendererStateAndDisablesTheExistingHook() {
    let expression = InjectionExpressionBuilder.removalExpression

    #expect(expression.contains("current?.dispose?.()"))
    #expect(expression.contains("state.source = cleanupSource"))
    #expect(expression.contains("state.disabled = true"))
    #expect(!expression.contains("innerText"))
    #expect(!expression.contains("textContent"))
}

@Test func primaryPickerProbeClicksOnlyTheExactReasoningTrigger() {
    let expression = InjectionExpressionBuilder.openPrimaryPickerExpression

    #expect(expression.contains("data-codex-intelligence-trigger"))
    #expect(expression.contains("data-composer-navigation-target=\"reasoning\""))
    #expect(expression.contains("type: \"mouseDown\""))
    #expect(!expression.contains("innerText"))
    #expect(!expression.contains("textContent"))
}

@Test func selectorClickTargetsOnlyTheLocalTerraMediumCell() {
    let expression = InjectionExpressionBuilder.clickSelectorCellExpression

    #expect(expression.contains("codex-model-rail-popover-host"))
    #expect(expression.contains("querySelector(\"#stage\")"))
    #expect(expression.contains("model: \"Terra\""))
    #expect(expression.contains("effort: \"medium\""))
    #expect(expression.contains("type: \"mouseDown\""))
    #expect(!expression.contains("data-list-navigation-item"))
    #expect(!expression.contains("data-model-picker-model-row"))
}
