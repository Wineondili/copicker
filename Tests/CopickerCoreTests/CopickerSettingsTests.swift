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
    #expect(saved.visibleModels == [.sol, .gpt55, .daybreakBlue])
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
    #expect(CopickerModel.gpt55.effortLabels.count == 4)
    #expect(CopickerModel.codexSpark.effortLabels.count == 4)
    #expect(CopickerModel.daybreakBlue.effortLabels.count == 6)
    #expect(CopickerModel.luna.effortLabels.count == 5)
    #expect(CopickerModel.sol.effortLabels.count == 6)
}
