import CopickerCore
import Foundation

enum CopickerMCPServer {
    static func run() throws {
        guard let settingsURL = Bundle.module.url(
            forResource: "copicker-settings-v2",
            withExtension: "html"
        ) else {
            throw CopickerMCPServerError.settingsResourceMissing
        }

        let settingsHTML = try String(contentsOf: settingsURL, encoding: .utf8)
        let protocolHandler = CopickerMCPProtocol(
            settingsHTML: settingsHTML,
            settingsStore: CopickerSettingsStore(
                fileURL: CopickerAutostartPaths().settingsFileURL
            )
        )
        let newline = Data([0x0A])

        while let line = readLine(strippingNewline: true) {
            guard let requestData = line.data(using: .utf8),
                  let responseData = protocolHandler.response(to: requestData)
            else {
                continue
            }

            FileHandle.standardOutput.write(responseData)
            FileHandle.standardOutput.write(newline)
        }
    }
}

private enum CopickerMCPServerError: LocalizedError {
    case settingsResourceMissing

    var errorDescription: String? {
        switch self {
        case .settingsResourceMissing:
            "Bundled copicker-settings-v2.html resource is missing."
        }
    }
}
