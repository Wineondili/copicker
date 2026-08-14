import Foundation

public enum InjectionExpressionBuilder {
    public static func makeInstallerExpression(payload: String) throws -> String {
        let payloadData = try JSONEncoder().encode(payload)
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
      const hostID = "codex-model-rail-host";
      const cleanupSource = `
        (() => {
          const current = window["${globalKey}"];
          const hadState = Boolean(current);
          const hadHost = Boolean(document.getElementById("${hostID}"));
          current?.dispose?.();
          document.getElementById("${hostID}")?.remove();
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
          return {
            readyState: document.readyState,
            hasBody: Boolean(document.body),
            exactSelectors: {
              intelligenceTrigger: document.querySelectorAll("[data-codex-intelligence-trigger]").length,
              modelRow: document.querySelectorAll("[data-model-picker-model-row]").length,
              reasoningSlider: document.querySelectorAll("[data-reasoning-slider]").length,
              composerTargets: document.querySelectorAll("[data-composer-navigation-target]").length,
              modelRailHost: document.querySelectorAll("#codex-model-rail-host").length
            },
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

}

public enum InjectionExpressionError: LocalizedError {
    case payloadEncodingFailed

    public var errorDescription: String? {
        "Model Rail payload could not be encoded as a JavaScript string literal."
    }
}
