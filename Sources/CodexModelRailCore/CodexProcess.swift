import AppKit
import Darwin
import Foundation

public struct RunningCodexProcess: Sendable {
    public let processIdentifier: pid_t
    public let bundleIdentifier: String
    public let executableURL: URL?

    public func enableInspectorWithUserSignal() throws {
        guard kill(processIdentifier, SIGUSR1) == 0 else {
            throw CodexProcessError.signalFailed(
                processIdentifier: processIdentifier,
                errnoValue: errno
            )
        }
    }
}

@MainActor
public enum CodexProcessDiscovery {
    public static func runningProcess(
        bundleIdentifier: String = "com.openai.codex"
    ) -> RunningCodexProcess? {
        NSRunningApplication
            .runningApplications(withBundleIdentifier: bundleIdentifier)
            .first(where: { !$0.isTerminated })
            .map {
                RunningCodexProcess(
                    processIdentifier: $0.processIdentifier,
                    bundleIdentifier: $0.bundleIdentifier ?? bundleIdentifier,
                    executableURL: $0.executableURL
                )
            }
    }
}

public enum CodexProcessError: LocalizedError {
    case signalFailed(processIdentifier: pid_t, errnoValue: Int32)

    public var errorDescription: String? {
        switch self {
        case let .signalFailed(processIdentifier, errnoValue):
            "Failed to send SIGUSR1 to Codex process \(processIdentifier): \(String(cString: strerror(errnoValue)))."
        }
    }
}

