import Testing
@testable import CopickerCore

@Test func projectMetadataIsAvailable() {
    #expect(ProjectInfo.name == "Copicker")
    #expect(ProjectInfo.version == "1.0.0")
}
