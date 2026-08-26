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

    let marketplaceData = try Data(
        contentsOf: repositoryRoot.appendingPathComponent(".agents/plugins/marketplace.json")
    )
    let marketplace = try #require(
        JSONSerialization.jsonObject(with: marketplaceData) as? [String: Any]
    )
    #expect(marketplace["name"] as? String == "copicker-local")
    let marketplacePlugins = try #require(marketplace["plugins"] as? [[String: Any]])
    let marketplacePlugin = try #require(marketplacePlugins.first)
    #expect(marketplacePlugin["name"] as? String == "copicker")
    let marketplaceSource = try #require(marketplacePlugin["source"] as? [String: Any])
    #expect(marketplaceSource["path"] as? String == "./Plugin/copicker")

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
func installerRegistersTheStableLocalSettingsPlugin() throws {
    let repositoryRoot = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    let installer = try String(
        contentsOf: repositoryRoot.appendingPathComponent("script/install.sh"),
        encoding: .utf8
    )

    #expect(installer.contains("plugin-marketplace"))
    #expect(installer.contains("codex plugin marketplace add"))
    #expect(installer.contains("codex plugin add copicker@copicker-local"))
    #expect(installer.contains("codex plugin remove copicker@copicker-local"))
    #expect(installer.contains("/usr/bin/ditto"))
}

@Test
func settingsShellHasNoExternalNetworkDependency() throws {
    let repositoryRoot = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    let settingsURL = repositoryRoot.appendingPathComponent(
        "Sources/CopickerCLI/Resources/copicker-settings-v2.html"
    )
    let settingsHTML = try String(contentsOf: settingsURL, encoding: .utf8)

    #expect(settingsHTML.contains("<h1>CoPicker</h1>"))
    #expect(settingsHTML.contains("background: transparent"))
    #expect(settingsHTML.contains("copicker_settings_save"))
    #expect(settingsHTML.contains("tools/call"))
    #expect(settingsHTML.contains("Content-Security-Policy"))
    #expect(settingsHTML.contains("connect-src 'none'"))
    #expect(settingsHTML.contains("copicker/theme"))
    #expect(settingsHTML.contains("copicker/errorCode"))
    #expect(settingsHTML.contains("GPT-5.5"))
    #expect(settingsHTML.contains("Daybreak Blue"))
    #expect(settingsHTML.contains("GPT-5.3 Codex Spark"))
    #expect(settingsHTML.contains("Codex Trusted Access for Cyber"))
    #expect(settingsHTML.contains("Pro 5x / 20x"))
    #expect(settingsHTML.contains("至少保留一个模型"))
    #expect(settingsHTML.contains("跟随 Codex"))
    #expect(settingsHTML.contains("跟随系统"))
    #expect(settingsHTML.contains("下次注入生效"))
    #expect(settingsHTML.contains("type=\"checkbox\""))
    #expect(settingsHTML.contains("type=\"radio\""))
    #expect(!settingsHTML.contains("fetch("))
    #expect(!settingsHTML.contains("XMLHttpRequest"))
    #expect(!settingsHTML.contains("localStorage"))
    #expect(!settingsHTML.contains("sessionStorage"))
    #expect(!settingsHTML.contains("http://"))
    #expect(!settingsHTML.contains("https://"))
}
