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
    let context = try behaviorContext()
    let unchangedCommit = try #require(
        context.objectForKeyedSubscript("shouldCommitUnchangedPointerSelection")
    )

    #expect(payload.contains("const action = pointerReleaseAction("))
    #expect(payload.contains("previewPointerSelection("))
    #expect(payload.contains("gestureStartSelection.fastMode"))
    #expect(payload.contains("Object.freeze({ ...selection })"))
    #expect(payload.contains("enqueueSelectionSnapshot(selection, revision, {"))
    #expect(payload.contains(
        "if (gestureRollbackSelection) applySelection(gestureRollbackSelection)"
    ))
    #expect(payload.contains("railBaseline: gestureRollbackSelection"))
    #expect(payload.contains("const pendingKeyboardBaseline = cancelPendingKeyboardCommit()"))
    #expect(unchangedCommit.call(withArguments: [true, true])?.toBool() == true)
    #expect(unchangedCommit.call(withArguments: [false, true])?.toBool() == false)
    #expect(unchangedCommit.call(withArguments: [false, false])?.toBool() == true)
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
func noTaskProxyUsesCurrentCodexSemanticMenuItemsAndTriggerActivation() throws {
    let payload = try payloadSource()

    #expect(payload.contains(
        "const SECONDARY_ITEM_SELECTOR = '[data-list-navigation-item=\"true\"]'"
    ))
    #expect(payload.contains(
        "'[data-list-navigation-item=\"true\"], [role=\"menuitem\"]'"
    ))
    #expect(payload.contains("surface.querySelectorAll(OFFICIAL_MENU_ITEM_SELECTOR)"))
    #expect(payload.contains("label.closest(OFFICIAL_MENU_ITEM_SELECTOR)"))
    #expect(payload.contains("[role=\"menuitem\"]:not([aria-haspopup])"))
    #expect(payload.contains("surface.querySelectorAll(\"[data-active='true']\")"))
    #expect(payload.contains("const hasMarkedFlatLayout ="))
    #expect(payload.contains("const hasExactThreeFlyoutLayout ="))
    #expect(payload.contains("structuralItems.length === 3"))
    #expect(payload.contains("officialItemsExcludingDaybreakProgram"))
    #expect(payload.contains("officialDaybreakProgramControl"))
    #expect(payload.contains("function officialAdvancedToggleTarget()"))
    #expect(payload.contains("OFFICIAL_TRANSIENT_CONTROL_TIMEOUT_MS"))
    #expect(payload.contains("if (rows) return { rows, surface }"))
    #expect(payload.contains(
        "control.getAttribute(\"aria-expanded\") !== \"true\""
    ))
    #expect(payload.contains(
        "waitForOfficialState(\n      officialAdvancedToggleTarget"
    ))
    #expect(payload.contains("function pressOfficialComposerTrigger(control)"))
    #expect(payload.contains("new PointerEvent(\"pointerdown\""))
    #expect(payload.contains("clickOfficialControl(fallbackTrigger)"))
    #expect(payload.contains("rows.layoutKind === \"power-submenus\""))
    #expect(payload.contains("if (controls.length !== 1) return null"))
    #expect(payload.contains(
        "isPrimarySurface(surface) || isOfficialPrimarySurfaceForProxy(surface)"
    ))
    #expect(payload.contains("state.officialModelCatalog = officialCatalog"))
    #expect(payload.contains("includeHidden: true"))
    #expect(payload.contains("hidden: model.hidden === true"))
    #expect(payload.contains("candidate?.hidden !== true"))
    #expect(payload.contains("async function loadOfficialModelCatalog()"))
    #expect(payload.contains("result?.nextCursor ?? result?.next_cursor ?? null"))
    #expect(payload.contains("seenCursors.has(nextCursor)"))
    #expect(payload.contains("state.modelCatalogPromise = loadOfficialModelCatalog()"))
    #expect(payload.contains("officialElementMatchesModelLabels"))
    #expect(payload.contains("officialRowForElement"))
    #expect(payload.contains("officialSelectedModelCatalogEntry"))
    #expect(payload.contains("officialLeafSemanticSignature"))
    #expect(payload.contains("confirmOfficialModelSelection"))
    #expect(payload.contains("currentOfficialCatalogEntryFromControls"))
    #expect(payload.contains("resolveOfficialModelTarget"))
    #expect(payload.contains("captureOfficialSelectionBaseline"))
    #expect(payload.contains("readOfficialSelectionBaselineSnapshot"))
    #expect(payload.contains("restoreOfficialSelectionBaseline"))
    #expect(payload.contains("selectOfficialServiceTierIndex"))
    #expect(payload.contains("coPickerSelectionFromOfficialBaseline"))
    #expect(payload.contains("resolveOfficialEffortTarget"))
    #expect(payload.contains("officialDaybreakProgramState"))
    #expect(payload.contains("const hasCurrentThread = Boolean(state.currentThreadID)"))
    #expect(payload.contains("if (baseline.serviceTierOptionIndex === 0) return false"))
    #expect(payload.contains("await assertOfficialDaybreakSelectionPolicyReady(selection, context)"))
    #expect(payload.contains("const explicitlyUnselectable = selection?.rowIndex === null"))
    #expect(payload.contains("record.attributeName === \"data-model-selected\""))
    #expect(payload.contains("\"data-model-selected\","))
    #expect(payload.contains("officialProxyContextTrigger"))
    #expect(payload.contains("assertOfficialProxyContext"))
    #expect(!payload.contains("rowMatchesTriggerText"))
    #expect(!payload.contains("itemText.startsWith"))
    let openStart = try #require(
        payload.range(of: "async function ensureOfficialPrimaryOpen(context)")
    )
    let openEnd = try #require(
        payload.range(of: "function officialAdvancedRows(surface)", range: openStart.upperBound..<payload.endIndex)
    )
    let openFunction = String(payload[openStart.lowerBound..<openEnd.lowerBound])
    #expect(openFunction.contains("pressOfficialComposerTrigger(trigger)"))
    #expect(openFunction.contains("OFFICIAL_POINTER_OPEN_GRACE_MS"))
    #expect(openFunction.contains("clickOfficialControl(fallbackTrigger)"))
    #expect(!payload.contains("button[data-list-navigation-item]"))

    let clickStart = try #require(payload.range(of: "function clickOfficialControl(control)"))
    let clickEnd = try #require(
        payload.range(
            of: "function pressOfficialComposerTrigger(control)",
            range: clickStart.upperBound..<payload.endIndex
        )
    )
    let clickFunction = String(payload[clickStart.lowerBound..<clickEnd.lowerBound])
    #expect(clickFunction.contains("new PointerEvent(\"pointermove\""))
    #expect(clickFunction.contains("control.focus({ preventScroll: true })"))
    #expect(clickFunction.contains("control.click()"))

    let primaryStart = try #require(
        payload.range(of: "function findOfficialPrimarySurfaceForProxy(trigger)")
    )
    let primaryEnd = try #require(
        payload.range(
            of: "function currentOpenOfficialPrimaryTarget()",
            range: primaryStart.upperBound..<payload.endIndex
        )
    )
    let primaryFunction = String(payload[primaryStart.lowerBound..<primaryEnd.lowerBound])
    #expect(primaryFunction.contains("const controlledID = trigger?.getAttribute(\"aria-controls\")"))
    #expect(primaryFunction.contains("return isOfficialPrimarySurfaceForProxy(controlled) ? controlled : null"))
    #expect(primaryFunction.contains("return candidates.length === 1 ? candidates[0] : null"))
    #expect(!primaryFunction.contains("sort("))

    let submenuStart = try #require(
        payload.range(of: "function findOfficialSubmenuSurface(trigger, primarySurface, predicate)")
    )
    let submenuEnd = try #require(
        payload.range(
            of: "async function openOfficialSubmenu",
            range: submenuStart.upperBound..<payload.endIndex
        )
    )
    let submenuFunction = String(payload[submenuStart.lowerBound..<submenuEnd.lowerBound])
    #expect(submenuFunction.contains("const controlled = document.getElementById(controlledID)"))
    #expect(submenuFunction.contains("return null"))

    let selectedLeafStart = try #require(
        payload.range(of: "function officialSelectedLeafIndex(items)")
    )
    let selectedLeafEnd = try #require(
        payload.range(
            of: "async function selectOfficialModel",
            range: selectedLeafStart.upperBound..<payload.endIndex
        )
    )
    let selectedLeafFunction = String(
        payload[selectedLeafStart.lowerBound..<selectedLeafEnd.lowerBound]
    )
    #expect(selectedLeafFunction.contains("item.querySelector(OFFICIAL_CHECK_ICON_SELECTOR)"))

    let proxyStart = try #require(
        payload.range(
            of: "async function performOfficialControlProxy(selection, catalogEntry, intent)"
        )
    )
    let proxyEnd = try #require(
        payload.range(
            of: "async function performNoThreadSelectionCommit",
            range: proxyStart.upperBound..<payload.endIndex
        )
    )
    let proxyFunction = String(payload[proxyStart.lowerBound..<proxyEnd.lowerBound])
    let targetPreflight = try #require(
        proxyFunction.range(of: "await resolveOfficialModelTarget(catalogEntry, context)")
    )
    let baselineCapture = try #require(
        proxyFunction.range(of: "await captureOfficialSelectionBaseline(context)")
    )
    let standardClearing = try #require(
        proxyFunction.range(of: "if (rollbackBaseline.requiresStandardNormalization)")
    )
    let mutationStart = try #require(
        proxyFunction.range(of: "mutationStarted = true")
    )
    let modelSelection = try #require(proxyFunction.range(of: "await selectOfficialModel("))
    #expect(targetPreflight.lowerBound < standardClearing.lowerBound)
    #expect(targetPreflight.lowerBound < baselineCapture.lowerBound)
    #expect(baselineCapture.lowerBound < mutationStart.lowerBound)
    #expect(mutationStart.lowerBound < standardClearing.lowerBound)
    #expect(standardClearing.lowerBound < modelSelection.lowerBound)
    #expect(payload.contains("await currentOfficialCatalogEntryFromControls(context)"))
    #expect(proxyFunction.contains("if (!row.supportsFast)"))
    #expect(!proxyFunction.contains("readOfficialFastMode(initial.surface) !== false"))
    #expect(proxyFunction.contains("Boolean(selection.fastMode)"))
    #expect(proxyFunction.contains("composerRoot: intent?.composerRoot || null"))
    let guardInstall = try #require(
        proxyFunction.range(of: "removeInputGuard = installOfficialProxyInputGuard(context)")
    )
    let primaryOpen = try #require(
        proxyFunction.range(of: "const initial = await ensureOfficialPrimaryOpen(context)")
    )
    #expect(guardInstall.lowerBound < primaryOpen.lowerBound)
    #expect(proxyFunction.contains("assertSelectionIntent(intent)"))
    #expect(proxyFunction.contains("assertOfficialDaybreakSelectionPolicyReady("))
    #expect(proxyFunction.contains(
        "await restoreOfficialSelectionBaseline(rollbackBaseline, context)"
    ))
    #expect(proxyFunction.contains(
        "error.rollbackSelection = coPickerSelectionFromOfficialBaseline("
    ) || proxyFunction.contains(
        ": coPickerSelectionFromOfficialBaseline(rollbackBaseline)"
    ))
    #expect(proxyFunction.contains("error.officialRollbackStatus ="))
    #expect(proxyFunction.contains("\"restored-normalized\""))
    #expect(proxyFunction.contains("rollbackBaseline.requiresStandardNormalization"))
    #expect(payload.contains(
        "requiresStandardNormalization: serviceTierOptionIndex === 0"
    ) || payload.contains(
        "requiresStandardNormalization: second.serviceTierOptionIndex === 0"
    ))
    #expect(payload.contains("The current official selection changed during capture."))
    #expect(payload.contains(
        "restored.serviceTierOptionIndex !== baseline.serviceTierOptionIndex"
    ))
    #expect(payload.contains("state.officialModelCatalog.filter((entry)"))
    #expect(proxyFunction.contains("const finalBaseline = await captureOfficialSelectionBaseline"))
    #expect(proxyFunction.contains("coPickerSelectionFromOfficialBaseline(finalBaseline)"))
    #expect(proxyFunction.contains("const finalMutationGeneration ="))
    #expect(proxyFunction.contains("error.externalOfficialStateChanged = true"))
    #expect(!payload.contains("catalog-standard-only"))
    #expect(payload.contains(
        "recognizedRow.supportsFast && officialFastMode === true"
    ))
    #expect(!payload.contains(
        "isRecognized && recognizedRow.supportsFast && officialFastMode !== true"
    ))
    #expect(!payload.contains("state.confirmedSelection = !isRecognized"))
    #expect(payload.contains("state.confirmedSelection = rollbackSelection || null"))
    #expect(payload.contains("program.checked !== false"))
    #expect(payload.contains("candidate.getAttribute(\"aria-busy\")"))
    #expect(payload.contains("The Codex Daybreak program is loading"))
    #expect(!payload.contains("function officialSelectionFromDOM("))
}

@Test
func noTaskSpeedConfirmationNeverTreatsUnknownAsStandard() throws {
    let context = try behaviorContext()
    let confirm = try #require(
        context.objectForKeyedSubscript("officialSpeedConfirmationSource")
    )
    let exactLabel = try #require(
        context.objectForKeyedSubscript("officialExactLabelMatch")
    )
    let transitionPlan = try #require(
        context.objectForKeyedSubscript("officialServiceTierTransitionPlan")
    )
    let verifyUnchanged = try #require(
        context.objectForKeyedSubscript("shouldVerifyUnchangedNoTaskSelection")
    )
    let reuseThread = try #require(
        context.objectForKeyedSubscript("shouldReuseThreadSelectionConfirmation")
    )
    let allowBase = try #require(
        context.objectForKeyedSubscript("daybreakProgramAllowsBaseConfirmation")
    )

    #expect(confirm.call(withArguments: [true, true, NSNull(), 1])?.toString() == "checkbox")
    #expect(confirm.call(withArguments: [true, NSNull(), 1, 1])?.toString() == "selected-leaf")
    #expect(confirm.call(withArguments: [false, false, NSNull(), 0])?.isNull == true)
    #expect(confirm.call(withArguments: [false, NSNull(), NSNull(), 0])?.isNull == true)
    #expect(confirm.call(withArguments: [false, true, NSNull(), 0])?.isNull == true)
    #expect(confirm.call(withArguments: [true, NSNull(), 0, 1])?.isNull == true)

    #expect(exactLabel.call(withArguments: [["5.6-Sol"], ["5.6-Sol"]])?.toBool() == true)
    #expect(exactLabel.call(withArguments: [["5.6-Solar"], ["5.6-Sol"]])?.toBool() == false)
    #expect(exactLabel.call(withArguments: [["Speed Ultrafast"], ["Fast"]])?.toBool() == false)

    #expect(
        transitionPlan.call(withArguments: [0, 0, 3, 2])?.toArray() as? [Int] == [2, 0]
    )
    #expect(
        transitionPlan.call(withArguments: [0, 1, 3, 2])?.toArray() as? [Int] == [0]
    )
    #expect(
        transitionPlan.call(withArguments: [1, 0, 3, 1])?.toArray() as? [Int] == [1]
    )
    #expect(transitionPlan.call(withArguments: [0, 0, 1, NSNull()])?.isNull == true)
    #expect(transitionPlan.call(withArguments: [0, 0, 3, NSNull()])?.isNull == true)
    #expect(verifyUnchanged.call(withArguments: [true, false, true])?.toBool() == true)
    #expect(verifyUnchanged.call(withArguments: [true, false, false])?.toBool() == false)
    #expect(verifyUnchanged.call(withArguments: [true, true, true])?.toBool() == false)
    #expect(reuseThread.call(withArguments: [true, false, true, false])?.toBool() == true)
    #expect(reuseThread.call(withArguments: [true, false, true, true])?.toBool() == false)
    #expect(reuseThread.call(withArguments: [true, false, false, false])?.toBool() == false)
    #expect(allowBase.call(withArguments: [true, false])?.toBool() == true)
    #expect(allowBase.call(withArguments: [true, true])?.toBool() == false)
    #expect(allowBase.call(withArguments: [true, NSNull()])?.toBool() == false)
    #expect(allowBase.call(withArguments: [false, NSNull(), false])?.toBool() == false)
    #expect(allowBase.call(withArguments: [false, NSNull(), true])?.toBool() == true)
}

@Test
func threadSettingsNeverConflateOtherServiceTiersWithStandard() throws {
    let context = try behaviorContext()
    let fastState = try #require(
        context.objectForKeyedSubscript("officialServiceTierFastState")
    )

    #expect(fastState.call(withArguments: [NSNull(), "priority"])?.toBool() == false)
    #expect(fastState.call(withArguments: ["priority", "priority"])?.toBool() == true)
    #expect(fastState.call(withArguments: ["ultrafast", "priority"])?.isNull == true)
    #expect(fastState.call(withArguments: ["flex", NSNull()])?.isNull == true)

    #expect(fastState.call(withArguments: [])?.isNull == true)

    let payload = try payloadSource()
    let commitStart = try #require(
        payload.range(of: "async function performSelectionCommitBound(")
    )
    let commitEnd = try #require(
        payload.range(
            of: "async function performSelectionCommit(",
            range: commitStart.upperBound..<payload.endIndex
        )
    )
    let commitFunction = String(payload[commitStart.lowerBound..<commitEnd.lowerBound])
    let daybreakPreflight = try #require(
        commitFunction.range(of: "await assertOfficialDaybreakSelectionPolicyReady(")
    )
    let waiterCreation = try #require(
        commitFunction.range(of: "confirmation = createSettingsWaiter(")
    )
    let settingsRequest = try #require(
        commitFunction.range(of: "await sendAppServerRequest(\"thread/settings/update\"")
    )
    #expect(daybreakPreflight.lowerBound < waiterCreation.lowerBound)
    #expect(waiterCreation.lowerBound < settingsRequest.lowerBound)
    #expect(payload.contains("state.confirmedSelection = null"))
    #expect(payload.contains("state.commitThreadID === threadID"))
    #expect(payload.contains("expectedCurrentCommitNotification"))
    #expect(payload.contains("generation > waiter.afterGeneration"))
    #expect(commitFunction.contains(
        "confirmationResult.generation <= notificationGenerationAtStart"
    ))
    #expect(payload.contains("const replayIsOlderThanActiveWaiter ="))
    #expect(payload.contains("rememberTrustedOfficialSelectionAction"))
    #expect(payload.contains("latest.generation <= trustedSelection.afterGeneration"))
    #expect(payload.contains("state.latestThreadSettings.delete(state.currentThreadID)"))
    #expect(payload.contains("candidate.matches(\"[data-model-picker-power-slider]\")"))
    #expect(payload.contains(
        "document.addEventListener(\"wheel\", state.handleOfficialInteraction, true)"
    ))
    #expect(payload.contains("state.selectorRefreshRetryComposerRoot = composerRoot"))
    #expect(payload.contains("state.threadClassificationRetryKey = key"))
    #expect(commitFunction.contains("let requestDispatched = false"))
    #expect(commitFunction.contains("const hasUnconfirmedDispatchedUpdate ="))
    #expect(commitFunction.contains("!directContext.interruptedByUserInput"))
    #expect(commitFunction.contains("selectionIntentIsCurrent(intent)"))
    #expect(payload.contains("state.officialInteractionEpoch += 1"))
    #expect(payload.contains("latestNotification.generation"))
    #expect(commitFunction.contains("await restoreOfficialPickerView(directContext)"))
    #expect(commitFunction.contains("reconcileSettingsNotification("))
    #expect(payload.contains("for (const waiter of matchingWaiters)"))
    #expect(!payload.contains("const officialSelection = officialSelectionFromDOM()"))
}

@Test
func noTaskAdvancedLayoutClassifiesLegacyPowerAndFlatEffortVariants() throws {
    let payload = try payloadSource()
    let context = try behaviorContext()
    let classify = try #require(
        context.objectForKeyedSubscript("officialAdvancedLayout")
    )

    let legacy = try #require(classify.call(withArguments: [3, 0, [], [0, 1, 2]]))
    #expect(legacy.objectForKeyedSubscript("kind")?.toString() == "submenu-effort")
    #expect(legacy.objectForKeyedSubscript("modelIndex")?.toInt32() == 0)
    #expect(legacy.objectForKeyedSubscript("effortIndex")?.toInt32() == 1)
    #expect(legacy.objectForKeyedSubscript("speedIndex")?.toInt32() == 2)

    let power = try #require(classify.call(withArguments: [3, -1, [], [0, 1, 2]]))
    #expect(power.objectForKeyedSubscript("kind")?.toString() == "power-submenus")
    #expect(power.objectForKeyedSubscript("modelIndex")?.toInt32() == 0)
    #expect(power.objectForKeyedSubscript("effortIndex")?.toInt32() == 1)
    #expect(power.objectForKeyedSubscript("speedIndex")?.toInt32() == 2)

    let flat = try #require(classify.call(withArguments: [8, 6, [2], [6, 7], 6, 2]))
    #expect(flat.objectForKeyedSubscript("kind")?.toString() == "flat-effort")
    #expect(flat.objectForKeyedSubscript("modelIndex")?.toInt32() == 6)
    #expect(flat.objectForKeyedSubscript("speedIndex")?.toInt32() == 7)
    #expect(flat.objectForKeyedSubscript("effortIndices")?.toArray() as? [Int] == [0, 1, 2, 3, 4, 5])

    #expect(classify.call(withArguments: [4, -1, [], [1, 2, 3]])?.isNull == true)
    #expect(classify.call(withArguments: [4, 0, [], [0, 1, 2]])?.isNull == true)
    #expect(classify.call(withArguments: [3, 0, [], [0, 2]])?.isNull == true)
    #expect(classify.call(withArguments: [8, 6, [], [6, 7], 6, 2])?.isNull == true)
    #expect(classify.call(withArguments: [8, 6, [3], [6, 7], 6, 2])?.isNull == true)
    #expect(classify.call(withArguments: [8, 6, [2, 7], [6, 7], 6, 2])?.isNull == true)
    #expect(classify.call(withArguments: [8, 6, [2], [6, 7], 5, 2])?.isNull == true)
    #expect(classify.call(withArguments: [9, 6, [2], [6, 7], 6, 2])?.isNull == true)
    #expect(classify.call(withArguments: [9, 7, [2], [7, 8], 6, 2])?.isNull == true)
    #expect(classify.call(withArguments: [4, -1, [], [0, 1, 2, 3]])?.isNull == true)

    #expect(payload.contains("function currentOfficialEffortExpectation(surface)"))
    #expect(payload.contains(
        "currentOfficialCatalogEntry(trigger) ||\n      currentOfficialCatalogEntryFromModelRow(surface)"
    ))
    #expect(payload.contains(
        "const effortExpectation = currentOfficialEffortExpectation(surface)"
    ))
}

@Test
func selectionCommitScopesThreadResolutionToTheOpenComposer() throws {
    let payload = try payloadSource()
    let context = try behaviorContext()
    let intentMatches = try #require(
        context.objectForKeyedSubscript("selectionIntentIdentityMatches")
    )
    let functionStart = try #require(payload.range(of: "function resolveCurrentThreadID(trigger)"))
    let functionEnd = try #require(
        payload.range(
            of: "function captureSelectionIntent()",
            range: functionStart.upperBound..<payload.endIndex
        )
    )
    let resolver = String(payload[functionStart.lowerBound..<functionEnd.lowerBound])

    #expect(resolver.contains("trigger?.closest(\"[data-codex-composer-root]\")"))
    #expect(resolver.contains("composer?.querySelector(CONVERSATION_CONTEXT_SELECTOR)"))
    #expect(resolver.contains("return exactValidThreadID("))
    #expect(!resolver.contains("document.querySelectorAll"))
    #expect(payload.contains("const commitTrigger = assertSelectionIntent(intent);"))
    #expect(payload.contains("const threadID = resolveCurrentThreadID(commitTrigger);"))
    #expect(payload.contains("intent = captureSelectionIntent()"))
    #expect(payload.contains("assertSelectionIntent(intent);"))
    #expect(intentMatches.call(withArguments: [NSNull(), NSNull(), true, true, 7, 7])?.toBool() == true)
    #expect(intentMatches.call(withArguments: ["task-a", "task-b", true, true, 7, 7])?.toBool() == false)
    #expect(intentMatches.call(withArguments: ["task-a", "task-a", false, true, 7, 7])?.toBool() == false)
    #expect(intentMatches.call(withArguments: ["task-a", "task-a", true, false, 7, 7])?.toBool() == false)
    #expect(intentMatches.call(withArguments: ["task-a", "task-a", true, true, 7, 8])?.toBool() == false)
    #expect(!payload.contains("state.currentThreadID || resolveCurrentThreadID"))
    #expect(payload.contains("const triggerChanged = previousTrigger !== target.trigger;"))
    #expect(payload.contains("const threadIdentityChanged ="))
    #expect(payload.contains("\"data-above-composer-conversation-id\","))
    #expect(payload.contains("state.confirmedThreadID === threadID"))
    #expect(payload.contains("reconcileSettingsNotification("))
    #expect(payload.contains("latest?.settings"))
    #expect(payload.contains("state.selectorRefreshComposerRoot === composerRoot"))
    #expect(payload.contains("state.commitQueue = state.selectorRefreshPromise.catch"))
    #expect(payload.contains(
        "cancelPendingKeyboardCommit();\n      state.currentThreadID = null;"
    ))
}
