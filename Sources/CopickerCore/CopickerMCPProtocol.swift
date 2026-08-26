import Foundation

public struct CopickerMCPProtocol {
    public static let settingsResourceURI = "ui://copicker/settings/v1.html"
    public static let settingsToolName = "copicker_settings"
    public static let appMIMEType = "text/html;profile=mcp-app"

    private static let supportedProtocolVersions = [
        "2025-06-18",
        "2025-03-26",
        "2024-11-05",
    ]

    private let settingsHTML: String

    public init(settingsHTML: String) {
        self.settingsHTML = settingsHTML
    }

    public func response(to requestData: Data) -> Data? {
        let request: [String: Any]
        do {
            guard let object = try JSONSerialization.jsonObject(with: requestData) as? [String: Any] else {
                return encode(errorResponse(id: NSNull(), code: -32600, message: "Invalid Request"))
            }
            request = object
        } catch {
            return encode(errorResponse(id: NSNull(), code: -32700, message: "Parse error"))
        }

        let requestID = request["id"]
        guard request["jsonrpc"] as? String == "2.0",
              let method = request["method"] as? String
        else {
            return encode(errorResponse(id: requestID ?? NSNull(), code: -32600, message: "Invalid Request"))
        }

        guard let requestID else {
            return nil
        }

        let params = request["params"] as? [String: Any] ?? [:]
        let result: [String: Any]

        switch method {
        case "initialize":
            result = initializeResult(params: params)
        case "ping":
            result = [:]
        case "tools/list":
            result = ["tools": [settingsTool]]
        case "tools/call":
            guard params["name"] as? String == Self.settingsToolName else {
                return encode(errorResponse(
                    id: requestID,
                    code: -32602,
                    message: "Unknown tool"
                ))
            }
            result = settingsToolResult
        case "resources/list":
            result = ["resources": [settingsResource]]
        case "resources/read":
            guard params["uri"] as? String == Self.settingsResourceURI else {
                return encode(errorResponse(
                    id: requestID,
                    code: -32002,
                    message: "Resource not found"
                ))
            }
            result = settingsResourceResult
        case "resources/templates/list":
            result = ["resourceTemplates": []]
        case "prompts/list":
            result = ["prompts": []]
        default:
            return encode(errorResponse(
                id: requestID,
                code: -32601,
                message: "Method not found"
            ))
        }

        return encode([
            "jsonrpc": "2.0",
            "id": requestID,
            "result": result,
        ])
    }

    private func initializeResult(params: [String: Any]) -> [String: Any] {
        let requestedVersion = params["protocolVersion"] as? String
        let protocolVersion: String
        if let requestedVersion,
           Self.supportedProtocolVersions.contains(requestedVersion) {
            protocolVersion = requestedVersion
        } else {
            protocolVersion = Self.supportedProtocolVersions[0]
        }

        return [
            "protocolVersion": protocolVersion,
            "capabilities": [
                "tools": ["listChanged": false],
                "resources": [
                    "subscribe": false,
                    "listChanged": false,
                ],
            ],
            "serverInfo": [
                "name": "copicker",
                "title": "CoPicker",
                "version": ProjectInfo.version,
                "icons": Self.serverIcons,
            ],
        ]
    }

    private var settingsTool: [String: Any] {
        [
            "name": Self.settingsToolName,
            "title": "CoPicker",
            "description": "Use this when the Codex host opens CoPicker settings. It renders the local settings surface without changing model, effort, Fast mode, or injection state.",
            "inputSchema": [
                "type": "object",
                "properties": [:],
                "additionalProperties": false,
            ],
            "outputSchema": [
                "type": "object",
                "properties": [
                    "version": ["type": "string"],
                ],
                "required": ["version"],
                "additionalProperties": false,
            ],
            "annotations": [
                "readOnlyHint": true,
                "destructiveHint": false,
                "openWorldHint": false,
                "idempotentHint": true,
            ],
            "_meta": [
                "ui": [
                    "resourceUri": Self.settingsResourceURI,
                    "visibility": ["app"],
                ],
                "openai/outputTemplate": Self.settingsResourceURI,
                "openai/ui": [
                    "entrypoints": [
                        [
                            "type": "settings",
                            "searchTerms": [
                                "CoPicker",
                                "model picker",
                                "reasoning effort",
                                "Fast",
                                "模型",
                                "推理强度",
                            ],
                        ],
                    ],
                ],
                "openai/toolInvocation/invoking": "Opening CoPicker settings",
                "openai/toolInvocation/invoked": "CoPicker settings ready",
            ],
        ]
    }

    private var settingsToolResult: [String: Any] {
        [
            "content": [
                [
                    "type": "text",
                    "text": "CoPicker settings are ready.",
                ],
            ],
            "structuredContent": [
                "version": ProjectInfo.version,
            ],
            "isError": false,
        ]
    }

    private var settingsResource: [String: Any] {
        [
            "uri": Self.settingsResourceURI,
            "name": "copicker-settings",
            "title": "CoPicker Settings",
            "description": "Local CoPicker settings surface.",
            "mimeType": Self.appMIMEType,
        ]
    }

    private var settingsResourceResult: [String: Any] {
        [
            "contents": [
                [
                    "uri": Self.settingsResourceURI,
                    "mimeType": Self.appMIMEType,
                    "text": settingsHTML,
                    "_meta": [
                        "ui": [
                            "prefersBorder": false,
                            "csp": [
                                "connectDomains": [],
                                "resourceDomains": [],
                                "frameDomains": [],
                            ],
                        ],
                        "openai/widgetDescription": "CoPicker settings inside the Codex settings window.",
                    ],
                ],
            ],
        ]
    }

    private static var serverIcons: [[String: Any]] {
        [
            icon(color: "#202124", theme: "light"),
            icon(color: "#F4F4F5", theme: "dark"),
        ]
    }

    private static func icon(color: String, theme: String) -> [String: Any] {
        let svg = """
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.25" y="2.25" width="19.5" height="19.5" rx="4.25" stroke="\(color)" stroke-width="2" stroke-linejoin="round"/><g fill="\(color)"><circle cx="7" cy="7" r="1.15"/><circle cx="12" cy="7" r="1.15"/><circle cx="17" cy="7" r="1.15"/><circle cx="7" cy="12" r="1.15"/><circle cx="12" cy="12" r="1.15"/><circle cx="17" cy="12" r="1.15"/><circle cx="7" cy="17" r="1.15"/><circle cx="12" cy="17" r="1.15"/><circle cx="17" cy="17" r="1.15"/></g></svg>
        """
        let encoded = Data(svg.utf8).base64EncodedString()
        return [
            "src": "data:image/svg+xml;base64,\(encoded)",
            "mimeType": "image/svg+xml",
            "sizes": ["24x24"],
            "theme": theme,
        ]
    }

    private func errorResponse(id: Any, code: Int, message: String) -> [String: Any] {
        [
            "jsonrpc": "2.0",
            "id": id,
            "error": [
                "code": code,
                "message": message,
            ],
        ]
    }

    private func encode(_ object: [String: Any]) -> Data? {
        try? JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
    }
}
