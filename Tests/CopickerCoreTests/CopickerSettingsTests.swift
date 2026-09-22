import Foundation
import Testing
@testable import CopickerCore

@Test
func settingsStorePersistsAValidatedPrivateSnapshot() throws {
    let fileManager = FileManager.default
    let root = fileManager.temporaryDirectory
        .appendingPathComponent("CopickerSettingsTests-\(UUID().uuidString)", isDirectory: true)
    defer { try? fileManager.removeItem(at: root) }

    let store = CopickerSettingsStore(fileURL: root.appendingPathComponent("settings.json"))
    #expect(try store.read() == .defaults)

    let saved = try store.save(
        CopickerSettings(
            revision: 0,
            enabled: true,
            visibleModels: [.daybreakBlue, .sol, .daybreakBlue, .gpt55],
            preferredPlacement: .right,
            appearance: .system
        ),
        expectedRevision: 0
    )

    #expect(saved.revision == 1)
    #expect(saved.visibleModels == [.sol, .daybreakBlue, .gpt55])
    #expect(try store.read() == saved)
    let attributes = try fileManager.attributesOfItem(atPath: store.fileURL.path)
    #expect(attributes[.posixPermissions] as? Int == 0o600)

    let rawSettings = try String(contentsOf: store.fileURL, encoding: .utf8)
    #expect(!rawSettings.contains("conversation"))
    #expect(!rawSettings.contains("cookie"))
    #expect(!rawSettings.contains("token"))
}

@Test
func settingsStoreRejectsEmptyModelVisibilityAndStaleWrites() throws {
    let fileManager = FileManager.default
    let root = fileManager.temporaryDirectory
        .appendingPathComponent("CopickerSettingsValidationTests-\(UUID().uuidString)")
    defer { try? fileManager.removeItem(at: root) }
    let store = CopickerSettingsStore(fileURL: root.appendingPathComponent("settings.json"))

    #expect(throws: CopickerSettingsError.noVisibleModels) {
        try store.save(
            CopickerSettings(
                revision: 0,
                enabled: true,
                visibleModels: [],
                preferredPlacement: .top,
                appearance: .dark
            ),
            expectedRevision: 0
        )
    }

    _ = try store.save(
        CopickerSettings(
            revision: 0,
            enabled: true,
            visibleModels: [.sol],
            preferredPlacement: .left,
            appearance: .light
        ),
        expectedRevision: 0
    )

    #expect {
        try store.save(
            CopickerSettings(
                revision: 0,
                enabled: false,
                visibleModels: [.terra],
                preferredPlacement: .right,
                appearance: .dark
            ),
            expectedRevision: 0
        )
    } throws: { error in
        guard case let CopickerSettingsError.revisionConflict(current) = error else {
            return false
        }
        return current.revision == 1 && current.preferredPlacement == .left
    }
}

@Test
func settingsModelContractsMatchRequestedEffortCounts() {
    #expect(
        CopickerModel.allCases == [
            .astra,
            .sol6,
            .luna6,
            .sol,
            .terra,
            .luna,
            .daybreakBlue,
            .gpt55,
        ]
    )
    #expect(CopickerModel.gpt55.effortLabels.count == 4)
    #expect(CopickerModel.sol6.effortLabels.count == 6)
    #expect(CopickerModel.luna6.effortLabels.count == 5)
    #expect(CopickerModel.daybreakBlue.effortLabels.count == 6)
    #expect(CopickerModel.luna.effortLabels.count == 5)
    #expect(CopickerModel.sol.effortLabels.count == 6)
    #expect(CopickerModel.astra.effortLabels.count == 6)
}

@Test
func retiringStatusDoesNotRemoveGPT55FromSavedVisibility() throws {
    #expect(CopickerModel.gpt55.lifecycleLabel == "Retiring")
    #expect(CopickerModel.allCases.filter { $0.lifecycleLabel != nil } == [.gpt55])
    let directory = FileManager.default.temporaryDirectory
        .appendingPathComponent("CopickerRetiringTests-\(UUID().uuidString)")
    defer { try? FileManager.default.removeItem(at: directory) }
    let store = CopickerSettingsStore(fileURL: directory.appendingPathComponent("settings.json"))
    let saved = try store.save(CopickerSettings(
        revision: 0, enabled: true, visibleModels: [.gpt55],
        preferredPlacement: .top, appearance: .dark
    ), expectedRevision: 0)
    #expect(saved.visibleModels == [.gpt55])
    #expect(try store.read() == saved)
}

@Test
func retiredSparkSettingsMigrateWithoutWritingOrResettingOtherPreferences() throws {
    let directory = FileManager.default.temporaryDirectory
        .appendingPathComponent("CopickerMigrationTests-\(UUID().uuidString)")
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    defer { try? FileManager.default.removeItem(at: directory) }
    let file = directory.appendingPathComponent("settings.json")
    let store = CopickerSettingsStore(fileURL: file)
    for modelIDs in [["gpt-5.3-codex-spark", "luna", "sol-6"], ["gpt-5.3-codex-spark"]] {
        let data = try JSONSerialization.data(withJSONObject: [
            "schemaVersion": 1, "revision": 9, "enabled": false,
            "visibleModels": modelIDs, "preferredPlacement": "right", "appearance": "light",
        ])
        try data.write(to: file)
        let migrated = try store.read()
        #expect(migrated.revision == 9)
        #expect(!migrated.enabled)
        #expect(migrated.preferredPlacement == .right)
        #expect(migrated.appearance == .light)
        #expect(migrated.visibleModels == (modelIDs.count == 1
            ? CopickerSettings.defaults.visibleModels : [.sol6, .luna]))
        #expect(try Data(contentsOf: file) == data)
        let saved = try store.save(CopickerSettings(
            revision: 9, enabled: false, visibleModels: [.sol6, .luna6],
            preferredPlacement: .right, appearance: .light
        ), expectedRevision: 9)
        #expect(saved.revision == 10)
        #expect(saved.visibleModels == [.sol6, .luna6])
        #expect(try store.read() == saved)
        #expect(!(try String(contentsOf: file, encoding: .utf8)).contains("gpt-5.3-codex-spark"))
    }
}

@Test
func retiredModelMigrationDoesNotAcceptUnknownOrEmptySettings() throws {
    for modelIDs in [[], ["unknown-model"], ["gpt-5.3-codex-spark", "unknown-model"]] as [[String]] {
        let data = try JSONSerialization.data(withJSONObject: [
            "schemaVersion": 1, "revision": 0, "enabled": true,
            "visibleModels": modelIDs, "preferredPlacement": "top", "appearance": "dark",
        ])
        #expect(throws: (any Error).self) {
            try JSONDecoder().decode(CopickerSettings.self, from: data).validated()
        }
    }
    #expect(CopickerModel(rawValue: "gpt-5.3-codex-spark") == nil)
    #expect(CopickerSettings.defaults.visibleModels == [.sol, .terra, .luna])
}
