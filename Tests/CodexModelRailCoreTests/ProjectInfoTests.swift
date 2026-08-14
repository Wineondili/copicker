import Testing
@testable import CodexModelRailCore

@Test func projectMetadataIsAvailable() {
    #expect(ProjectInfo.name == "Codex Model Rail")
    #expect(!ProjectInfo.version.isEmpty)
}

