import CodexModelRailCore
import Darwin
import Foundation

@main
@MainActor
struct CodexModelRailInjectorCLI {
    static func main() async {
        do {
            let arguments = Array(CommandLine.arguments.dropFirst())
            let command = arguments.first ?? "status"

            switch command {
            case "status", "dry-run":
                try printStatus()
            case "probe":
                try await probe()
            case "probe-picker":
                try await probePicker()
            case "probe-primary":
                try await probePrimaryPicker()
            case "probe-prototype":
                try await probePrototypeInteraction()
            case "inject":
                try await inject()
            case "remove":
                try await remove()
            case "help", "--help", "-h":
                printUsage()
            default:
                throw CLIError.unknownCommand(command)
            }
        } catch {
            fputs("Codex Model Rail error: \(error.localizedDescription)\n", stderr)
            exit(1)
        }
    }

    private static func printStatus() throws {
        let installation = try CodexInstallation.inspect()
        let process = CodexProcessDiscovery.runningProcess(
            bundleIdentifier: installation.bundleIdentifier
        )
        let payload = try loadPayload()
        _ = try InjectionExpressionBuilder.makeInstallerExpression(payload: payload)

        print("Codex Model Rail \(ProjectInfo.version)")
        print("App: \(installation.appURL.path)")
        print("Codex version: \(installation.shortVersion) (\(installation.buildVersion))")
        print("Bundle identifier: \(installation.bundleIdentifier)")
        print("Electron fuse wire: \(installation.fuseReport.rawWire)")
        print("Node CLI Inspector: \(installation.fuseReport.nodeCLIInspectionEnabled ? "enabled" : "disabled")")
        print("ASAR integrity enforcement: \(installation.fuseReport.embeddedASARIntegrityEnabled ? "enabled" : "disabled")")
        print("Model Rail payload: \(payload.utf8.count) bytes")
        if let process {
            print("Running process: \(process.processIdentifier)")
            print("Executable: \(process.executableURL?.path ?? "unknown")")
        } else {
            print("Running process: not found")
        }
        print("No signal was sent and no Inspector connection was opened.")
    }

    private static func inject() async throws {
        let payload = try loadPayload()
        let expression = try InjectionExpressionBuilder.makeInstallerExpression(payload: payload)
        let session = try await openInspector()
        do {
            let result = try await session.evaluate(expression: expression)
            print("Injection result:")
            print(result?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
            print("Inspector shutdown scheduled; the official application bundle was not modified.")
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func probe() async throws {
        let session = try await openInspector()
        do {
            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.rendererProbeExpression
            )
            print("Scoped renderer probe:")
            print(result?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func remove() async throws {
        let session = try await openInspector()
        do {
            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.removalExpression
            )
            print("Removal result:")
            print(result?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
            print("Model Rail removed for the current Codex process; the official bundle was not modified.")
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func probePicker() async throws {
        let session = try await openInspector()
        do {
            let shortcutResult = try await session.evaluate(
                expression: InjectionExpressionBuilder.openModelPickerShortcutExpression
            )
            print("Model-picker shortcut result:")
            print(shortcutResult?.prettyPrinted() ?? "null")
            try await Task.sleep(for: .milliseconds(350))

            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.rendererProbeExpression
            )
            print("Scoped renderer probe after shortcut:")
            print(result?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func probePrimaryPicker() async throws {
        let session = try await openInspector()
        do {
            let openResult = try await session.evaluate(
                expression: InjectionExpressionBuilder.openPrimaryPickerExpression
            )
            print("Primary-picker open result:")
            print(openResult?.prettyPrinted() ?? "null")
            try await Task.sleep(for: .milliseconds(350))

            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.rendererProbeExpression
            )
            print("Scoped renderer probe after primary-picker open:")
            print(result?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func probePrototypeInteraction() async throws {
        let session = try await openInspector()
        do {
            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.clickPrototypeButtonExpression
            )
            print("Prototype click result:")
            print(result?.prettyPrinted() ?? "null")
            try await Task.sleep(for: .milliseconds(250))

            let probeResult = try await session.evaluate(
                expression: InjectionExpressionBuilder.rendererProbeExpression
            )
            print("Scoped renderer probe after prototype click:")
            print(probeResult?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func openInspector() async throws -> InspectorSession {
        let installation = try CodexInstallation.inspect()
        guard installation.fuseReport.nodeCLIInspectionEnabled else {
            throw CLIError.nodeInspectorDisabled
        }
        guard let process = CodexProcessDiscovery.runningProcess(
            bundleIdentifier: installation.bundleIdentifier
        ) else {
            throw CLIError.codexNotRunning
        }

        if let executableURL = process.executableURL,
           executableURL.standardizedFileURL != installation.executableURL.standardizedFileURL {
            throw CLIError.unexpectedExecutable(
                expected: installation.executableURL,
                actual: executableURL
            )
        }

        let discovery = InspectorEndpointDiscovery()
        if let targets = try? await discovery.fetchTargets(), !targets.isEmpty {
            throw InspectorError.inspectorPortAlreadyInUse
        }

        print("Enabling the loopback Inspector for Codex process \(process.processIdentifier)...")
        try process.enableInspectorWithUserSignal()
        let target = try await discovery.waitForTarget()
        guard let webSocketURL = target.webSocketDebuggerURL else {
            throw CLIError.inspectorTargetMissingWebSocket
        }

        let session = InspectorSession(url: webSocketURL)
        await session.connect()
        return session
    }

    private static func shutdownInspector(_ session: InspectorSession) async {
        _ = try? await session.evaluate(
            expression: InjectionExpressionBuilder.scheduleInspectorShutdownExpression,
            awaitPromise: false
        )
        try? await Task.sleep(for: .milliseconds(250))
        await session.close()
    }

    private static func loadPayload() throws -> String {
        guard let url = Bundle.module.url(forResource: "model-rail", withExtension: "js") else {
            throw CLIError.payloadMissing
        }
        return try String(contentsOf: url, encoding: .utf8)
    }

    private static func printUsage() {
        print("""
        Usage: CodexModelRailInjector [status|dry-run|probe|probe-picker|probe-primary|probe-prototype|inject|remove|help]

          status   Inspect the installed Codex build without changing runtime state.
          dry-run  Alias for status; validates the bundled payload and expression.
          probe    Return selector metadata and labels only for model-picker controls.
          probe-picker  Open the picker shortcut, then run the scoped selector probe.
          probe-primary  Open the first-level model/reasoning popover, then probe it.
          probe-prototype  Click the temporary Terra button and verify local-only feedback.
          inject   Explicitly enable a temporary loopback Inspector and inject Model Rail.
          remove   Remove Model Rail and disable its current-process reinjection hook.
          help     Show this help.
        """)
    }
}

private enum CLIError: LocalizedError {
    case unknownCommand(String)
    case nodeInspectorDisabled
    case codexNotRunning
    case unexpectedExecutable(expected: URL, actual: URL)
    case inspectorTargetMissingWebSocket
    case payloadMissing

    var errorDescription: String? {
        switch self {
        case let .unknownCommand(command):
            "Unknown command '\(command)'. Run with 'help' for usage."
        case .nodeInspectorDisabled:
            "This Codex build disables Electron Node CLI Inspector arguments."
        case .codexNotRunning:
            "Codex is not running. Start the official application before using 'inject'."
        case let .unexpectedExecutable(expected, actual):
            "Running Codex executable does not match the inspected application. Expected \(expected.path), found \(actual.path)."
        case .inspectorTargetMissingWebSocket:
            "Inspector target did not publish a WebSocket debugger URL."
        case .payloadMissing:
            "Bundled model-rail.js resource is missing."
        }
    }
}
