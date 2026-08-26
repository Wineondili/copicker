import Foundation
import Testing
@testable import CopickerCore

struct CopickerMCPProtocolTests {
    private let protocolHandler = CopickerMCPProtocol(
        settingsHTML: "<html><body>CoPicker test settings</body></html>"
    )

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
        let tool = try #require(tools.first)

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
        #expect((csp["frameDomains"] as? [String])?.isEmpty == true)
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

    private func dictionary(_ value: Any?) throws -> [String: Any] {
        try #require(value as? [String: Any])
    }

    private func array(_ value: Any?) throws -> [Any] {
        try #require(value as? [Any])
    }
}
