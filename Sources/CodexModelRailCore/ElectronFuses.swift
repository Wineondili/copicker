import Foundation

public enum ElectronFuseKey: Int, CaseIterable, Sendable {
    case runAsNode = 0
    case enableCookieEncryption
    case enableNodeOptionsEnvironmentVariable
    case enableNodeCLIInspectArguments
    case enableEmbeddedASARIntegrityValidation
    case onlyLoadAppFromASAR
    case loadBrowserProcessSpecificV8Snapshot
    case grantFileProtocolExtraPrivileges
    case wasmTrapHandlers

    public var displayName: String {
        switch self {
        case .runAsNode: "RunAsNode"
        case .enableCookieEncryption: "EnableCookieEncryption"
        case .enableNodeOptionsEnvironmentVariable: "EnableNodeOptionsEnvironmentVariable"
        case .enableNodeCLIInspectArguments: "EnableNodeCliInspectArguments"
        case .enableEmbeddedASARIntegrityValidation: "EnableEmbeddedAsarIntegrityValidation"
        case .onlyLoadAppFromASAR: "OnlyLoadAppFromAsar"
        case .loadBrowserProcessSpecificV8Snapshot: "LoadBrowserProcessSpecificV8Snapshot"
        case .grantFileProtocolExtraPrivileges: "GrantFileProtocolExtraPrivileges"
        case .wasmTrapHandlers: "WasmTrapHandlers"
        }
    }
}

public enum ElectronFuseValue: Character, Sendable {
    case disabled = "0"
    case enabled = "1"
    case removed = "r"

    public var isEnabled: Bool { self == .enabled }
}

public struct ElectronFuseReport: Sendable {
    public let schemaVersion: UInt8
    public let rawWire: String
    public let values: [ElectronFuseKey: ElectronFuseValue]

    public var nodeCLIInspectionEnabled: Bool {
        values[.enableNodeCLIInspectArguments]?.isEnabled == true
    }

    public var embeddedASARIntegrityEnabled: Bool {
        values[.enableEmbeddedASARIntegrityValidation]?.isEnabled == true
    }
}

public enum ElectronFuseParser {
    public static let sentinel = Data("dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX".utf8)

    public static func parse(fileURL: URL) throws -> ElectronFuseReport {
        let data = try Data(contentsOf: fileURL, options: .mappedIfSafe)
        return try parse(data: data)
    }

    public static func parse(data: Data) throws -> ElectronFuseReport {
        guard let sentinelRange = data.range(of: sentinel) else {
            throw ElectronFuseError.sentinelNotFound
        }

        let versionIndex = sentinelRange.upperBound
        let lengthIndex = versionIndex + 1
        guard lengthIndex < data.endIndex else {
            throw ElectronFuseError.truncatedHeader
        }

        let schemaVersion = data[versionIndex]
        let wireLength = Int(data[lengthIndex])
        let wireStart = lengthIndex + 1
        let wireEnd = wireStart + wireLength
        guard wireEnd <= data.endIndex else {
            throw ElectronFuseError.truncatedWire(expectedLength: wireLength)
        }

        let wireBytes = data[wireStart..<wireEnd]
        guard let rawWire = String(bytes: wireBytes, encoding: .ascii) else {
            throw ElectronFuseError.invalidWireEncoding
        }

        var values: [ElectronFuseKey: ElectronFuseValue] = [:]
        for key in ElectronFuseKey.allCases where key.rawValue < wireBytes.count {
            let byte = wireBytes[wireBytes.index(wireBytes.startIndex, offsetBy: key.rawValue)]
            guard let scalar = UnicodeScalar(Int(byte)) else {
                throw ElectronFuseError.invalidFuseValue(index: key.rawValue, byte: byte)
            }
            let character = Character(String(scalar))
            guard let value = ElectronFuseValue(rawValue: character) else {
                throw ElectronFuseError.invalidFuseValue(index: key.rawValue, byte: byte)
            }
            values[key] = value
        }

        return ElectronFuseReport(
            schemaVersion: schemaVersion,
            rawWire: rawWire,
            values: values
        )
    }
}

public enum ElectronFuseError: LocalizedError {
    case sentinelNotFound
    case truncatedHeader
    case truncatedWire(expectedLength: Int)
    case invalidWireEncoding
    case invalidFuseValue(index: Int, byte: UInt8)

    public var errorDescription: String? {
        switch self {
        case .sentinelNotFound:
            "Electron fuse sentinel was not found in the framework binary."
        case .truncatedHeader:
            "Electron fuse metadata is truncated before the wire header."
        case let .truncatedWire(expectedLength):
            "Electron fuse wire is truncated; expected \(expectedLength) bytes."
        case .invalidWireEncoding:
            "Electron fuse wire is not valid ASCII."
        case let .invalidFuseValue(index, byte):
            "Electron fuse at index \(index) has unsupported byte 0x\(String(byte, radix: 16))."
        }
    }
}
