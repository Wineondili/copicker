import Foundation
import Testing
@testable import CopickerCore

@Test func autostartPathsStayInsideTheUserLibrary() {
    let homeDirectory = URL(fileURLWithPath: "/Users/tester", isDirectory: true)
    let paths = CopickerAutostartPaths(homeDirectory: homeDirectory)

    #expect(paths.applicationSupportDirectory.path == "/Users/tester/Library/Application Support/Copicker")
    #expect(paths.installedExecutableURL.path == "/Users/tester/Library/Application Support/Copicker/bin/copicker")
    #expect(paths.installedResourceBundleURL.lastPathComponent == "Copicker_CopickerCLI.bundle")
    #expect(paths.stateFileURL.lastPathComponent == "autostart-state.json")
    #expect(paths.launchAgentPlistURL.path == "/Users/tester/Library/LaunchAgents/io.github.wineondili.copicker.plist")
    #expect(paths.standardOutputLogURL.path == "/Users/tester/Library/Logs/Copicker/autostart.log")
    #expect(paths.standardErrorLogURL.path == "/Users/tester/Library/Logs/Copicker/autostart-error.log")
}

@Test func launchAgentPlistRunsOnlyTheInstalledWatcher() throws {
    let paths = CopickerAutostartPaths(
        homeDirectory: URL(fileURLWithPath: "/Users/tester", isDirectory: true)
    )
    let data = try CopickerLaunchAgentPlist.makeData(paths: paths)
    let propertyList = try PropertyListSerialization.propertyList(
        from: data,
        options: [],
        format: nil
    ) as? [String: Any]

    #expect(propertyList?["Label"] as? String == "io.github.wineondili.copicker")
    #expect(
        propertyList?["ProgramArguments"] as? [String] == [
            "/Users/tester/Library/Application Support/Copicker/bin/copicker",
            "watch",
        ]
    )
    #expect(propertyList?["RunAtLoad"] as? Bool == true)
    #expect(propertyList?["KeepAlive"] as? Bool == true)
    #expect(propertyList?["ProcessType"] as? String == "Background")
    #expect(propertyList?["ThrottleInterval"] as? Int == 10)
    #expect(propertyList?["LimitLoadToSessionType"] as? String == "Aqua")
}

@Test func installerCopiesAndReplacesOnlyManagedArtifacts() throws {
    let fileManager = FileManager.default
    let root = fileManager.temporaryDirectory
        .appendingPathComponent("CopickerAutostartTests-\(UUID().uuidString)", isDirectory: true)
    let homeDirectory = root.appendingPathComponent("home", isDirectory: true)
    let sourceDirectory = root.appendingPathComponent("source", isDirectory: true)
    let sourceExecutableURL = sourceDirectory.appendingPathComponent("copicker")
    let sourceBundleURL = sourceDirectory.appendingPathComponent(
        CopickerAutostart.resourceBundleName,
        isDirectory: true
    )
    let sourcePayloadURL = sourceBundleURL.appendingPathComponent("model-rail.js")
    defer { try? fileManager.removeItem(at: root) }

    try fileManager.createDirectory(at: sourceBundleURL, withIntermediateDirectories: true)
    try Data("binary-v1".utf8).write(to: sourceExecutableURL)
    try Data("payload-v1".utf8).write(to: sourcePayloadURL)

    let paths = CopickerAutostartPaths(homeDirectory: homeDirectory)
    let installer = CopickerAutostartInstaller(paths: paths)
    try installer.install(
        sourceExecutableURL: sourceExecutableURL,
        sourceResourceBundleURL: sourceBundleURL
    )

    #expect(try String(contentsOf: paths.installedExecutableURL, encoding: .utf8) == "binary-v1")
    #expect(
        try String(
            contentsOf: paths.installedResourceBundleURL.appendingPathComponent("model-rail.js"),
            encoding: .utf8
        ) == "payload-v1"
    )
    #expect(fileManager.isExecutableFile(atPath: paths.installedExecutableURL.path))
    #expect(fileManager.fileExists(atPath: paths.launchAgentPlistURL.path))

    try Data("binary-v2".utf8).write(to: sourceExecutableURL)
    try Data("payload-v2".utf8).write(to: sourcePayloadURL)
    try installer.install(
        sourceExecutableURL: sourceExecutableURL,
        sourceResourceBundleURL: sourceBundleURL
    )

    #expect(try String(contentsOf: paths.installedExecutableURL, encoding: .utf8) == "binary-v2")
    #expect(
        try String(
            contentsOf: paths.installedResourceBundleURL.appendingPathComponent("model-rail.js"),
            encoding: .utf8
        ) == "payload-v2"
    )

    try installer.removeLaunchAgentPlist()
    #expect(!fileManager.fileExists(atPath: paths.launchAgentPlistURL.path))
    #expect(fileManager.fileExists(atPath: paths.installedExecutableURL.path))
}

@Test func stateStorePersistsOnlyStructuredRuntimeMetadata() throws {
    let fileManager = FileManager.default
    let root = fileManager.temporaryDirectory
        .appendingPathComponent("CopickerStateTests-\(UUID().uuidString)", isDirectory: true)
    defer { try? fileManager.removeItem(at: root) }

    let store = CopickerAutostartStateStore(
        fileURL: root.appendingPathComponent("state/autostart-state.json")
    )
    let state = CopickerAutostartState(
        phase: .injected,
        resultCode: .injectionSucceeded,
        updatedAt: Date(timeIntervalSince1970: 1_700_000_000),
        watcherProcessIdentifier: 100,
        codexProcessIdentifier: 200,
        codexVersion: "26.810.41047",
        codexBuildVersion: "6570",
        copickerVersion: "0.11.0"
    )

    try store.write(state)

    #expect(try store.read() == state)
    let rawState = try String(contentsOf: store.fileURL, encoding: .utf8)
    #expect(!rawState.contains("conversation"))
    #expect(!rawState.contains("cookie"))
    #expect(!rawState.contains("token"))
}

@Test func retryPolicyIsFiniteAndBacksOff() {
    #expect(CopickerAutostart.startupGraceSeconds == 5)
    #expect(CopickerAutostart.retryDelaySeconds == [0, 1, 2, 4, 8])
}
