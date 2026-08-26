import Foundation
import Testing
@testable import CopickerCore

struct CopickerMCPProtocolTests {
    private let settingsStore = CopickerSettingsStore(
        fileURL: FileManager.default.temporaryDirectory
            .appendingPathComponent("CopickerMCPProtocolTests-\(UUID().uuidString)/settings.json")
    )

    private var protocolHandler: CopickerMCPProtocol {
        CopickerMCPProtocol(
            settingsHTML: "<html><body>CoPicker test settings</body></html>",
            settingsStore: settingsStore
        )
    }

    @Test
    func initializeAdvertisesThemedIconsAndLocalCapabilities() throws {
        let response = try send(
            method: "initialize",
            params: ["protocolVersion": "2025-06-18"]
        )
        let result = try dictionary(response["result"])
        #expect(result["protocolVersion"] as? String == "2025-06-18")

        let serverInfo = try dictionary(result["serverInfo"])
        #expect(serverInfo["title"] as? String == "CoPicker")
        #expect(serverInfo["version"] as? String == ProjectInfo.version)

        let icons = try array(serverInfo["icons"]).map { try dictionary($0) }
        #expect(icons.count == 2)
        #expect(icons.map { $0["theme"] as? String } == ["light", "dark"])
        #expect(icons.allSatisfy {
            ($0["src"] as? String)?.hasPrefix("data:image/svg+xml;base64,") == true
        })
    }

    @Test
    func settingsToolIsAppOnlyAndDeclaresTheSettingsEntrypoint() throws {
        let response = try send(method: "tools/list")
        let result = try dictionary(response["result"])
        let tools = try array(result["tools"]).map { try dictionary($0) }
        #expect(tools.count == 2)
        let tool = try #require(
            tools.first(where: { $0["name"] as? String == CopickerMCPProtocol.settingsToolName })
        )

        #expect(tool["name"] as? String == CopickerMCPProtocol.settingsToolName)
        let annotations = try dictionary(tool["annotations"])
        #expect(annotations["readOnlyHint"] as? Bool == true)
        #expect(annotations["openWorldHint"] as? Bool == false)

        let metadata = try dictionary(tool["_meta"])
        let ui = try dictionary(metadata["ui"])
        #expect(ui["resourceUri"] as? String == CopickerMCPProtocol.settingsResourceURI)
        #expect(ui["visibility"] as? [String] == ["app"])
        #expect(metadata["openai/outputTemplate"] as? String == CopickerMCPProtocol.settingsResourceURI)

        let openAIUI = try dictionary(metadata["openai/ui"])
        let entrypoints = try array(openAIUI["entrypoints"]).map { try dictionary($0) }
        #expect(entrypoints.first?["type"] as? String == "settings")

        let saveTool = try #require(
            tools.first(where: { $0["name"] as? String == CopickerMCPProtocol.settingsSaveToolName })
        )
        let saveAnnotations = try dictionary(saveTool["annotations"])
        #expect(saveAnnotations["readOnlyHint"] as? Bool == false)
        #expect(saveAnnotations["idempotentHint"] as? Bool == true)
    }

    @Test
    func settingsResourceUsesTheMCPAppMimeTypeAndEmptyNetworkAllowLists() throws {
        let response = try send(
            method: "resources/read",
            params: ["uri": CopickerMCPProtocol.settingsResourceURI]
        )
        let result = try dictionary(response["result"])
        let contents = try array(result["contents"]).map { try dictionary($0) }
        let content = try #require(contents.first)

        #expect(content["mimeType"] as? String == CopickerMCPProtocol.appMIMEType)
        #expect((content["text"] as? String)?.contains("CoPicker test settings") == true)

        let metadata = try dictionary(content["_meta"])
        let ui = try dictionary(metadata["ui"])
        let csp = try dictionary(ui["csp"])
        #expect((csp["connectDomains"] as? [String])?.isEmpty == true)
        #expect((csp["resourceDomains"] as? [String])?.isEmpty == true)
        #expect(csp["frameDomains"] == nil)
    }

    @Test
    func settingsToolsReadSaveAndRepeatAnIdempotentSnapshot() throws {
        let initial = try callTool(CopickerMCPProtocol.settingsToolName)
        let initialSnapshot = try dictionary(initial["structuredContent"])
        #expect(initialSnapshot["revision"] as? Int == 0)
        #expect(initialSnapshot["visibleModels"] as? [String] == ["sol", "terra", "luna"])

        let arguments: [String: Any] = [
            "expectedRevision": 0,
            "enabled": false,
            "visibleModels": ["sol", "gpt-5.5", "daybreak-blue"],
            "preferredPlacement": "left",
            "appearance": "codex",
        ]
        let saved = try callTool(
            CopickerMCPProtocol.settingsSaveToolName,
            arguments: arguments
        )
        let savedSnapshot = try dictionary(saved["structuredContent"])
        #expect(savedSnapshot["revision"] as? Int == 1)
        #expect(savedSnapshot["enabled"] as? Bool == false)
        #expect(savedSnapshot["preferredPlacement"] as? String == "left")

        let repeated = try callTool(
            CopickerMCPProtocol.settingsSaveToolName,
            arguments: arguments
        )
        let repeatedSnapshot = try dictionary(repeated["structuredContent"])
        #expect(repeatedSnapshot["revision"] as? Int == 1)
        #expect(try settingsStore.read().revision == 1)
    }

    @Test
    func staleSettingsWritesReturnTheCurrentSnapshot() throws {
        _ = try callTool(
            CopickerMCPProtocol.settingsSaveToolName,
            arguments: [
                "expectedRevision": 0,
                "enabled": true,
                "visibleModels": ["sol", "terra"],
                "preferredPlacement": "right",
                "appearance": "light",
            ]
        )

        let response = try send(
            method: "tools/call",
            params: [
                "name": CopickerMCPProtocol.settingsSaveToolName,
                "arguments": [
                    "expectedRevision": 0,
                    "enabled": true,
                    "visibleModels": ["luna"],
                    "preferredPlacement": "top",
                    "appearance": "dark",
                ],
            ]
        )
        let result = try dictionary(response["result"])
        #expect(result["isError"] as? Bool == true)
        let metadata = try dictionary(result["_meta"])
        #expect(metadata["copicker/errorCode"] as? Int == -32009)
        let current = try dictionary(result["structuredContent"])
        #expect(current["revision"] as? Int == 1)
        #expect(current["preferredPlacement"] as? String == "right")
    }

    @Test
    func notificationsDoNotProduceResponses() throws {
        let data = try JSONSerialization.data(withJSONObject: [
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
        ])
        #expect(protocolHandler.response(to: data) == nil)
    }

    @Test
    func unknownMethodsReturnMethodNotFound() throws {
        let response = try send(method: "unknown/method")
        let error = try dictionary(response["error"])
        #expect(error["code"] as? Int == -32601)
    }

    private func send(
        method: String,
        params: [String: Any] = [:]
    ) throws -> [String: Any] {
        let data = try JSONSerialization.data(withJSONObject: [
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params,
        ])
        let responseData = try #require(protocolHandler.response(to: data))
        return try #require(
            JSONSerialization.jsonObject(with: responseData) as? [String: Any]
        )
    }

    private func callTool(
        _ name: String,
        arguments: [String: Any] = [:]
    ) throws -> [String: Any] {
        let response = try send(
            method: "tools/call",
            params: ["name": name, "arguments": arguments]
        )
        return try dictionary(response["result"])
    }

    private func dictionary(_ value: Any?) throws -> [String: Any] {
        try #require(value as? [String: Any])
    }

    private func array(_ value: Any?) throws -> [Any] {
        try #require(value as? [Any])
    }
}
