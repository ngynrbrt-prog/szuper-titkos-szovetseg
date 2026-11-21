import Foundation
import Security
final class SessionVault {
 static let shared = SessionVault()
 private let service = "hu.szovetseg.game.session"
 var sharing: Bool { get { UserDefaults.standard.bool(forKey: "sharingRequested") } set { UserDefaults.standard.set(newValue, forKey: "sharingRequested") } }
 func session() -> [String:Any]? { let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:"auth",kSecReturnData as String:true,kSecMatchLimit as String:kSecMatchLimitOne]; var item:CFTypeRef?; guard SecItemCopyMatching(query as CFDictionary,&item)==errSecSuccess,let data=item as? Data else{return nil};return (try? JSONSerialization.jsonObject(with:data)) as? [String:Any] }
 func save(_ session:[String:Any]?) throws { let key:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:"auth"];guard let session=session else{SecItemDelete(key as CFDictionary);return};let data=try JSONSerialization.data(withJSONObject:session);let attributes:[String:Any]=[kSecValueData as String:data,kSecAttrAccessible as String:kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly];let status=SecItemUpdate(key as CFDictionary,attributes as CFDictionary);if status==errSecItemNotFound{var insert=key;attributes.forEach{insert[$0.key]=$0.value};let added=SecItemAdd(insert as CFDictionary,nil);if added != errSecSuccess{throw NSError(domain:"Keychain",code:Int(added))}}else if status != errSecSuccess{throw NSError(domain:"Keychain",code:Int(status))} }
}
