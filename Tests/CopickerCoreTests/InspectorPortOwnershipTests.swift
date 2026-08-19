import Darwin
import Testing
@testable import CopickerCore

@Test func inspectorPortOwnershipParsesUniquePositiveProcessIdentifiers() {
    let processIdentifiers = InspectorPortOwnership.parseProcessIdentifiers(
        "1255\n1255\n24013\ninvalid\n0\n-1\n"
    )

    #expect(processIdentifiers == Set<pid_t>([1255, 24013]))
}

@Test func inspectorPortOwnershipTreatsEmptyOutputAsNoListener() {
    #expect(InspectorPortOwnership.parseProcessIdentifiers("\n  \n").isEmpty)
}
