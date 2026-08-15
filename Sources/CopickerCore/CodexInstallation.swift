import Foundation

public struct CodexInstallation: Sendable {
    public static let defaultAppURL = URL(fileURLWithPath: "/Applications/ChatGPT.app")

    public let appURL: URL
    public let bundleIdentifier: String
    public let shortVersion: String
    public let buildVersion: String
    public let executableURL: URL
    public let frameworkURL: URL
    public let fuseReport: ElectronFuseReport

    public static func inspect(appURL: URL = defaultAppURL) throws -> CodexInstallation {
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: appURL.path) else {
            throw CodexInstallationError.appNotFound(appURL)
        }

        let infoURL = appURL.appendingPathComponent("Contents/Info.plist")
        let infoData = try Data(contentsOf: infoURL)
        guard let info = try PropertyListSerialization.propertyList(
            from: infoData,
            options: [],
            format: nil
        ) as? [String: Any] else {
            throw CodexInstallationError.invalidInfoPlist(infoURL)
        }

        let bundleIdentifier = info["CFBundleIdentifier"] as? String ?? "unknown"
        let shortVersion = info["CFBundleShortVersionString"] as? String ?? "unknown"
        let buildVersion = info["CFBundleVersion"] as? String ?? "unknown"
        let executableName = info["CFBundleExecutable"] as? String ?? "ChatGPT"
        let executableURL = appURL
            .appendingPathComponent("Contents/MacOS")
            .appendingPathComponent(executableName)

        let frameworkURL = try locateFramework(in: appURL)
        let fuseReport = try ElectronFuseParser.parse(fileURL: frameworkURL)

        return CodexInstallation(
            appURL: appURL,
            bundleIdentifier: bundleIdentifier,
            shortVersion: shortVersion,
            buildVersion: buildVersion,
            executableURL: executableURL,
            frameworkURL: frameworkURL,
            fuseReport: fuseReport
        )
    }

    private static func locateFramework(in appURL: URL) throws -> URL {
        let frameworkRoot = appURL.appendingPathComponent(
            "Contents/Frameworks/Codex Framework.framework/Versions"
        )
        let current = frameworkRoot
            .appendingPathComponent("Current")
            .appendingPathComponent("Codex Framework")
            .resolvingSymlinksInPath()

        if FileManager.default.fileExists(atPath: current.path) {
            return current
        }

        let versions = try FileManager.default.contentsOfDirectory(
            at: frameworkRoot,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        )

        for version in versions.sorted(by: { $0.lastPathComponent > $1.lastPathComponent }) {
            let candidate = version.appendingPathComponent("Codex Framework")
            if FileManager.default.fileExists(atPath: candidate.path) {
                return candidate
            }
        }

        throw CodexInstallationError.frameworkNotFound(frameworkRoot)
    }
}

public enum CodexInstallationError: LocalizedError {
    case appNotFound(URL)
    case invalidInfoPlist(URL)
    case frameworkNotFound(URL)

    public var errorDescription: String? {
        switch self {
        case let .appNotFound(url):
            "Codex application was not found at \(url.path)."
        case let .invalidInfoPlist(url):
            "Codex Info.plist could not be decoded at \(url.path)."
        case let .frameworkNotFound(url):
            "Codex Electron framework was not found below \(url.path)."
        }
    }
}

