import Foundation
import Testing

@Test
func publicDocumentationOmitsPersonalMachineDetails() throws {
    let root = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
    let manager = FileManager.default
    var files = try manager.contentsOfDirectory(at: root, includingPropertiesForKeys: nil)
        .filter { $0.pathExtension == "md" }
    let docs = root.appendingPathComponent("docs", isDirectory: true)
    let enumerator = try #require(manager.enumerator(at: docs, includingPropertiesForKeys: nil))
    for case let file as URL in enumerator where file.pathExtension == "md" {
        files.append(file)
    }
    let patterns = [
        #"/Users/[^\s/`]+/"#,
        #"`/(?:private/)?tmp/"#,
        #"\bPID\s+`?\d+"#,
    ]
    for file in files {
        let text = try String(contentsOf: file, encoding: .utf8)
        for pattern in patterns {
            let expression = try NSRegularExpression(pattern: pattern, options: [.caseInsensitive])
            let match = expression.firstMatch(in: text, range: NSRange(text.startIndex..., in: text))
            #expect(match == nil, "Public documentation contains a machine-specific detail: \(file.lastPathComponent)")
        }
    }
}
