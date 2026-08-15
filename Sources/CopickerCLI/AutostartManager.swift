import CopickerCore
import Darwin
import Foundation

struct CopickerAutostartStatusReport {
    let launchAgentPlistInstalled: Bool
    let installedExecutablePresent: Bool
    let installedResourceBundlePresent: Bool
    let serviceLoaded: Bool
    let state: CopickerAutostartState?
}

@MainActor
struct CopickerAutostartManager {
    let paths: CopickerAutostartPaths

    private let installer: CopickerAutostartInstaller
    private let launchctl: LaunchctlClient

    init(paths: CopickerAutostartPaths = CopickerAutostartPaths()) {
        self.paths = paths
        self.installer = CopickerAutostartInstaller(paths: paths)
        self.launchctl = LaunchctlClient()
    }

    func enable(
        sourceExecutableURL: URL,
        sourceResourceBundleURL: URL
    ) throws {
        try requireNonRootUser()
        try installer.install(
            sourceExecutableURL: sourceExecutableURL,
            sourceResourceBundleURL: sourceResourceBundleURL
        )

        _ = try launchctl.run(["bootout", launchctl.serviceTarget])
        do {
            try launchctl.requireSuccess(
                ["enable", launchctl.serviceTarget],
                action: "enable the Copicker LaunchAgent"
            )
            try launchctl.requireSuccess(
                ["bootstrap", launchctl.domainTarget, paths.launchAgentPlistURL.path],
                action: "load the Copicker LaunchAgent"
            )
        } catch {
            _ = try? launchctl.run(["bootout", launchctl.serviceTarget])
            _ = try? launchctl.run(["disable", launchctl.serviceTarget])
            try? installer.removeLaunchAgentPlist()
            throw error
        }
    }

    func disable() throws {
        try requireNonRootUser()
        defer { try? installer.removeLaunchAgentPlist() }
        _ = try launchctl.run(["bootout", launchctl.serviceTarget])
        try launchctl.requireSuccess(
            ["disable", launchctl.serviceTarget],
            action: "disable the Copicker LaunchAgent"
        )
        try CopickerAutostartStateStore(fileURL: paths.stateFileURL).write(
            CopickerAutostartState(
                phase: .disabled,
                resultCode: .disabled
            )
        )
    }

    func status() -> CopickerAutostartStatusReport {
        let fileManager = FileManager.default
        let serviceLoaded = (try? launchctl.run(["print", launchctl.serviceTarget]))?
            .succeeded == true
        let state = try? CopickerAutostartStateStore(fileURL: paths.stateFileURL).read()

        return CopickerAutostartStatusReport(
            launchAgentPlistInstalled: fileManager.fileExists(
                atPath: paths.launchAgentPlistURL.path
            ),
            installedExecutablePresent: fileManager.isExecutableFile(
                atPath: paths.installedExecutableURL.path
            ),
            installedResourceBundlePresent: fileManager.fileExists(
                atPath: paths.installedResourceBundleURL.path
            ),
            serviceLoaded: serviceLoaded,
            state: state
        )
    }

    private func requireNonRootUser() throws {
        guard getuid() != 0 else {
            throw CopickerAutostartCommandError.rootUserUnsupported
        }
    }
}

private struct LaunchctlResult {
    let exitStatus: Int32
    let output: String

    var succeeded: Bool { exitStatus == 0 }
}

private struct LaunchctlClient {
    let domainTarget: String
    let serviceTarget: String

    init(userIdentifier: uid_t = getuid()) {
        self.domainTarget = "gui/\(userIdentifier)"
        self.serviceTarget = "gui/\(userIdentifier)/\(CopickerAutostart.launchAgentLabel)"
    }

    func run(_ arguments: [String]) throws -> LaunchctlResult {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        process.arguments = arguments

        let combinedOutput = Pipe()
        process.standardOutput = combinedOutput
        process.standardError = combinedOutput

        try process.run()
        let data = combinedOutput.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()

        return LaunchctlResult(
            exitStatus: process.terminationStatus,
            output: String(data: data, encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        )
    }

    func requireSuccess(_ arguments: [String], action: String) throws {
        let result = try run(arguments)
        guard result.succeeded else {
            throw CopickerAutostartCommandError.launchctlFailed(
                action: action,
                exitStatus: result.exitStatus,
                output: result.output
            )
        }
    }
}

enum CopickerAutostartCommandError: LocalizedError {
    case rootUserUnsupported
    case launchctlFailed(action: String, exitStatus: Int32, output: String)
    case executableURLUnavailable

    var errorDescription: String? {
        switch self {
        case .rootUserUnsupported:
            "Copicker autostart must be managed by the logged-in user, not root."
        case let .launchctlFailed(action, exitStatus, output):
            "Failed to \(action) (launchctl exit \(exitStatus)): \(output.isEmpty ? "no diagnostic output" : output)"
        case .executableURLUnavailable:
            "The running Copicker executable path could not be resolved."
        }
    }
}
