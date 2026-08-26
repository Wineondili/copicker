import Foundation

public enum CopickerModel: String, Codable, CaseIterable, Sendable {
    case sol
    case terra
    case luna
    case gpt55 = "gpt-5.5"
    case daybreakBlue = "daybreak-blue"
    case codexSpark = "gpt-5.3-codex-spark"

    public var displayName: String {
        switch self {
        case .sol: "GPT-5.6 Sol"
        case .terra: "GPT-5.6 Terra"
        case .luna: "GPT-5.6 Luna"
        case .gpt55: "GPT-5.5"
        case .daybreakBlue: "Daybreak Blue"
        case .codexSpark: "GPT-5.3 Codex Spark"
        }
    }

    public var effortLabels: [String] {
        switch self {
        case .gpt55, .codexSpark:
            ["Light", "Medium", "High", "Extra High"]
        case .luna:
            ["Light", "Medium", "High", "Extra High", "Max"]
        case .sol, .terra, .daybreakBlue:
            ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]
        }
    }
}

public enum CopickerPlacement: String, Codable, CaseIterable, Sendable {
    case top
    case left
    case right
}

public enum CopickerAppearance: String, Codable, CaseIterable, Sendable {
    case codex
    case system
    case light
    case dark
}

public struct CopickerSettings: Codable, Equatable, Sendable {
    public static let currentSchemaVersion = 1
    public static let defaults = CopickerSettings(
        schemaVersion: currentSchemaVersion,
        revision: 0,
        enabled: true,
        visibleModels: [.sol, .terra, .luna],
        preferredPlacement: .top,
        appearance: .dark
    )

    public let schemaVersion: Int
    public let revision: Int
    public let enabled: Bool
    public let visibleModels: [CopickerModel]
    public let preferredPlacement: CopickerPlacement
    public let appearance: CopickerAppearance

    public init(
        schemaVersion: Int = currentSchemaVersion,
        revision: Int,
        enabled: Bool,
        visibleModels: [CopickerModel],
        preferredPlacement: CopickerPlacement,
        appearance: CopickerAppearance
    ) {
        self.schemaVersion = schemaVersion
        self.revision = revision
        self.enabled = enabled
        self.visibleModels = visibleModels
        self.preferredPlacement = preferredPlacement
        self.appearance = appearance
    }

    public func hasSamePreferences(as other: CopickerSettings) -> Bool {
        enabled == other.enabled &&
            visibleModels == other.visibleModels &&
            preferredPlacement == other.preferredPlacement &&
            appearance == other.appearance
    }

    func validated(revision: Int? = nil) throws -> CopickerSettings {
        guard schemaVersion == Self.currentSchemaVersion else {
            throw CopickerSettingsError.unsupportedSchemaVersion(schemaVersion)
        }
        guard self.revision >= 0 else {
            throw CopickerSettingsError.invalidRevision(self.revision)
        }

        let requestedModels = Set(visibleModels)
        let normalizedModels = CopickerModel.allCases.filter(requestedModels.contains)
        guard !normalizedModels.isEmpty else {
            throw CopickerSettingsError.noVisibleModels
        }

        return CopickerSettings(
            revision: revision ?? self.revision,
            enabled: enabled,
            visibleModels: normalizedModels,
            preferredPlacement: preferredPlacement,
            appearance: appearance
        )
    }
}

public struct CopickerSettingsStore: Sendable {
    public let fileURL: URL

    public init(fileURL: URL) {
        self.fileURL = fileURL
    }

    public func read() throws -> CopickerSettings {
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return .defaults
        }
        let settings = try JSONDecoder().decode(
            CopickerSettings.self,
            from: Data(contentsOf: fileURL)
        )
        return try settings.validated()
    }

    public func save(
        _ requestedSettings: CopickerSettings,
        expectedRevision: Int
    ) throws -> CopickerSettings {
        let currentSettings = try read()
        let normalizedRequest = try requestedSettings.validated(
            revision: currentSettings.revision + 1
        )

        if currentSettings.hasSamePreferences(as: normalizedRequest) {
            return currentSettings
        }
        guard expectedRevision == currentSettings.revision else {
            throw CopickerSettingsError.revisionConflict(current: currentSettings)
        }

        let fileManager = FileManager.default
        try fileManager.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        try encoder.encode(normalizedRequest).write(to: fileURL, options: .atomic)
        try fileManager.setAttributes([.posixPermissions: 0o600], ofItemAtPath: fileURL.path)
        return normalizedRequest
    }
}

public enum CopickerSettingsError: LocalizedError, Equatable, Sendable {
    case unsupportedSchemaVersion(Int)
    case invalidRevision(Int)
    case noVisibleModels
    case revisionConflict(current: CopickerSettings)

    public var errorDescription: String? {
        switch self {
        case let .unsupportedSchemaVersion(version):
            "Unsupported CoPicker settings schema version \(version)."
        case let .invalidRevision(revision):
            "Invalid CoPicker settings revision \(revision)."
        case .noVisibleModels:
            "At least one supported model must remain visible."
        case .revisionConflict:
            "CoPicker settings changed in another window."
        }
    }
}
