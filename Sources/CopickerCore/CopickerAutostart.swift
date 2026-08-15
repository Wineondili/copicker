import Foundation

public enum CopickerAutostart {
    public static let launchAgentLabel = "io.github.wineondili.copicker"
    public static let resourceBundleName = "Copicker_CopickerCLI.bundle"
    public static let retryDelaySeconds: [TimeInterval] = [0.5, 1, 2, 4, 8]
}

public struct CopickerAutostartPaths: Equatable, Sendable {
    public let applicationSupportDirectory: URL
    public let binDirectory: URL
    public let installedExecutableURL: URL
    public let installedResourceBundleURL: URL
    public let stateFileURL: URL
    public let logsDirectory: URL
    public let standardOutputLogURL: URL
    public let standardErrorLogURL: URL
    public let launchAgentsDirectory: URL
    public let launchAgentPlistURL: URL

    public init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
        let libraryDirectory = homeDirectory.appendingPathComponent("Library", isDirectory: true)
        let applicationSupportDirectory = libraryDirectory
            .appendingPathComponent("Application Support", isDirectory: true)
            .appendingPathComponent("Copicker", isDirectory: true)
        let binDirectory = applicationSupportDirectory.appendingPathComponent("bin", isDirectory: true)
        let logsDirectory = libraryDirectory
            .appendingPathComponent("Logs", isDirectory: true)
            .appendingPathComponent("Copicker", isDirectory: true)
        let launchAgentsDirectory = libraryDirectory
            .appendingPathComponent("LaunchAgents", isDirectory: true)

        self.applicationSupportDirectory = applicationSupportDirectory
        self.binDirectory = binDirectory
        self.installedExecutableURL = binDirectory.appendingPathComponent("copicker")
        self.installedResourceBundleURL = binDirectory.appendingPathComponent(
            CopickerAutostart.resourceBundleName,
            isDirectory: true
        )
        self.stateFileURL = applicationSupportDirectory.appendingPathComponent("autostart-state.json")
        self.logsDirectory = logsDirectory
        self.standardOutputLogURL = logsDirectory.appendingPathComponent("autostart.log")
        self.standardErrorLogURL = logsDirectory.appendingPathComponent("autostart-error.log")
        self.launchAgentsDirectory = launchAgentsDirectory
        self.launchAgentPlistURL = launchAgentsDirectory.appendingPathComponent(
            "\(CopickerAutostart.launchAgentLabel).plist"
        )
    }
}

public enum CopickerAutostartPhase: String, Codable, Sendable {
    case disabled
    case starting
    case waitingForCodex = "waiting-for-codex"
    case injecting
    case injected
    case blocked
    case failed
}

public enum CopickerAutostartResultCode: String, Codable, Sendable {
    case disabled
    case watcherStarted = "watcher-started"
    case codexNotRunning = "codex-not-running"
    case injectionStarted = "injection-started"
    case injectionSucceeded = "injection-succeeded"
    case processChanged = "process-changed"
    case incompatibleInstallation = "incompatible-installation"
    case inspectorBusy = "inspector-busy"
    case inspectorTimeout = "inspector-timeout"
    case signalFailed = "signal-failed"
    case injectionFailed = "injection-failed"
}

public struct CopickerAutostartState: Codable, Equatable, Sendable {
    public let phase: CopickerAutostartPhase
    public let resultCode: CopickerAutostartResultCode
    public let updatedAt: Date
    public let watcherProcessIdentifier: Int32?
    public let codexProcessIdentifier: Int32?
    public let codexVersion: String?
    public let codexBuildVersion: String?
    public let copickerVersion: String

    public init(
        phase: CopickerAutostartPhase,
        resultCode: CopickerAutostartResultCode,
        updatedAt: Date = Date(),
        watcherProcessIdentifier: Int32? = nil,
        codexProcessIdentifier: Int32? = nil,
        codexVersion: String? = nil,
        codexBuildVersion: String? = nil,
        copickerVersion: String = ProjectInfo.version
    ) {
        self.phase = phase
        self.resultCode = resultCode
        self.updatedAt = updatedAt
        self.watcherProcessIdentifier = watcherProcessIdentifier
        self.codexProcessIdentifier = codexProcessIdentifier
        self.codexVersion = codexVersion
        self.codexBuildVersion = codexBuildVersion
        self.copickerVersion = copickerVersion
    }
}

public struct CopickerAutostartStateStore: Sendable {
    public let fileURL: URL

    public init(fileURL: URL) {
        self.fileURL = fileURL
    }

    public func read() throws -> CopickerAutostartState? {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(CopickerAutostartState.self, from: Data(contentsOf: fileURL))
    }

    public func write(_ state: CopickerAutostartState) throws {
        let fileManager = FileManager.default
        try fileManager.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        try encoder.encode(state).write(to: fileURL, options: .atomic)
        try fileManager.setAttributes([.posixPermissions: 0o600], ofItemAtPath: fileURL.path)
    }
}

public struct CopickerAutostartInstaller: Sendable {
    public let paths: CopickerAutostartPaths

    public init(paths: CopickerAutostartPaths = CopickerAutostartPaths()) {
        self.paths = paths
    }

    public func install(
        sourceExecutableURL: URL,
        sourceResourceBundleURL: URL
    ) throws {
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: sourceExecutableURL.path) else {
            throw CopickerAutostartError.sourceExecutableMissing(sourceExecutableURL)
        }
        guard fileManager.fileExists(atPath: sourceResourceBundleURL.path) else {
            throw CopickerAutostartError.sourceResourceBundleMissing(sourceResourceBundleURL)
        }

        try fileManager.createDirectory(at: paths.binDirectory, withIntermediateDirectories: true)
        try fileManager.createDirectory(at: paths.logsDirectory, withIntermediateDirectories: true)
        try fileManager.createDirectory(
            at: paths.launchAgentsDirectory,
            withIntermediateDirectories: true
        )

        try replaceItem(
            sourceURL: sourceExecutableURL,
            destinationURL: paths.installedExecutableURL
        )
        try fileManager.setAttributes(
            [.posixPermissions: 0o755],
            ofItemAtPath: paths.installedExecutableURL.path
        )
        try replaceItem(
            sourceURL: sourceResourceBundleURL,
            destinationURL: paths.installedResourceBundleURL
        )
        try CopickerLaunchAgentPlist.makeData(paths: paths).write(
            to: paths.launchAgentPlistURL,
            options: .atomic
        )
        try fileManager.setAttributes(
            [.posixPermissions: 0o644],
            ofItemAtPath: paths.launchAgentPlistURL.path
        )
    }

    public func removeLaunchAgentPlist() throws {
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: paths.launchAgentPlistURL.path) else { return }
        try fileManager.removeItem(at: paths.launchAgentPlistURL)
    }

    private func replaceItem(sourceURL: URL, destinationURL: URL) throws {
        let fileManager = FileManager.default
        let resolvedSource = sourceURL.standardizedFileURL.resolvingSymlinksInPath()
        let resolvedDestination = destinationURL.standardizedFileURL.resolvingSymlinksInPath()
        guard resolvedSource != resolvedDestination else { return }

        let temporaryURL = destinationURL
            .deletingLastPathComponent()
            .appendingPathComponent(".\(destinationURL.lastPathComponent).\(UUID().uuidString).tmp")
        defer { try? fileManager.removeItem(at: temporaryURL) }

        try fileManager.copyItem(at: sourceURL, to: temporaryURL)
        if fileManager.fileExists(atPath: destinationURL.path) {
            try fileManager.removeItem(at: destinationURL)
        }
        try fileManager.moveItem(at: temporaryURL, to: destinationURL)
    }
}

public enum CopickerLaunchAgentPlist {
    public static func makeData(paths: CopickerAutostartPaths) throws -> Data {
        let propertyList: [String: Any] = [
            "Label": CopickerAutostart.launchAgentLabel,
            "ProgramArguments": [paths.installedExecutableURL.path, "watch"],
            "RunAtLoad": true,
            "KeepAlive": true,
            "ProcessType": "Background",
            "ThrottleInterval": 10,
            "LimitLoadToSessionType": "Aqua",
            "StandardOutPath": paths.standardOutputLogURL.path,
            "StandardErrorPath": paths.standardErrorLogURL.path,
        ]
        return try PropertyListSerialization.data(
            fromPropertyList: propertyList,
            format: .xml,
            options: 0
        )
    }
}

public enum CopickerAutostartError: LocalizedError {
    case sourceExecutableMissing(URL)
    case sourceResourceBundleMissing(URL)

    public var errorDescription: String? {
        switch self {
        case let .sourceExecutableMissing(url):
            "Copicker executable was not found at \(url.path)."
        case let .sourceResourceBundleMissing(url):
            "Copicker resource bundle was not found at \(url.path)."
        }
    }
}
