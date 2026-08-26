import Foundation

enum CopickerSettingsApplier {
    static func apply(executableURL: URL) throws {
        let standardError = Pipe()
        let process = Process()
        process.executableURL = executableURL
        process.arguments = ["inject"]
        process.standardOutput = FileHandle.nullDevice
        process.standardError = standardError

        do {
            try process.run()
        } catch {
            throw CopickerSettingsApplierError.couldNotStart
        }

        process.waitUntilExit()
        let errorData = standardError.fileHandleForReading.readDataToEndOfFile()
        guard process.terminationReason == .exit, process.terminationStatus == 0 else {
            throw CopickerSettingsApplierError.injectionFailed(
                diagnostic: sanitizedDiagnostic(from: errorData)
            )
        }
    }

    private static func sanitizedDiagnostic(from data: Data) -> String? {
        guard let raw = String(data: data, encoding: .utf8) else {
            return nil
        }
        let line = raw
            .split(whereSeparator: \.isNewline)
            .map(String.init)
            .last(where: { !$0.trimmingCharacters(in: .whitespaces).isEmpty })?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard let line, !line.isEmpty else {
            return nil
        }
        let printable = line.unicodeScalars.filter { scalar in
            !CharacterSet.controlCharacters.contains(scalar)
        }
        return String(String.UnicodeScalarView(printable)).prefix(500).description
    }
}

private enum CopickerSettingsApplierError: LocalizedError {
    case couldNotStart
    case injectionFailed(diagnostic: String?)

    var errorDescription: String? {
        switch self {
        case .couldNotStart:
            "CoPicker could not start the guarded injection command."
        case let .injectionFailed(diagnostic):
            diagnostic ?? "CoPicker could not apply settings to the running Codex process."
        }
    }
}
