import Foundation
import Testing
@testable import CopickerCore

@Test
func pluginPackageMatchesTheInstalledCLIContract() throws {
    let repositoryRoot = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    let pluginRoot = repositoryRoot.appendingPathComponent("Plugin/copicker")

    let manifestData = try Data(
        contentsOf: pluginRoot.appendingPathComponent(".codex-plugin/plugin.json")
    )
    let manifest = try #require(
        JSONSerialization.jsonObject(with: manifestData) as? [String: Any]
    )
    #expect(manifest["name"] as? String == "copicker")
    #expect(manifest["version"] as? String == ProjectInfo.version)
    #expect(manifest["mcpServers"] as? String == "./.mcp.json")

    let interface = try #require(manifest["interface"] as? [String: Any])
    #expect(interface["displayName"] as? String == "CoPicker")
    #expect(interface["logo"] as? String == "./assets/model-picker-grid-light.svg")
    #expect(interface["logoDark"] as? String == "./assets/model-picker-grid-dark.svg")

    let serverConfigData = try Data(
        contentsOf: pluginRoot.appendingPathComponent(".mcp.json")
    )
    let serverConfig = try #require(
        JSONSerialization.jsonObject(with: serverConfigData) as? [String: Any]
    )
    let servers = try #require(serverConfig["mcpServers"] as? [String: Any])
    let copicker = try #require(servers["copicker"] as? [String: Any])
    #expect(copicker["command"] as? String == "./bin/copicker-mcp")
    #expect(copicker["env_vars"] as? [String] == ["HOME"])

    let launcher = try String(
        contentsOf: pluginRoot.appendingPathComponent("bin/copicker-mcp"),
        encoding: .utf8
    )
    #expect(launcher.contains("Library/Application Support/Copicker/bin/copicker"))
    #expect(launcher.contains("exec \"$copicker_executable\" mcp-server"))

    for asset in [
        "model-picker-grid.svg",
        "model-picker-grid-light.svg",
        "model-picker-grid-dark.svg",
    ] {
        #expect(
            FileManager.default.fileExists(
                atPath: pluginRoot.appendingPathComponent("assets/\(asset)").path
            )
        )
    }
}

@Test
func settingsShellHasNoExternalNetworkDependency() throws {
    let repositoryRoot = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    let settingsURL = repositoryRoot.appendingPathComponent(
        "Sources/CopickerCLI/Resources/copicker-settings-v1.html"
    )
    let settingsHTML = try String(contentsOf: settingsURL, encoding: .utf8)

    #expect(settingsHTML.contains("<h1>CoPicker</h1>"))
    #expect(settingsHTML.contains("background: transparent"))
    #expect(!settingsHTML.contains("fetch("))
    #expect(!settingsHTML.contains("XMLHttpRequest"))
    #expect(!settingsHTML.contains("localStorage"))
    #expect(!settingsHTML.contains("sessionStorage"))
    #expect(!settingsHTML.contains("http://"))
    #expect(!settingsHTML.contains("https://"))
}
