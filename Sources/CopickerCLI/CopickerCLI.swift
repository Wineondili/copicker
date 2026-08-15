import CopickerCore
import Darwin
import Foundation

@main
@MainActor
struct CopickerCLI {
    static func main() async {
        do {
            let arguments = Array(CommandLine.arguments.dropFirst())
            let command = arguments.first ?? "status"

            switch command {
            case "status", "dry-run":
                try printStatus()
            case "version", "--version":
                print("Copicker \(ProjectInfo.version)")
            case "probe":
                try await probe()
            case "probe-picker":
                try await probePicker()
            case "probe-primary":
                try await probePrimaryPicker()
            case "probe-selector", "probe-prototype":
                try await probeSelectorInteraction()
            case "inject":
                try await inject()
            case "remove":
                try await remove()
            case "autostart":
                try await handleAutostart(Array(arguments.dropFirst()))
            case "watch":
                try await watch()
            case "help", "--help", "-h":
                printUsage()
            default:
                throw CLIError.unknownCommand(command)
            }
        } catch {
            fputs("Copicker error: \(error.localizedDescription)\n", stderr)
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

        print("Copicker \(ProjectInfo.version)")
        print("App: \(installation.appURL.path)")
        print("Codex version: \(installation.shortVersion) (\(installation.buildVersion))")
        print("Bundle identifier: \(installation.bundleIdentifier)")
        print("Electron fuse wire: \(installation.fuseReport.rawWire)")
        print("Node CLI Inspector: \(installation.fuseReport.nodeCLIInspectionEnabled ? "enabled" : "disabled")")
        print("ASAR integrity enforcement: \(installation.fuseReport.embeddedASARIntegrityEnabled ? "enabled" : "disabled")")
        print("Copicker payload: \(payload.utf8.count) bytes")
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
        let execution = try await performInjection(payload: payload)
        print("Injection result:")
        print(execution.result?.prettyPrinted() ?? "null")
        print("Inspector shutdown scheduled; the official application bundle was not modified.")
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
            print("Copicker removed for the current Codex process; the official bundle was not modified.")
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

    private static func probeSelectorInteraction() async throws {
        let session = try await openInspector()
        do {
            let result = try await session.evaluate(
                expression: InjectionExpressionBuilder.clickSelectorCellExpression
            )
            print("Selector settings round-trip result:")
            print(result?.prettyPrinted() ?? "null")
            try await Task.sleep(for: .milliseconds(250))

            let probeResult = try await session.evaluate(
                expression: InjectionExpressionBuilder.rendererProbeExpression
            )
            print("Scoped renderer probe after settings restoration:")
            print(probeResult?.prettyPrinted() ?? "null")
            await shutdownInspector(session)
        } catch {
            await shutdownInspector(session)
            throw error
        }
    }

    private static func handleAutostart(_ arguments: [String]) async throws {
        guard let action = arguments.first else {
            throw CLIError.missingAutostartAction
        }

        let manager = CopickerAutostartManager()
        switch action {
        case "enable":
            guard arguments.count == 1 else {
                throw CLIError.unexpectedAutostartArguments(arguments)
            }
            guard let executableURL = Bundle.main.executableURL else {
                throw CopickerAutostartCommandError.executableURLUnavailable
            }
            try manager.enable(
                sourceExecutableURL: executableURL.standardizedFileURL.resolvingSymlinksInPath(),
                sourceResourceBundleURL: Bundle.module.bundleURL
            )
            print("Copicker autostart enabled.")
            print("LaunchAgent: \(manager.paths.launchAgentPlistURL.path)")
            print("Installed executable: \(manager.paths.installedExecutableURL.path)")
            print("The watcher will inject into the current or next Codex process after guarded preflight checks.")
        case "disable":
            let options = Array(arguments.dropFirst())
            guard options.isEmpty || options == ["--remove"] else {
                throw CLIError.unexpectedAutostartArguments(arguments)
            }
            try manager.disable()
            print("Copicker autostart disabled. No future Codex process will be injected automatically.")
            if options == ["--remove"] {
                if CodexProcessDiscovery.runningProcess() == nil {
                    print("Codex is not running; there is no current-process injection to remove.")
                } else {
                    try await remove()
                }
            } else {
                print("The current Codex process is unchanged; run 'copicker remove' to remove its active hook.")
            }
        case "status":
            guard arguments.count == 1 else {
                throw CLIError.unexpectedAutostartArguments(arguments)
            }
            printAutostartStatus(manager.status(), paths: manager.paths)
        default:
            throw CLIError.unknownAutostartAction(action)
        }
    }

    private static func printAutostartStatus(
        _ report: CopickerAutostartStatusReport,
        paths: CopickerAutostartPaths
    ) {
        print("Copicker autostart")
        print("LaunchAgent plist: \(report.launchAgentPlistInstalled ? "installed" : "not installed")")
        print("LaunchAgent service: \(report.serviceLoaded ? "loaded" : "not loaded")")
        print("Installed executable: \(report.installedExecutablePresent ? "present" : "missing")")
        print("Installed resource bundle: \(report.installedResourceBundlePresent ? "present" : "missing")")
        print("LaunchAgent path: \(paths.launchAgentPlistURL.path)")

        if let state = report.state {
            let formatter = ISO8601DateFormatter()
            print("Last watcher phase: \(state.phase.rawValue)")
            print("Last result: \(state.resultCode.rawValue)")
            print("Last update: \(formatter.string(from: state.updatedAt))")
            print("Watcher process: \(state.watcherProcessIdentifier.map(String.init) ?? "none")")
            print("Last Codex process: \(state.codexProcessIdentifier.map(String.init) ?? "none")")
            if let version = state.codexVersion, let build = state.codexBuildVersion {
                print("Last Codex version: \(version) (\(build))")
            }
            print("Watcher Copicker version: \(state.copickerVersion)")
        } else {
            print("Last watcher state: unavailable")
        }

        if let process = CodexProcessDiscovery.runningProcess() {
            print("Current Codex process: \(process.processIdentifier)")
        } else {
            print("Current Codex process: not running")
        }
        print("No signal was sent and no Inspector connection was opened.")
    }

    private static func watch() async throws {
        let paths = CopickerAutostartPaths()
        let stateStore = CopickerAutostartStateStore(fileURL: paths.stateFileURL)
        let watcherProcessIdentifier = getpid()

        writeAutostartState(
            CopickerAutostartState(
                phase: .starting,
                resultCode: .watcherStarted,
                watcherProcessIdentifier: watcherProcessIdentifier
            ),
            to: stateStore
        )
        watcherLog("Copicker watcher started with process \(watcherProcessIdentifier).")

        let payload: String
        do {
            payload = try loadPayload()
        } catch {
            writeAutostartState(
                CopickerAutostartState(
                    phase: .failed,
                    resultCode: .injectionFailed,
                    watcherProcessIdentifier: watcherProcessIdentifier
                ),
                to: stateStore
            )
            throw error
        }

        var handledProcessIdentifier: pid_t?
        var reportedWaiting = false

        while !Task.isCancelled {
            if let process = CodexProcessDiscovery.runningProcess() {
                reportedWaiting = false
                if handledProcessIdentifier != process.processIdentifier {
                    handledProcessIdentifier = process.processIdentifier
                    await injectForAutostart(
                        processIdentifier: process.processIdentifier,
                        payload: payload,
                        stateStore: stateStore,
                        watcherProcessIdentifier: watcherProcessIdentifier
                    )
                }
            } else {
                handledProcessIdentifier = nil
                if !reportedWaiting {
                    reportedWaiting = true
                    writeAutostartState(
                        CopickerAutostartState(
                            phase: .waitingForCodex,
                            resultCode: .codexNotRunning,
                            watcherProcessIdentifier: watcherProcessIdentifier
                        ),
                        to: stateStore
                    )
                    watcherLog("Copicker watcher is waiting for Codex.")
                }
            }

            try await Task.sleep(for: .seconds(1))
        }
    }

    private static func injectForAutostart(
        processIdentifier: pid_t,
        payload: String,
        stateStore: CopickerAutostartStateStore,
        watcherProcessIdentifier: pid_t
    ) async {
        let delays = CopickerAutostart.retryDelaySeconds

        for (attempt, delay) in delays.enumerated() {
            if delay > 0 {
                try? await Task.sleep(for: .milliseconds(Int64(delay * 1_000)))
            }

            guard CodexProcessDiscovery.runningProcess()?.processIdentifier == processIdentifier else {
                writeAutostartState(
                    CopickerAutostartState(
                        phase: .waitingForCodex,
                        resultCode: .processChanged,
                        watcherProcessIdentifier: watcherProcessIdentifier,
                        codexProcessIdentifier: processIdentifier
                    ),
                    to: stateStore
                )
                return
            }

            let installation = try? CodexInstallation.inspect()
            writeAutostartState(
                CopickerAutostartState(
                    phase: .injecting,
                    resultCode: .injectionStarted,
                    watcherProcessIdentifier: watcherProcessIdentifier,
                    codexProcessIdentifier: processIdentifier,
                    codexVersion: installation?.shortVersion,
                    codexBuildVersion: installation?.buildVersion
                ),
                to: stateStore
            )

            do {
                let execution = try await performInjection(
                    payload: payload,
                    expectedProcessIdentifier: processIdentifier,
                    quiet: true,
                    targetTimeout: .seconds(10)
                )
                writeAutostartState(
                    CopickerAutostartState(
                        phase: .injected,
                        resultCode: .injectionSucceeded,
                        watcherProcessIdentifier: watcherProcessIdentifier,
                        codexProcessIdentifier: processIdentifier,
                        codexVersion: execution.installation.shortVersion,
                        codexBuildVersion: execution.installation.buildVersion
                    ),
                    to: stateStore
                )
                watcherLog("Copicker injection succeeded for Codex process \(processIdentifier).")
                return
            } catch {
                let failure = classifyAutostartFailure(error)
                let hasAnotherAttempt = attempt < delays.count - 1
                if failure.retryable && hasAnotherAttempt {
                    continue
                }

                writeAutostartState(
                    CopickerAutostartState(
                        phase: failure.phase,
                        resultCode: failure.resultCode,
                        watcherProcessIdentifier: watcherProcessIdentifier,
                        codexProcessIdentifier: processIdentifier,
                        codexVersion: installation?.shortVersion,
                        codexBuildVersion: installation?.buildVersion
                    ),
                    to: stateStore
                )
                watcherLog(
                    "Copicker injection stopped for Codex process \(processIdentifier): \(failure.resultCode.rawValue).",
                    isError: true
                )
                return
            }
        }
    }

    private static func classifyAutostartFailure(
        _ error: Error
    ) -> AutostartFailureClassification {
        if let cliError = error as? CLIError {
            switch cliError {
            case .codexNotRunning:
                return .init(phase: .failed, resultCode: .codexNotRunning, retryable: true)
            case .codexProcessChanged:
                return .init(phase: .failed, resultCode: .processChanged, retryable: true)
            case .nodeInspectorDisabled, .unexpectedExecutable:
                return .init(
                    phase: .blocked,
                    resultCode: .incompatibleInstallation,
                    retryable: false
                )
            case .inspectorTargetMissingWebSocket:
                return .init(phase: .blocked, resultCode: .inspectorTimeout, retryable: false)
            default:
                return .init(phase: .failed, resultCode: .injectionFailed, retryable: false)
            }
        }

        if let inspectorError = error as? InspectorError {
            switch inspectorError {
            case .inspectorPortAlreadyInUse:
                return .init(phase: .blocked, resultCode: .inspectorBusy, retryable: false)
            case .targetTimeout:
                return .init(phase: .blocked, resultCode: .inspectorTimeout, retryable: false)
            default:
                return .init(phase: .failed, resultCode: .injectionFailed, retryable: false)
            }
        }

        if error is CodexInstallationError {
            return .init(
                phase: .blocked,
                resultCode: .incompatibleInstallation,
                retryable: false
            )
        }
        if error is CodexProcessError {
            return .init(phase: .failed, resultCode: .signalFailed, retryable: true)
        }
        return .init(phase: .failed, resultCode: .injectionFailed, retryable: false)
    }

    private static func writeAutostartState(
        _ state: CopickerAutostartState,
        to store: CopickerAutostartStateStore
    ) {
        do {
            try store.write(state)
        } catch {
            watcherLog("Copicker could not update its privacy-safe watcher state.", isError: true)
        }
    }

    private static func watcherLog(_ message: String, isError: Bool = false) {
        let stream = isError ? stderr : stdout
        fputs("\(message)\n", stream)
        fflush(stream)
    }

    private static func performInjection(
        payload: String,
        expectedProcessIdentifier: pid_t? = nil,
        quiet: Bool = false,
        targetTimeout: Duration = .seconds(5)
    ) async throws -> InjectionExecution {
        let expression = try InjectionExpressionBuilder.makeInstallerExpression(payload: payload)
        let context = try await openInspectorContext(
            expectedProcessIdentifier: expectedProcessIdentifier,
            quiet: quiet,
            targetTimeout: targetTimeout
        )
        do {
            let result = try await context.session.evaluate(expression: expression)
            guard case .bool(true)? = result?["installed"] else {
                throw CLIError.injectionNotConfirmed
            }
            await shutdownInspector(context.session)
            return InjectionExecution(
                result: result,
                installation: context.installation,
                process: context.process
            )
        } catch {
            await shutdownInspector(context.session)
            throw error
        }
    }

    private static func openInspector() async throws -> InspectorSession {
        try await openInspectorContext().session
    }

    private static func openInspectorContext(
        expectedProcessIdentifier: pid_t? = nil,
        quiet: Bool = false,
        targetTimeout: Duration = .seconds(5)
    ) async throws -> InspectorContext {
        let installation = try CodexInstallation.inspect()
        guard installation.fuseReport.nodeCLIInspectionEnabled else {
            throw CLIError.nodeInspectorDisabled
        }
        guard let process = CodexProcessDiscovery.runningProcess(
            bundleIdentifier: installation.bundleIdentifier
        ) else {
            throw CLIError.codexNotRunning
        }

        if let expectedProcessIdentifier,
           process.processIdentifier != expectedProcessIdentifier {
            throw CLIError.codexProcessChanged(
                expected: expectedProcessIdentifier,
                actual: process.processIdentifier
            )
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

        if !quiet {
            print("Enabling the loopback Inspector for Codex process \(process.processIdentifier)...")
        }
        try process.enableInspectorWithUserSignal()
        let target = try await discovery.waitForTarget(timeout: targetTimeout)
        guard let webSocketURL = target.webSocketDebuggerURL else {
            throw CLIError.inspectorTargetMissingWebSocket
        }

        let session = InspectorSession(url: webSocketURL)
        await session.connect()
        return InspectorContext(
            session: session,
            installation: installation,
            process: process
        )
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
        Usage: copicker [status|version|probe|probe-picker|probe-primary|probe-selector|inject|remove|autostart|help]

          status   Inspect the installed Codex build without changing runtime state.
          dry-run  Alias for status; validates the bundled payload and expression.
          version  Print the Copicker version.
          probe    Return selector metadata and labels only for model-picker controls.
          probe-picker  Open the picker shortcut, then run the scoped selector probe.
          probe-primary  Open the first-level model/reasoning popover, then probe it.
          probe-selector  Directly switch to a supported test selection, confirm it, and restore the original settings.
          inject   Explicitly enable a temporary loopback Inspector and inject Copicker.
          remove   Remove Copicker and disable its current-process reinjection hook.
          autostart enable            Install and load the opt-in user LaunchAgent.
          autostart disable           Stop future automatic injection.
          autostart disable --remove  Disable autostart and remove the current hook if Codex is running.
          autostart status            Inspect LaunchAgent and watcher state without opening Inspector.
          help     Show this help.
        """)
    }

    private struct InspectorContext {
        let session: InspectorSession
        let installation: CodexInstallation
        let process: RunningCodexProcess
    }

    private struct InjectionExecution {
        let result: JSONValue?
        let installation: CodexInstallation
        let process: RunningCodexProcess
    }

    private struct AutostartFailureClassification {
        let phase: CopickerAutostartPhase
        let resultCode: CopickerAutostartResultCode
        let retryable: Bool
    }
}

private enum CLIError: LocalizedError {
    case unknownCommand(String)
    case missingAutostartAction
    case unknownAutostartAction(String)
    case unexpectedAutostartArguments([String])
    case nodeInspectorDisabled
    case codexNotRunning
    case codexProcessChanged(expected: pid_t, actual: pid_t)
    case unexpectedExecutable(expected: URL, actual: URL)
    case inspectorTargetMissingWebSocket
    case injectionNotConfirmed
    case payloadMissing

    var errorDescription: String? {
        switch self {
        case let .unknownCommand(command):
            "Unknown command '\(command)'. Run with 'help' for usage."
        case .missingAutostartAction:
            "Missing autostart action. Use 'autostart enable', 'autostart disable', or 'autostart status'."
        case let .unknownAutostartAction(action):
            "Unknown autostart action '\(action)'. Use 'enable', 'disable', or 'status'."
        case let .unexpectedAutostartArguments(arguments):
            "Unexpected autostart arguments: \(arguments.joined(separator: " "))."
        case .nodeInspectorDisabled:
            "This Codex build disables Electron Node CLI Inspector arguments."
        case .codexNotRunning:
            "Codex is not running. Start the official application before using 'inject'."
        case let .codexProcessChanged(expected, actual):
            "Codex process changed while preparing injection. Expected \(expected), found \(actual)."
        case let .unexpectedExecutable(expected, actual):
            "Running Codex executable does not match the inspected application. Expected \(expected.path), found \(actual.path)."
        case .inspectorTargetMissingWebSocket:
            "Inspector target did not publish a WebSocket debugger URL."
        case .injectionNotConfirmed:
            "Copicker injection did not return an installed confirmation."
        case .payloadMissing:
            "Bundled model-rail.js resource is missing."
        }
    }
}
