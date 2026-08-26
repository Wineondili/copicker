import Foundation

public enum InjectionExpressionBuilder {
    public static func makeInstallerExpression(
        payload: String,
        settings: CopickerSettings = .defaults,
        settingsHTML: String = ""
    ) throws -> String {
        let encoder = JSONEncoder()
        let settingsData = try encoder.encode(settings)
        guard let settingsLiteral = String(data: settingsData, encoding: .utf8) else {
            throw InjectionExpressionError.payloadEncodingFailed
        }
        let settingsHTMLData = try encoder.encode(settingsHTML)
        guard let settingsHTMLLiteral = String(data: settingsHTMLData, encoding: .utf8) else {
            throw InjectionExpressionError.payloadEncodingFailed
        }
        let configuredPayload = """
        globalThis.__COPICKER_CONFIG__ = \(settingsLiteral);
        globalThis.__COPICKER_SETTINGS_HTML__ = \(settingsHTMLLiteral);
        \(payload)
        """
        let payloadData = try encoder.encode(configuredPayload)
        guard let payloadLiteral = String(data: payloadData, encoding: .utf8) else {
            throw InjectionExpressionError.payloadEncodingFailed
        }

        return """
        (async () => {
          const payload = \(payloadLiteral);
          const stateKey = Symbol.for("com.jonas.codex-model-rail.main-state");
          const moduleAPI = process.getBuiltinModule("module");
          const localRequire = typeof require === "function"
            ? require
            : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-injector.cjs");
          const electron = localRequire("electron");
          const previous = globalThis[stateKey];
          const state = previous || {
            source: payload,
            seen: new WeakSet(),
            listenerInstalled: false,
            inject: null,
            attach: null
          };

          state.source = payload;
          state.disabled = false;
          state.inject = async (contents) => {
            if (!contents || contents.isDestroyed()) return false;
            const type = contents.getType();
            if (type !== "window" && type !== "webview") return false;
            const url = contents.getURL();
            if (url.startsWith("devtools:")) return false;
            const frames = contents.mainFrame?.framesInSubtree || [];
            let injected = false;
            let triggerFound = false;
            for (const frame of frames) {
              try {
                const outcome = await frame.executeJavaScript(state.source, true);
                injected = true;
                triggerFound ||= Boolean(outcome && outcome.triggerFound);
              } catch {
                // A detached or cross-process frame should not block other frames.
              }
            }
            return { injected, triggerFound };
          };

          state.attach = (contents) => {
            if (!contents || state.seen.has(contents)) return;
            state.seen.add(contents);
            contents.on("did-finish-load", () => {
              void state.inject(contents);
            });
          };

          if (!state.listenerInstalled) {
            electron.app.on("web-contents-created", (_event, contents) => {
              state.attach(contents);
              void state.inject(contents);
            });
            state.listenerInstalled = true;
          }

          globalThis[stateKey] = state;
          const targets = electron.webContents.getAllWebContents();
          for (const target of targets) state.attach(target);
          const results = await Promise.all(targets.map((target) => state.inject(target)));

          return {
            installed: true,
            reusedMainHook: Boolean(previous),
            targetCount: targets.length,
            injectedTargetCount: results.filter((result) => result && result.injected).length,
            compatibleTargetCount: results.filter((result) => result && result.triggerFound).length
          };
        })()
        """
    }

    public static let removalExpression = """
    (async () => {
      const stateKey = Symbol.for("com.jonas.codex-model-rail.main-state");
      const globalKey = "__CODEX_MODEL_RAIL__";
      const settingsGlobalKey = "__COPICKER_SETTINGS_INTEGRATION__";
      const hostIDs = [
        "codex-model-rail-host",
        "codex-model-rail-popover-host",
        "copicker-settings-host",
        "copicker-settings-nav-button"
      ];
      const cleanupSource = `
        (() => {
          const current = window["${globalKey}"];
          const settingsIntegration = window["${settingsGlobalKey}"];
          const hadState = Boolean(current);
          const hadHost = ${JSON.stringify(hostIDs)}.some((id) => document.getElementById(id));
          current?.dispose?.();
          settingsIntegration?.dispose?.();
          for (const id of ${JSON.stringify(hostIDs)}) document.getElementById(id)?.remove();
          return { hadState, hadHost };
        })()
      `;
      const moduleAPI = process.getBuiltinModule("module");
      const localRequire = typeof require === "function"
        ? require
        : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-remove.cjs");
      const electron = localRequire("electron");
      const state = globalThis[stateKey];
      if (state) {
        state.source = cleanupSource;
        state.disabled = true;
      }

      let cleanedFrameCount = 0;
      let removedHostCount = 0;
      for (const contents of electron.webContents.getAllWebContents()) {
        if (!contents || contents.isDestroyed()) continue;
        const type = contents.getType();
        if (type !== "window" && type !== "webview") continue;
        for (const frame of contents.mainFrame?.framesInSubtree || []) {
          try {
            const result = await frame.executeJavaScript(cleanupSource, true);
            cleanedFrameCount += 1;
            if (result?.hadHost) removedHostCount += 1;
          } catch {
            // Detached frames are ignored.
          }
        }
      }

      return {
        removed: true,
        mainHookDisabled: Boolean(state),
        cleanedFrameCount,
        removedHostCount
      };
    })()
    """

    public static let scheduleInspectorShutdownExpression = """
    (() => {
      const inspector = process.getBuiltinModule("inspector");
      setTimeout(() => inspector.close(), 150);
      return { scheduled: true };
    })()
    """

    public static let rendererProbeExpression = """
    (async () => {
      const moduleAPI = process.getBuiltinModule("module");
      const localRequire = typeof require === "function"
        ? require
        : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-probe.cjs");
      const electron = localRequire("electron");
      const targets = electron.webContents.getAllWebContents().filter((contents) => {
        if (!contents || contents.isDestroyed()) return false;
        const type = contents.getType();
        return type === "window" || type === "webview";
      });
      const frames = [];
      const probeSource = `
        (() => {
          const relatedNames = new Set();
          let relatedAttributeOccurrences = 0;
          for (const element of document.querySelectorAll("*")) {
            for (const name of element.getAttributeNames()) {
              if (/model|intelligence|reason|composer/i.test(name)) {
                relatedNames.add(name);
                relatedAttributeOccurrences += 1;
              }
            }
          }
          const primarySurface = [...document.querySelectorAll('[data-radix-menu-content], [role="menu"]')]
            .find((surface) =>
              surface.querySelector("[data-reasoning-slider]") &&
              surface.querySelector("[data-model-picker-power-slider], [data-model-picker-view-toggle]") &&
              !surface.closest("[data-composer-overlay-floating-ui]")
            ) || null;
          const popoverHost = document.getElementById("codex-model-rail-popover-host");
          const anchorRect = primarySurface?.getBoundingClientRect() || null;
          const popoverRect = popoverHost?.getBoundingClientRect() || null;
          const popoverShadow = popoverHost?.shadowRoot || null;
          const selectorPanel = popoverShadow?.querySelector(".popover") || null;
          const selectorOtherLabel = popoverShadow?.querySelector(".other-label") || null;
          const selectorStage = popoverShadow?.querySelector("#stage") || null;
          const selectorStageRect = selectorStage?.getBoundingClientRect() || null;
          const selectorPanelRect = selectorPanel?.getBoundingClientRect() || null;
          const selectorModelLabel = popoverShadow?.querySelector(".model-label, .label") || null;
          const selectorEffortLabel = popoverShadow?.querySelector(".effort-label.active") || null;
          const selectorActiveModelLabel = selectorEffortLabel?.querySelector(".effort-model") || null;
          const selectorBottomModelLabel = [...(popoverShadow?.querySelectorAll(".model-label, .label") || [])].at(-1) || null;
          const selectorCurrentSelection = popoverShadow?.querySelector(".current-selection") || null;
          const selectorSelection = popoverShadow?.querySelector("#selection") || null;
          const selectorModelLabelRect = selectorModelLabel?.getBoundingClientRect() || null;
          const selectorEffortLabelRect = selectorEffortLabel?.getBoundingClientRect() || null;
          const selectorBottomModelLabelRect = selectorBottomModelLabel?.getBoundingClientRect() || null;
          const selectorSelectionRect = selectorSelection?.getBoundingClientRect() || null;
          const selectorPanelStyle = selectorPanel ? getComputedStyle(selectorPanel) : null;
          const selectorOtherLabelStyle = selectorOtherLabel ? getComputedStyle(selectorOtherLabel) : null;
          const rectanglesOverlap = (left, right) => Boolean(left && right) && !(
            left.right <= right.left ||
            left.left >= right.right ||
            left.bottom <= right.top ||
            left.top >= right.bottom
          );
          const runtimeState = window.__CODEX_MODEL_RAIL__;
          const secondarySurfaces = [
            ...new Set(document.querySelectorAll('[data-radix-menu-content], [role="menu"]'))
          ].filter((surface) => {
            if (
              surface === primarySurface ||
              primarySurface?.contains(surface) ||
              (primarySurface && surface.contains(primarySurface))
            ) return false;
            const style = getComputedStyle(surface);
            const rect = surface.getBoundingClientRect();
            const composerInputOverlay = surface.closest(
              "[data-composer-overlay-floating-ui]"
            );
            return style.display !== "none" && style.visibility !== "hidden"
              && rect.width > 0 && rect.height > 0
              && (
                !composerInputOverlay ||
                Boolean(surface.querySelector("[data-model-picker-model-row]"))
              );
          });
          const secondaryRects = secondarySurfaces.map((surface) => surface.getBoundingClientRect());
          const conversationContextMarkers = [
            ...document.querySelectorAll("[data-above-composer-conversation-id]")
          ];
          const validThreadIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const officialFastControl = primarySurface?.querySelector(
            '[role="menuitemcheckbox"][data-fast-mode-enabled]'
          ) || null;
          const previewWidth = popoverRect?.width || 289.75;
          const previewHeight = popoverRect?.height || 134.75;
          const placementPreview = runtimeState?.previewPlacement?.(previewWidth, previewHeight) || null;
          const previewRect = placementPreview ? {
            left: placementPreview.x,
            top: placementPreview.y,
            right: placementPreview.x + previewWidth,
            bottom: placementPreview.y + previewHeight
          } : null;
          return {
            readyState: document.readyState,
            hasBody: Boolean(document.body),
            exactSelectors: {
              intelligenceTrigger: document.querySelectorAll("[data-codex-intelligence-trigger]").length,
              modelRow: document.querySelectorAll("[data-model-picker-model-row]").length,
              reasoningSlider: document.querySelectorAll("[data-reasoning-slider]").length,
              composerTargets: document.querySelectorAll("[data-composer-navigation-target]").length,
              conversationContextMarkers: conversationContextMarkers.length,
              validConversationContextMarkers: conversationContextMarkers.filter((element) =>
                validThreadIDPattern.test(
                  element.getAttribute("data-above-composer-conversation-id") || ""
                )
              ).length,
              modelRailHost: document.querySelectorAll("#codex-model-rail-host").length,
              detachedPopoverHost: document.querySelectorAll("#codex-model-rail-popover-host").length
            },
            detachedPopoverDescriptors: popoverHost ? [{
              version: popoverHost.getAttribute("data-codex-model-rail-popover"),
              parentIsBody: popoverHost.parentElement === document.body,
              insidePrimarySurface: Boolean(primarySurface?.contains(popoverHost)),
              placement: popoverHost.getAttribute("data-placement"),
              placementVariant: popoverHost.getAttribute("data-placement-variant"),
              preferredPlacement: popoverHost.getAttribute("data-preferred-placement"),
              placementLatched: popoverHost.getAttribute("data-placement-latched") === "true",
              appearance: popoverHost.getAttribute("data-appearance"),
              resolvedAppearance: popoverHost.getAttribute("data-appearance-resolved"),
              positionState: popoverHost.getAttribute("data-position-state"),
              openState: popoverHost.getAttribute("data-open-state"),
              secondaryObstacleCount: Number(
                popoverHost.getAttribute("data-secondary-obstacle-count") || 0
              ),
              visualPending: popoverHost.getAttribute("data-visual-pending"),
              prototype: popoverHost.getAttribute("data-prototype"),
              localOnly: popoverHost.getAttribute("data-local-only"),
              switchMode: popoverHost.getAttribute("data-switch-mode"),
              switchState: popoverHost.getAttribute("data-switch-state"),
              bridgeAvailable: typeof window.electronBridge?.sendMessageFromView === "function",
              directSelectionAvailable: typeof runtimeState?.setSelection === "function",
              officialFastEnabled: officialFastControl
                ? officialFastControl.getAttribute("data-fast-mode-enabled") === "true"
                  || officialFastControl.getAttribute("aria-checked") === "true"
                : null,
              keyboardNavigation: popoverHost.getAttribute("data-keyboard-navigation"),
              designSource: popoverHost.getAttribute("data-design-source"),
              selectorModel: popoverHost.getAttribute("data-selector-model"),
              selectorEffort: popoverHost.getAttribute("data-selector-effort"),
              selectorFast: popoverHost.getAttribute("data-selector-fast"),
              selectorHasSelection: popoverHost.getAttribute("data-selector-has-selection"),
              selectorOtherVisible: Boolean(selectorOtherLabel?.classList.contains("active"))
                && selectorOtherLabelStyle?.opacity !== "0",
              selectorOtherColor: selectorOtherLabelStyle?.color || null,
              selectorOtherFontSize: selectorOtherLabelStyle?.fontSize || null,
              selectorDotCount: popoverShadow?.querySelectorAll(".dot").length || 0,
              selectorActiveDotCount: popoverShadow?.querySelectorAll(".dot.inside").length || 0,
              selectorActiveEffortLabelCount: popoverShadow?.querySelectorAll(".effort-label.active").length || 0,
              selectorObscuredEndpointCount: popoverShadow?.querySelectorAll(".effort-endpoint.obscured").length || 0,
              selectorStageWidth: Math.round(selectorStageRect?.width || 0),
              selectorStageHeight: Math.round(selectorStageRect?.height || 0),
              selectorFillWidth: Number((selectorSelectionRect?.width || 0).toFixed(2)),
              selectorModelLabelFontSize: selectorModelLabel ? getComputedStyle(selectorModelLabel).fontSize : null,
              selectorEffortLabelFontSize: selectorEffortLabel ? getComputedStyle(selectorEffortLabel).fontSize : null,
              selectorActiveModelFontSize: selectorActiveModelLabel ? getComputedStyle(selectorActiveModelLabel).fontSize : null,
              selectorCurrentFontSize: selectorCurrentSelection ? getComputedStyle(selectorCurrentSelection).fontSize : null,
              selectorTopTextInset: selectorPanelRect && selectorEffortLabelRect
                ? Math.round(selectorEffortLabelRect.top - selectorPanelRect.top)
                : null,
              selectorLeftTextInset: selectorPanelRect && selectorModelLabelRect
                ? Math.round(selectorModelLabelRect.left - selectorPanelRect.left)
                : null,
              selectorBottomTextInset: selectorPanelRect && selectorBottomModelLabelRect
                ? Number((selectorPanelRect.bottom - selectorBottomModelLabelRect.bottom).toFixed(2))
                : null,
              popoverPadding: selectorPanelStyle ? {
                top: selectorPanelStyle.paddingTop,
                right: selectorPanelStyle.paddingRight,
                bottom: selectorPanelStyle.paddingBottom,
                left: selectorPanelStyle.paddingLeft
              } : null,
              popoverBackgroundColor: selectorPanelStyle?.backgroundColor || null,
              ariaHidden: popoverHost.getAttribute("aria-hidden"),
              width: Number((popoverRect?.width || 0).toFixed(2)),
              height: Number((popoverRect?.height || 0).toFixed(2)),
              overlapsPrimarySurface: rectanglesOverlap(popoverRect, anchorRect),
              overlapsSecondarySurface: secondaryRects.some((rect) =>
                rectanglesOverlap(popoverRect, rect)
              ),
              placementPreview: placementPreview ? {
                fixtureWidth: previewWidth,
                fixtureHeight: previewHeight,
                placement: placementPreview.placement,
                placementVariant: placementPreview.placementVariant,
                x: Math.round(placementPreview.x),
                y: Math.round(placementPreview.y),
                overlapsPrimarySurface: rectanglesOverlap(previewRect, anchorRect),
                overlapsSecondarySurface: secondaryRects.some((rect) =>
                  rectanglesOverlap(previewRect, rect)
                )
              } : null
            }] : [],
            modelRailDescriptors: [...document.querySelectorAll("#codex-model-rail-host")]
              .slice(0, 2)
              .map((host) => {
                const rect = host.getBoundingClientRect();
                return {
                  version: host.getAttribute("data-codex-model-rail"),
                  visible: rect.width > 0 && rect.height > 0 && getComputedStyle(host).display !== "none",
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  buttonCount: host.shadowRoot?.querySelectorAll(".track button").length || 0,
                  buttonLabels: [...(host.shadowRoot?.querySelectorAll(".track button") || [])]
                    .slice(0, 12)
                    .map((button) => button.getAttribute("aria-label") || button.textContent || "")
                    .map((label) => String(label).replace(/\\s+/g, " ").trim().slice(0, 80))
                };
              }),
            composerNavigationTargetValues: [
              ...new Set(
                [...document.querySelectorAll("[data-composer-navigation-target]")]
                  .map((element) => element.getAttribute("data-composer-navigation-target"))
                  .filter(Boolean)
              )
            ].sort(),
            composerControlDescriptors: [...document.querySelectorAll("[data-codex-composer-root] button")]
              .filter((button) => !button.closest("[data-composer-overlay-floating-ui]"))
              .slice(0, 16)
              .map((button) => ({
                controlLabel: String(
                  button.getAttribute("aria-label") || button.innerText || button.textContent || ""
                ).replace(/\\s+/g, " ").trim().slice(0, 80),
                ariaExpanded: button.getAttribute("aria-expanded"),
                ariaHasPopup: button.getAttribute("aria-haspopup"),
                navigationTarget: button.getAttribute("data-composer-navigation-target"),
                selectedReasoningEffort: button.getAttribute("data-selected-reasoning-effort"),
                dataState: button.getAttribute("data-state"),
                dataAttributes: button.getAttributeNames()
                  .filter((name) => name.startsWith("data-"))
                  .sort()
              })),
            popupTriggerDescriptors: [...document.querySelectorAll("[aria-haspopup]")]
              .filter((element) => {
                const style = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                if (style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) {
                  return false;
                }
                const dataNames = element.getAttributeNames().filter((name) => name.startsWith("data-"));
                return element.getAttribute("aria-expanded") === "true"
                  || dataNames.some((name) => /model|intelligence|reason|composer/i.test(name));
              })
              .slice(0, 12)
              .map((element) => ({
                tag: element.tagName.toLocaleLowerCase(),
                ariaHasPopup: element.getAttribute("aria-haspopup"),
                ariaExpanded: element.getAttribute("aria-expanded"),
                dataState: element.getAttribute("data-state"),
                withinComposer: Boolean(element.closest("[data-codex-composer-root], [data-codex-composer]")),
                dataAttributes: element.getAttributeNames()
                  .filter((name) => name.startsWith("data-"))
                  .sort()
              })),
            activeElementDescriptor: document.activeElement ? {
              tag: document.activeElement.tagName.toLocaleLowerCase(),
              role: document.activeElement.getAttribute("role"),
              ariaHasPopup: document.activeElement.getAttribute("aria-haspopup"),
              ariaExpanded: document.activeElement.getAttribute("aria-expanded"),
              dataAttributes: document.activeElement.getAttributeNames()
                .filter((name) => name.startsWith("data-"))
                .sort()
            } : null,
            composerOverlayDescriptors: [...document.querySelectorAll("[data-composer-overlay-floating-ui]")]
              .slice(0, 4)
              .map((overlay) => {
                const roleHistogram = {};
                for (const element of overlay.querySelectorAll("[role]")) {
                  const role = element.getAttribute("role");
                  if (role) roleHistogram[role] = (roleHistogram[role] || 0) + 1;
                }
                return {
                  dataAttributes: overlay.getAttributeNames()
                    .filter((name) => name.startsWith("data-"))
                    .sort(),
                  descendantDataAttributes: [
                    ...new Set(
                      [...overlay.querySelectorAll("*")]
                        .flatMap((element) => element.getAttributeNames())
                        .filter((name) => name.startsWith("data-"))
                    )
                  ].sort(),
                  roleHistogram,
                  buttonCount: overlay.querySelectorAll("button").length,
                  buttonDescriptors: [...overlay.querySelectorAll("button")]
                    .slice(0, 12)
                    .map((button) => ({
                      controlLabel: String(button.innerText || button.textContent || "")
                        .replace(/\\s+/g, " ")
                        .trim()
                        .slice(0, 80),
                      ariaLabel: button.getAttribute("aria-label"),
                      ariaExpanded: button.getAttribute("aria-expanded"),
                      ariaHasPopup: button.getAttribute("aria-haspopup"),
                      navigationTarget: button.getAttribute("data-composer-navigation-target"),
                      selectedReasoningEffort: button.getAttribute("data-selected-reasoning-effort"),
                      dataState: button.getAttribute("data-state"),
                      dataAttributes: button.getAttributeNames()
                        .filter((name) => name.startsWith("data-"))
                        .sort()
                    }))
                };
              }),
            relatedAttributeNames: [...relatedNames].sort(),
            relatedAttributeOccurrences
          };
        })()
      `;

      for (const contents of targets) {
        for (const frame of contents.mainFrame.framesInSubtree) {
          try {
            const result = await frame.executeJavaScript(probeSource, false);
            frames.push({ webContentsType: contents.getType(), ...result });
          } catch {
            frames.push({ webContentsType: contents.getType(), probeFailed: true });
          }
        }
      }

      return {
        targetCount: targets.length,
        frameCount: frames.length,
        frames
      };
    })()
    """

    public static let openModelPickerShortcutExpression = """
    (async () => {
      const moduleAPI = process.getBuiltinModule("module");
      const localRequire = typeof require === "function"
        ? require
        : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-shortcut.cjs");
      const electron = localRequire("electron");
      const targets = electron.webContents.getAllWebContents().filter((contents) => {
        if (!contents || contents.isDestroyed()) return false;
        const type = contents.getType();
        return type === "window" || type === "webview";
      });
      let target = null;
      let matchedComposer = false;
      for (const candidate of targets) {
        try {
          const hasComposer = await candidate.mainFrame.executeJavaScript(
            'Boolean(document.querySelector("[data-codex-composer-root], [data-codex-composer]"))',
            false
          );
          if (hasComposer) {
            target = candidate;
            matchedComposer = true;
            break;
          }
        } catch {
          // Detached targets are ignored.
        }
      }
      target ||= electron.webContents.getFocusedWebContents();
      if (!target || target.isDestroyed()) return { sent: false, matchedComposer: false };
      target.sendInputEvent({
        type: "keyDown",
        keyCode: "M",
        modifiers: ["control", "shift"]
      });
      target.sendInputEvent({
        type: "keyUp",
        keyCode: "M",
        modifiers: ["control", "shift"]
      });
      return { sent: true, matchedComposer };
    })()
    """

    public static let openPrimaryPickerExpression = """
    (async () => {
      const moduleAPI = process.getBuiltinModule("module");
      const localRequire = typeof require === "function"
        ? require
        : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-primary-picker.cjs");
      const electron = localRequire("electron");
      for (const contents of electron.webContents.getAllWebContents()) {
        if (!contents || contents.isDestroyed()) continue;
        const type = contents.getType();
        if (type !== "window" && type !== "webview") continue;
        for (const frame of contents.mainFrame?.framesInSubtree || []) {
          try {
            const result = await frame.executeJavaScript(`
              (() => {
                const trigger = document.querySelector(
                  '[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]'
                );
                if (!trigger) return { found: false };
                const rect = trigger.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return { found: true, visible: false };
                if (trigger.getAttribute("aria-expanded") === "true") {
                  return { found: true, visible: true, alreadyOpen: true };
                }
                return {
                  found: true,
                  visible: true,
                  alreadyOpen: false,
                  x: Math.round(rect.left + rect.width / 2),
                  y: Math.round(rect.top + rect.height / 2)
                };
              })()
            `, true);
            if (!result?.found) continue;
            if (result.alreadyOpen || !result.visible) {
              return { ...result, clicked: false };
            }
            contents.sendInputEvent({ type: "mouseMove", x: result.x, y: result.y });
            contents.sendInputEvent({
              type: "mouseDown",
              x: result.x,
              y: result.y,
              button: "left",
              clickCount: 1
            });
            contents.sendInputEvent({
              type: "mouseUp",
              x: result.x,
              y: result.y,
              button: "left",
              clickCount: 1
            });
            return { found: true, visible: true, alreadyOpen: false, clicked: true };
          } catch {
            // Detached frames are ignored.
          }
        }
      }
      return { found: false, clicked: false, alreadyOpen: false };
    })()
    """

    public static let clickSelectorCellExpression = """
    (async () => {
      const moduleAPI = process.getBuiltinModule("module");
      const localRequire = typeof require === "function"
        ? require
        : moduleAPI.createRequire(process.cwd() + "/.codex-model-rail-selector-click.cjs");
      const electron = localRequire("electron");
      for (const contents of electron.webContents.getAllWebContents()) {
        if (!contents || contents.isDestroyed()) continue;
        const type = contents.getType();
        if (type !== "window" && type !== "webview") continue;
        for (const frame of contents.mainFrame?.framesInSubtree || []) {
          try {
            const result = await frame.executeJavaScript(`
              (async () => {
                const runtime = window.__CODEX_MODEL_RAIL__;
                const host = document.getElementById("codex-model-rail-popover-host");
                if (!host || typeof runtime?.setSelection !== "function") {
                  return { found: false, switched: false, restored: false };
                }

                const original = runtime.getSelection?.() || null;
                if (!original || original.modelName === "Other" || !original.effort) {
                  return {
                    found: true,
                    switched: false,
                    restored: false,
                    reason: "unsupported-original-selection"
                  };
                }
                const target = original.modelName === "Terra" && original.effort === "medium"
                  ? { modelName: "Sol", effort: "low", fastMode: !original.fastMode }
                  : { modelName: "Terra", effort: "medium", fastMode: !original.fastMode };

                let switched = false;
                let restored = false;
                let selectedAfterSwitch = null;
                try {
                  await runtime.commitCurrentSelection({ force: true });
                  await runtime.setSelection(target.modelName, target.effort, target.fastMode);
                  selectedAfterSwitch = runtime.getSelection();
                  switched = selectedAfterSwitch.modelName === target.modelName
                    && selectedAfterSwitch.effort === target.effort
                    && selectedAfterSwitch.fastMode === target.fastMode;
                } finally {
                  await runtime.setSelection(
                    original.modelName,
                    original.effort,
                    original.fastMode
                  );
                  const selectedAfterRestore = runtime.getSelection();
                  restored = selectedAfterRestore.modelName === original.modelName
                    && selectedAfterRestore.effort === original.effort
                    && selectedAfterRestore.fastMode === original.fastMode;
                }

                return {
                  found: true,
                  switched,
                  restored,
                  original,
                  target,
                  selectedAfterSwitch,
                  finalSelection: runtime.getSelection(),
                  switchMode: host.getAttribute("data-switch-mode"),
                  switchState: host.getAttribute("data-switch-state")
                };
              })()
            `, true);
            if (!result?.found) continue;
            return result;
          } catch {
            // Detached frames are ignored.
          }
        }
      }
      return { found: false, switched: false, restored: false };
    })()
    """

    public static let clickPrototypeButtonExpression = clickSelectorCellExpression

}

public enum InjectionExpressionError: LocalizedError {
    case payloadEncodingFailed

    public var errorDescription: String? {
        "Copicker payload could not be encoded as a JavaScript string literal."
    }
}
