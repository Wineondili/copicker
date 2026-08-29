import Foundation
import JavaScriptCore
import Testing

private let payloadBehaviorRepositoryRoot = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent()
    .deletingLastPathComponent()
    .deletingLastPathComponent()

private func payloadSource() throws -> String {
    try String(
        contentsOf: payloadBehaviorRepositoryRoot.appendingPathComponent(
            "Sources/CopickerCLI/Resources/model-rail.js"
        ),
        encoding: .utf8
    )
}

private func tunerSource() throws -> String {
    try String(
        contentsOf: payloadBehaviorRepositoryRoot.appendingPathComponent(
            "tools/model-rail-tuner.html"
        ),
        encoding: .utf8
    )
}

private func behaviorContractSource(_ payload: String) throws -> String {
    let startMarker = "/* COPICKER_BEHAVIOR_CONTRACT_BEGIN */"
    let endMarker = "/* COPICKER_BEHAVIOR_CONTRACT_END */"
    let start = try #require(payload.range(of: startMarker)?.upperBound)
    let end = try #require(payload.range(of: endMarker, range: start..<payload.endIndex)?.lowerBound)
    return String(payload[start..<end])
}

private func behaviorContext() throws -> JSContext {
    let context = try #require(JSContext())
    context.exceptionHandler = { _, exception in
        if let exception {
            Issue.record("JavaScript behavior contract failed: \(exception)")
        }
    }
    let contract = try behaviorContractSource(payloadSource())
    _ = context.evaluateScript(contract)
    return context
}

private func callStringFunction(
    _ name: String,
    arguments: [Any],
    in context: JSContext
) throws -> String {
    let function = try #require(context.objectForKeyedSubscript(name))
    return try #require(function.call(withArguments: arguments)?.toString())
}

@Test
func rapidPointerReleaseUsesItsFinalDisplacement() throws {
    let context = try behaviorContext()

    #expect(try callStringFunction(
        "pointerReleaseAction",
        arguments: [true, false, 10, 10, 10, 10, 5],
        in: context
    ) == "toggle-fast")
    #expect(try callStringFunction(
        "pointerReleaseAction",
        arguments: [true, false, 10, 10, 110, 10, 5],
        in: context
    ) == "select")
    #expect(try callStringFunction(
        "pointerReleaseAction",
        arguments: [true, true, 10, 10, 10, 10, 5],
        in: context
    ) == "select")
    #expect(try callStringFunction(
        "pointerReleaseAction",
        arguments: [false, false, 10, 10, 10, 10, 5],
        in: context
    ) == "select")

    let previewFastMode = try #require(
        context.objectForKeyedSubscript("pointerPreviewFastMode")
    )
    #expect(previewFastMode.call(withArguments: [true, true])?.toBool() == true)
    #expect(previewFastMode.call(withArguments: [true, false])?.toBool() == false)
    #expect(previewFastMode.call(withArguments: [false, true])?.toBool() == false)
}

@Test
func threadResolutionRequiresOneExactCurrentComposerIdentifier() throws {
    let context = try behaviorContext()
    let function = try #require(context.objectForKeyedSubscript("exactValidThreadID"))
    let current = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
    let stale = "11111111-2222-4333-8444-555555555555"

    #expect(function.call(withArguments: [[current, current]])?.toString() == current)
    #expect(function.call(withArguments: [[current, stale]])?.isNull == true)
    #expect(function.call(withArguments: [[NSNull(), "not-a-thread-id"]])?.isNull == true)
}

@Test
func pointerHandlerCommitsOneFrozenReleaseSnapshotAndRollsBackCancellation() throws {
    let payload = try payloadSource()

    #expect(payload.contains("const action = pointerReleaseAction("))
    #expect(payload.contains("previewPointerSelection("))
    #expect(payload.contains("gestureStartSelection.fastMode"))
    #expect(payload.contains("Object.freeze({ ...selection })"))
    #expect(payload.contains("enqueueSelectionSnapshot(selection, revision)"))
    #expect(payload.contains("if (gestureStartSelection) applySelection(gestureStartSelection)"))
    #expect(payload.contains(".stage.dragging .thumb"))
    #expect(!payload.contains("function updateFromPointer("))
}

@Test
func pointerPreviewKeepsOriginalPositionalEasingDuringClickAndDrag() throws {
    for source in [try payloadSource(), try tunerSource()] {
        #expect(source.contains(
            "width 240ms cubic-bezier(0.22, 0.86, 0.2, 1)"
        ))
        #expect(source.contains(
            "bottom 240ms cubic-bezier(0.22, 0.86, 0.2, 1)"
        ))
        #expect(source.contains(
            "left 240ms cubic-bezier(0.22, 0.86, 0.2, 1)"
        ))
        #expect(source.contains(
            "top 240ms cubic-bezier(0.22, 0.86, 0.2, 1)"
        ))
        #expect(!source.contains(".stage.dragging .selection"))
        #expect(!source.contains(".stage.dragging .thumb {\n          transition:"))
        #expect(!source.contains("scale(1.02);\n      transition:"))
        #expect(source.contains(
            "transform: translate(-50%, -50%) scale(1.02)"
        ))
    }
}

@Test
func noTaskProxyAcceptsCurrentCodexDivMenuItems() throws {
    let payload = try payloadSource()

    #expect(payload.contains(
        "const SECONDARY_ITEM_SELECTOR = '[data-list-navigation-item=\"true\"]'"
    ))
    #expect(payload.contains("surface.querySelectorAll(SECONDARY_ITEM_SELECTOR)"))
    #expect(payload.contains("label.closest(SECONDARY_ITEM_SELECTOR)"))
    #expect(!payload.contains("button[data-list-navigation-item]"))
}

@Test
func selectionCommitScopesThreadResolutionToTheOpenComposer() throws {
    let payload = try payloadSource()
    let functionStart = try #require(payload.range(of: "function resolveCurrentThreadID(trigger)"))
    let functionEnd = try #require(
        payload.range(of: "function makeRequestID()", range: functionStart.upperBound..<payload.endIndex)
    )
    let resolver = String(payload[functionStart.lowerBound..<functionEnd.lowerBound])

    #expect(resolver.contains("trigger?.closest(\"[data-codex-composer-root]\")"))
    #expect(resolver.contains("composer?.querySelector(CONVERSATION_CONTEXT_SELECTOR)"))
    #expect(resolver.contains("return exactValidThreadID("))
    #expect(!resolver.contains("document.querySelectorAll"))
    #expect(payload.contains("const commitTrigger = findOpenTrigger();"))
    #expect(payload.contains("const threadID = resolveCurrentThreadID(commitTrigger);"))
    #expect(!payload.contains("state.currentThreadID || resolveCurrentThreadID"))
    #expect(payload.contains("const triggerChanged = previousTrigger !== target.trigger;"))
    #expect(payload.contains("state.currentThreadID = null;\n      removeDetachedPopover();"))
}
