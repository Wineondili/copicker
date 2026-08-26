import Testing
@testable import CopickerCore

@Test func projectMetadataIsAvailable() {
    #expect(ProjectInfo.name == "Copicker")
    #expect(ProjectInfo.version == "0.12.0-dev")
}
