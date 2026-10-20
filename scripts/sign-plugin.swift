#!/usr/bin/env swift
// Signs a .thoughtsplugin for the App Store version of Thoughts, which installs
// plugins with a script only when they carry a valid catalog signature.
//
//   swift scripts/sign-plugin.swift --generate-key ~/thoughts-catalog.key
//       Creates the private key (keep it secret, never commit it) and prints the
//       public key to paste into Thoughts (PluginSignature.catalogPublicKey).
//
//   swift scripts/sign-plugin.swift path/to/Name.thoughtsplugin ~/thoughts-catalog.key
//       Writes Name.thoughtsplugin/signature. Sign again after every change.
//
// Message format (must match PluginSignature.swift in the app): every file of the
// package except `signature` and `.DS_Store`, sorted by relative path; for each
// file "<path>\n<sha256 hex>\n"; Ed25519 signature over that text, base64.

import CryptoKit
import Foundation

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}

func message(for root: URL) throws -> Data {
    let base = root.standardizedFileURL.path + "/"
    guard let enumerator = FileManager.default.enumerator(at: root, includingPropertiesForKeys: [.isRegularFileKey]) else {
        fail("Can't read \(root.path)")
    }
    var entries: [(String, String)] = []
    for case let file as URL in enumerator {
        guard (try? file.resourceValues(forKeys: [.isRegularFileKey]).isRegularFile) == true else { continue }
        let name = file.lastPathComponent
        if name == "signature" || name == ".DS_Store" { continue }
        let path = String(file.standardizedFileURL.path.dropFirst(base.count))
        let hash = SHA256.hash(data: try Data(contentsOf: file)).map { String(format: "%02x", $0) }.joined()
        entries.append((path, hash))
    }
    let text = entries.sorted { $0.0.utf8.lexicographicallyPrecedes($1.0.utf8) }
        .map { "\($0.0)\n\($0.1)\n" }.joined()
    return Data(text.utf8)
}

let args = Array(CommandLine.arguments.dropFirst())

if args.count == 2, args[0] == "--generate-key" {
    let keyURL = URL(fileURLWithPath: (args[1] as NSString).expandingTildeInPath)
    guard !FileManager.default.fileExists(atPath: keyURL.path) else { fail("\(keyURL.path) already exists") }
    let key = Curve25519.Signing.PrivateKey()
    try Data(key.rawRepresentation.base64EncodedString().utf8).write(to: keyURL)
    try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: keyURL.path)
    print("Private key: \(keyURL.path) (keep it secret)")
    print("Public key:  \(key.publicKey.rawRepresentation.base64EncodedString())")
    exit(0)
}

guard args.count == 2 else {
    fail("Usage:\n  sign-plugin.swift --generate-key <keyfile>\n  sign-plugin.swift <Name.thoughtsplugin> <keyfile>")
}

let package = URL(fileURLWithPath: (args[0] as NSString).expandingTildeInPath, isDirectory: true)
let keyText = try String(contentsOfFile: (args[1] as NSString).expandingTildeInPath, encoding: .utf8)
guard let keyData = Data(base64Encoded: keyText.trimmingCharacters(in: .whitespacesAndNewlines)),
      let key = try? Curve25519.Signing.PrivateKey(rawRepresentation: keyData) else { fail("Not a key file") }
guard FileManager.default.fileExists(atPath: package.appendingPathComponent("manifest.json").path) else {
    fail("\(package.path) has no manifest.json")
}
let signature = try key.signature(for: message(for: package))
try Data(signature.base64EncodedString().utf8).write(to: package.appendingPathComponent("signature"))
print("Signed \(package.lastPathComponent)")
print("Public key: \(key.publicKey.rawRepresentation.base64EncodedString())")
