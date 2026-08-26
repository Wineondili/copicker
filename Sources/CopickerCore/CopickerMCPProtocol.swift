import Foundation

public struct CopickerMCPProtocol {
    public static let settingsResourceURI = "ui://copicker/settings/v2.html"
    public static let settingsToolName = "copicker_settings"
    public static let settingsSaveToolName = "copicker_settings_save"
    public static let settingsApplyToolName = "copicker_settings_apply"
    public static let appMIMEType = "text/html;profile=mcp-app"

    private static let supportedProtocolVersions = [
        "2025-06-18",
        "2025-03-26",
        "2024-11-05",
    ]

    private let settingsHTML: String
    private let settingsStore: CopickerSettingsStore
    private let applySettings: (() throws -> Void)?

    public init(
        settingsHTML: String,
        settingsStore: CopickerSettingsStore,
        applySettings: (() throws -> Void)? = nil
    ) {
        self.settingsHTML = settingsHTML
        self.settingsStore = settingsStore
        self.applySettings = applySettings
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
            result = ["tools": [settingsTool, settingsSaveTool, settingsApplyTool]]
        case "tools/call":
            guard let toolName = params["name"] as? String else {
                return encode(errorResponse(
                    id: requestID,
                    code: -32602,
                    message: "Missing tool name"
                ))
            }
            do {
                switch toolName {
                case Self.settingsToolName:
                    result = settingsToolResult(try settingsStore.read(), saved: false)
                case Self.settingsSaveToolName:
                    let arguments = params["arguments"] as? [String: Any] ?? [:]
                    result = settingsToolResult(
                        try saveSettings(arguments: arguments),
                        saved: true
                    )
                case Self.settingsApplyToolName:
                    result = settingsApplyToolResult()
                default:
                    return encode(errorResponse(
                        id: requestID,
                        code: -32602,
                        message: "Unknown tool"
                    ))
                }
            } catch let error as CopickerSettingsError {
                switch error {
                case let .revisionConflict(current):
                    result = settingsConflictToolResult(current)
                case .unsupportedSchemaVersion, .invalidRevision, .noVisibleModels:
                    return encode(settingsErrorResponse(id: requestID, error: error))
                }
            } catch {
                return encode(errorResponse(
                    id: requestID,
                    code: -32000,
                    message: "CoPicker settings could not be read or saved"
                ))
            }
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
            "description": "Use this when the Codex host opens CoPicker settings. It reads and renders the persisted local configuration without changing model or task state.",
            "inputSchema": emptyObjectSchema,
            "outputSchema": settingsOutputSchema,
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
                                "appearance",
                                "模型",
                                "推理强度",
                                "外观",
                            ],
                        ],
                    ],
                ],
                "openai/toolInvocation/invoking": "Loading CoPicker settings",
                "openai/toolInvocation/invoked": "CoPicker settings ready",
            ],
        ]
    }

    private var settingsSaveTool: [String: Any] {
        [
            "name": Self.settingsSaveToolName,
            "title": "Save CoPicker settings",
            "description": "Use this when the CoPicker settings UI saves a complete validated local configuration snapshot.",
            "inputSchema": [
                "type": "object",
                "properties": [
                    "expectedRevision": ["type": "integer", "minimum": 0],
                    "enabled": ["type": "boolean"],
                    "visibleModels": [
                        "type": "array",
                        "items": ["type": "string", "enum": modelIDs],
                        "minItems": 1,
                        "uniqueItems": true,
                    ],
                    "preferredPlacement": [
                        "type": "string",
                        "enum": CopickerPlacement.allCases.map(\.rawValue),
                    ],
                    "appearance": [
                        "type": "string",
                        "enum": CopickerAppearance.allCases.map(\.rawValue),
                    ],
                ],
                "required": [
                    "expectedRevision",
                    "enabled",
                    "visibleModels",
                    "preferredPlacement",
                    "appearance",
                ],
                "additionalProperties": false,
            ],
            "outputSchema": settingsOutputSchema,
            "annotations": [
                "readOnlyHint": false,
                "destructiveHint": false,
                "openWorldHint": false,
                "idempotentHint": true,
            ],
            "_meta": [
                "ui": ["visibility": ["app"]],
                "openai/toolInvocation/invoking": "Saving CoPicker settings",
                "openai/toolInvocation/invoked": "CoPicker settings saved",
            ],
        ]
    }

    private var settingsApplyTool: [String: Any] {
        [
            "name": Self.settingsApplyToolName,
            "title": "Apply CoPicker settings now",
            "description": "Use this only when the user explicitly asks the CoPicker settings UI to inject the saved configuration into the currently running Codex process.",
            "inputSchema": emptyObjectSchema,
            "outputSchema": [
                "type": "object",
                "properties": [
                    "applied": ["type": "boolean"],
                    "applyMode": ["type": "string", "enum": ["current-process"]],
                ],
                "required": ["applied", "applyMode"],
                "additionalProperties": false,
            ],
            "annotations": [
                "readOnlyHint": false,
                "destructiveHint": false,
                "openWorldHint": false,
                "idempotentHint": true,
            ],
            "_meta": [
                "ui": ["visibility": ["app"]],
                "openai/toolInvocation/invoking": "Applying CoPicker settings",
                "openai/toolInvocation/invoked": "CoPicker settings applied",
            ],
        ]
    }

    private var emptyObjectSchema: [String: Any] {
        [
            "type": "object",
            "properties": [String: Any](),
            "additionalProperties": false,
        ]
    }

    private var settingsOutputSchema: [String: Any] {
        [
            "type": "object",
            "properties": [
                "schemaVersion": ["type": "integer"],
                "revision": ["type": "integer"],
                "enabled": ["type": "boolean"],
                "visibleModels": [
                    "type": "array",
                    "items": ["type": "string", "enum": modelIDs],
                ],
                "preferredPlacement": [
                    "type": "string",
                    "enum": CopickerPlacement.allCases.map(\.rawValue),
                ],
                "appearance": [
                    "type": "string",
                    "enum": CopickerAppearance.allCases.map(\.rawValue),
                ],
                "applyMode": ["type": "string", "enum": ["next-injection"]],
            ],
            "required": [
                "schemaVersion",
                "revision",
                "enabled",
                "visibleModels",
                "preferredPlacement",
                "appearance",
                "applyMode",
            ],
            "additionalProperties": false,
        ]
    }

    private var modelIDs: [String] {
        CopickerModel.allCases.map(\.rawValue)
    }

    private func settingsToolResult(
        _ settings: CopickerSettings,
        saved: Bool
    ) -> [String: Any] {
        [
            "content": [
                [
                    "type": "text",
                    "text": saved ? "CoPicker settings saved." : "CoPicker settings loaded.",
                ],
            ],
            "structuredContent": settingsJSONObject(settings),
            "isError": false,
        ]
    }

    private func settingsConflictToolResult(
        _ current: CopickerSettings
    ) -> [String: Any] {
        [
            "content": [
                [
                    "type": "text",
                    "text": "CoPicker settings changed in another window.",
                ],
            ],
            "structuredContent": settingsJSONObject(current),
            "isError": true,
            "_meta": ["copicker/errorCode": -32009],
        ]
    }

    private func settingsApplyToolResult() -> [String: Any] {
        do {
            guard let applySettings else {
                throw CopickerSettingsApplyError.unavailable
            }
            try applySettings()
            return [
                "content": [
                    [
                        "type": "text",
                        "text": "CoPicker settings applied to the running Codex process.",
                    ],
                ],
                "structuredContent": [
                    "applied": true,
                    "applyMode": "current-process",
                ],
                "isError": false,
            ]
        } catch {
            return [
                "content": [
                    [
                        "type": "text",
                        "text": error.localizedDescription,
                    ],
                ],
                "structuredContent": [
                    "applied": false,
                    "applyMode": "current-process",
                ],
                "isError": true,
                "_meta": ["copicker/errorCode": -32010],
            ]
        }
    }

    private func saveSettings(arguments: [String: Any]) throws -> CopickerSettings {
        guard let expectedRevision = arguments["expectedRevision"] as? Int,
              let enabled = arguments["enabled"] as? Bool,
              let modelIDs = arguments["visibleModels"] as? [String],
              let placementValue = arguments["preferredPlacement"] as? String,
              let placement = CopickerPlacement(rawValue: placementValue),
              let appearanceValue = arguments["appearance"] as? String,
              let appearance = CopickerAppearance(rawValue: appearanceValue)
        else {
            throw CopickerSettingsError.invalidRevision(-1)
        }

        let models = modelIDs.compactMap(CopickerModel.init(rawValue:))
        guard models.count == modelIDs.count else {
            throw CopickerSettingsError.noVisibleModels
        }
        let requestedSettings = CopickerSettings(
            revision: expectedRevision,
            enabled: enabled,
            visibleModels: models,
            preferredPlacement: placement,
            appearance: appearance
        )
        return try settingsStore.save(
            requestedSettings,
            expectedRevision: expectedRevision
        )
    }

    private func settingsJSONObject(_ settings: CopickerSettings) -> [String: Any] {
        [
            "schemaVersion": settings.schemaVersion,
            "revision": settings.revision,
            "enabled": settings.enabled,
            "visibleModels": settings.visibleModels.map(\.rawValue),
            "preferredPlacement": settings.preferredPlacement.rawValue,
            "appearance": settings.appearance.rawValue,
            "applyMode": "next-injection",
        ]
    }

    private func settingsErrorResponse(
        id: Any,
        error: CopickerSettingsError
    ) -> [String: Any] {
        switch error {
        case let .revisionConflict(current):
            errorResponse(
                id: id,
                code: -32009,
                message: error.localizedDescription,
                data: settingsJSONObject(current)
            )
        case .unsupportedSchemaVersion, .invalidRevision, .noVisibleModels:
            errorResponse(
                id: id,
                code: -32602,
                message: error.localizedDescription
            )
        }
    }

    private var settingsResource: [String: Any] {
        [
            "uri": Self.settingsResourceURI,
            "name": "copicker-settings",
            "title": "CoPicker Settings",
            "description": "Persistent local CoPicker settings surface.",
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
                            ],
                        ],
                        "openai/widgetDescription": "Configure CoPicker inside the Codex settings window.",
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

    private func errorResponse(
        id: Any,
        code: Int,
        message: String,
        data: [String: Any]? = nil
    ) -> [String: Any] {
        var error: [String: Any] = [
            "code": code,
            "message": message,
        ]
        if let data {
            error["data"] = data
        }
        return [
            "jsonrpc": "2.0",
            "id": id,
            "error": error,
        ]
    }

    private func encode(_ object: [String: Any]) -> Data? {
        try? JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
    }
}

private enum CopickerSettingsApplyError: LocalizedError {
    case unavailable

    var errorDescription: String? {
        switch self {
        case .unavailable:
            "Immediate CoPicker application is unavailable in this host."
        }
    }
}
