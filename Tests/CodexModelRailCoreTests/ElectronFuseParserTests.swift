import Foundation
import Testing
@testable import CodexModelRailCore

@Test func parsesVersionOneFuseWire() throws {
    var data = Data([0x00, 0x01, 0x02])
    data.append(ElectronFuseParser.sentinel)
    data.append(1)
    data.append(9)
    data.append(Data("101100011".utf8))
    data.append(0xff)

    let report = try ElectronFuseParser.parse(data: data)

    #expect(report.schemaVersion == 1)
    #expect(report.rawWire == "101100011")
    #expect(report.nodeCLIInspectionEnabled)
    #expect(!report.embeddedASARIntegrityEnabled)
    #expect(report.values[.onlyLoadAppFromASAR] == .disabled)
}

@Test func rejectsMissingFuseSentinel() {
    #expect(throws: ElectronFuseError.self) {
        try ElectronFuseParser.parse(data: Data("not-an-electron-binary".utf8))
    }
}

