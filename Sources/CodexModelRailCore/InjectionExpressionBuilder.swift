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
          state.inject = async (contents) => {
            if (!contents || contents.isDestroyed()) return false;
            const type = contents.getType();
            if (type !== "window" && type !== "webview") return false;
            const url = contents.getURL();
            if (url.startsWith("devtools:")) return false;
            try {
              const outcome = await contents.executeJavaScript(state.source, true);
              return {
                injected: true,
                triggerFound: Boolean(outcome && outcome.triggerFound)
              };
            } catch {
              return { injected: false, triggerFound: false };
            }
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

    public static let scheduleInspectorShutdownExpression = """
    (() => {
      const inspector = process.getBuiltinModule("inspector");
      setTimeout(() => inspector.close(), 150);
      return { scheduled: true };
    })()
    """
}

public enum InjectionExpressionError: LocalizedError {
    case payloadEncodingFailed

    public var errorDescription: String? {
        "Model Rail payload could not be encoded as a JavaScript string literal."
    }
}
