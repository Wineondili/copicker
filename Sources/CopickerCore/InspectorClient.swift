import Foundation

public struct InspectorTarget: Codable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let type: String
    public let url: String
    public let webSocketDebuggerURL: URL?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case type
        case url
        case webSocketDebuggerURL = "webSocketDebuggerUrl"
    }
}

public struct InspectorEndpointDiscovery: Sendable {
    public let host: String
    public let port: Int

    public init(host: String = "127.0.0.1", port: Int = 9229) {
        self.host = host
        self.port = port
    }

    public func fetchTargets() async throws -> [InspectorTarget] {
        guard let url = URL(string: "http://\(host):\(port)/json/list") else {
            throw InspectorError.invalidEndpoint
        }

        var request = URLRequest(url: url)
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        request.timeoutInterval = 0.5

        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 0.5
        configuration.timeoutIntervalForResource = 0.75
        let session = URLSession(configuration: configuration)
        defer { session.invalidateAndCancel() }

        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode)
        else {
            throw InspectorError.invalidHTTPResponse
        }

        return try JSONDecoder().decode([InspectorTarget].self, from: data)
    }

    public func waitForTarget(timeout: Duration = .seconds(5)) async throws -> InspectorTarget {
        let clock = ContinuousClock()
        let deadline = clock.now.advanced(by: timeout)
        var lastError: Error?

        while clock.now < deadline {
            do {
                if let target = try await fetchTargets().first(where: {
                    $0.webSocketDebuggerURL != nil && ($0.type == "node" || $0.type.isEmpty)
                }) {
                    return target
                }
            } catch {
                lastError = error
            }
            try await Task.sleep(for: .milliseconds(100))
        }

        throw InspectorError.targetTimeout(lastError: lastError)
    }
}

public struct InspectorPortOwnership: Sendable {
    public let port: Int
    public let lsofURL: URL

    public init(
        port: Int = 9229,
        lsofURL: URL = URL(fileURLWithPath: "/usr/sbin/lsof")
    ) {
        self.port = port
        self.lsofURL = lsofURL
    }

    public func listeningProcessIdentifiers() throws -> Set<pid_t> {
        let process = Process()
        process.executableURL = lsofURL
        process.arguments = [
            "-nP",
            "-t",
            "-a",
            "-iTCP:\(port)",
            "-sTCP:LISTEN",
        ]

        let output = Pipe()
        let errors = Pipe()
        process.standardOutput = output
        process.standardError = errors
        try process.run()

        let outputData = output.fileHandleForReading.readDataToEndOfFile()
        let errorData = errors.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()

        let outputText = String(data: outputData, encoding: .utf8) ?? ""
        if process.terminationStatus == 1 && outputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return []
        }
        guard process.terminationStatus == 0 else {
            let errorText = String(data: errorData, encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            throw InspectorPortOwnershipError.lsofFailed(
                exitStatus: process.terminationStatus,
                output: errorText
            )
        }

        return Self.parseProcessIdentifiers(outputText)
    }

    public static func parseProcessIdentifiers(_ output: String) -> Set<pid_t> {
        Set(
            output
                .split(whereSeparator: \Character.isWhitespace)
                .compactMap { pid_t($0) }
                .filter { $0 > 0 }
        )
    }
}

public actor InspectorSession {
    private let task: URLSessionWebSocketTask
    private let session: URLSession
    private var nextRequestID = 0

    public init(url: URL) {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 2
        let session = URLSession(configuration: configuration)
        self.session = session
        self.task = session.webSocketTask(with: url)
    }

    public func connect() {
        task.resume()
    }

    public func evaluate(
        expression: String,
        awaitPromise: Bool = true,
        returnByValue: Bool = true
    ) async throws -> JSONValue? {
        nextRequestID += 1
        let requestID = nextRequestID
        let request = InspectorRequest(
            id: requestID,
            method: "Runtime.evaluate",
            params: .object([
                "expression": .string(expression),
                "awaitPromise": .bool(awaitPromise),
                "returnByValue": .bool(returnByValue),
                "userGesture": .bool(false),
            ])
        )

        let requestData = try JSONEncoder().encode(request)
        guard let requestText = String(data: requestData, encoding: .utf8) else {
            throw InspectorError.invalidRequestEncoding
        }
        try await task.send(.string(requestText))

        while true {
            let message = try await task.receive()
            let responseData: Data
            switch message {
            case let .string(text):
                responseData = Data(text.utf8)
            case let .data(data):
                responseData = data
            @unknown default:
                continue
            }

            let response = try JSONDecoder().decode(InspectorResponse.self, from: responseData)
            guard response.id == requestID else { continue }

            if let error = response.error {
                throw InspectorError.protocolError(code: error.code, message: error.message)
            }
            guard let result = response.result else {
                throw InspectorError.missingEvaluationResult
            }
            if let exception = result["exceptionDetails"] {
                let description = exception["text"]?.stringValue
                    ?? result["result"]?["description"]?.stringValue
                    ?? exception.prettyPrinted()
                throw InspectorError.evaluationFailed(description)
            }

            let remoteObject = result["result"]
            return remoteObject?["value"] ?? remoteObject?["description"] ?? remoteObject
        }
    }

    public func close() {
        task.cancel(with: .goingAway, reason: nil)
        session.invalidateAndCancel()
    }
}

private struct InspectorRequest: Encodable {
    let id: Int
    let method: String
    let params: JSONValue
}

private struct InspectorResponse: Decodable {
    let id: Int?
    let result: JSONValue?
    let error: InspectorProtocolError?
}

private struct InspectorProtocolError: Decodable {
    let code: Int
    let message: String
}

public enum InspectorError: LocalizedError {
    case invalidEndpoint
    case invalidHTTPResponse
    case targetTimeout(lastError: Error?)
    case invalidRequestEncoding
    case protocolError(code: Int, message: String)
    case missingEvaluationResult
    case evaluationFailed(String)
    case inspectorPortAlreadyInUse

    public var errorDescription: String? {
        switch self {
        case .invalidEndpoint:
            "Inspector endpoint URL is invalid."
        case .invalidHTTPResponse:
            "Inspector endpoint returned an invalid HTTP response."
        case let .targetTimeout(lastError):
            "Timed out waiting for the Codex Inspector target. Last error: \(lastError?.localizedDescription ?? "none")."
        case .invalidRequestEncoding:
            "Inspector request could not be encoded as UTF-8 JSON."
        case let .protocolError(code, message):
            "Inspector protocol error \(code): \(message)"
        case .missingEvaluationResult:
            "Inspector response did not include an evaluation result."
        case let .evaluationFailed(description):
            "Inspector evaluation failed: \(description)"
        case .inspectorPortAlreadyInUse:
            "Inspector port 9229 is already in use; refusing to attach to an unknown process."
        }
    }
}

public enum InspectorPortOwnershipError: LocalizedError {
    case lsofFailed(exitStatus: Int32, output: String)

    public var errorDescription: String? {
        switch self {
        case let .lsofFailed(exitStatus, output):
            "Could not inspect the owner of Inspector port 9229 (lsof exit \(exitStatus)): \(output.isEmpty ? "no diagnostic output" : output)"
        }
    }
}
