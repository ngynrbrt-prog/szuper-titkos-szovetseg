import Foundation
final class RefuseRedirect:NSObject,URLSessionTaskDelegate {
 func urlSession(_ session:URLSession,task:URLSessionTask,willPerformHTTPRedirection response:HTTPURLResponse,newRequest request:URLRequest,completionHandler:@escaping(URLRequest?)->Void){completionHandler(nil)}
}
final class Backend {
 static let shared=Backend()
 let redirect=RefuseRedirect()
 lazy var session:URLSession={let c=URLSessionConfiguration.ephemeral;c.httpShouldSetCookies=false;return URLSession(configuration:c,delegate:self.redirect,delegateQueue:nil)}()
 let queue=DispatchQueue(label:"hu.szovetseg.backend")
 let base="https://lpjgrmfzteuwjgrcgxqa.supabase.co"
 let key="sb_publishable_yg-D91Eguq1udrFG85mG_g_7nL3uREb"
 func transport(_ path:String,_ body:String,_ access:String?) throws -> [String:Any] {
  guard ["/functions/v1/game-api","/functions/v1/player-auth","/auth/v1/token?grant_type=refresh_token","/auth/v1/logout?scope=local"].contains(path),let url=URL(string:base+path) else{throw NSError(domain:"Tiltott natív végpont",code:400)}
  var request=URLRequest(url:url);request.httpMethod="POST";request.timeoutInterval=15;request.httpBody=Data(body.utf8);request.setValue(key,forHTTPHeaderField:"apikey");request.setValue("application/json",forHTTPHeaderField:"Content-Type");if let access=access,!access.isEmpty{request.setValue("Bearer "+access,forHTTPHeaderField:"Authorization")}
  let wait=DispatchSemaphore(value:0);var result:[String:Any]?;var failure:Error?
  session.dataTask(with:request){data,response,error in failure=error;if let response=response as? HTTPURLResponse{result=["status":response.statusCode,"body":String(data:data ?? Data(),encoding:.utf8) ?? ""]};wait.signal()}.resume()
  guard wait.wait(timeout:.now()+20) == .success else{throw NSError(domain:"Hálózati időtúllépés",code:408)}
  if let failure=failure{throw failure};guard let result=result else{throw NSError(domain:"Érvénytelen válasz",code:503)};return result
 }
 func saveResponse(_ response:[String:Any]) throws -> [String:Any] {if (response["status"] as? Int ?? 500)<300,let body=response["body"] as? String,let data=body.data(using:.utf8),var auth=(try? JSONSerialization.jsonObject(with:data)) as? [String:Any],auth["access_token"] != nil{auth["expires_at"]=Date().timeIntervalSince1970*1000+(auth["expires_in"] as? Double ?? 3600)*1000;try SessionVault.shared.save(auth)};return response}
 func perform(_ path:String,_ original:String,_ incoming:String?) throws -> [String:Any] {
  var session=SessionVault.shared.session(),body=original,access=incoming
  if path=="/auth/v1/token?grant_type=refresh_token"{if let session=session{body=try json(["refresh_token":session["refresh_token"] ?? ""])};return try saveResponse(transport(path,body,nil))}
  if !path.hasSuffix("player-auth"),let stored=session{if (stored["expires_at"] as? Double ?? 0)<Date().timeIntervalSince1970*1000+60000{let refreshed=try saveResponse(transport("/auth/v1/token?grant_type=refresh_token",json(["refresh_token":stored["refresh_token"] ?? ""]),nil));guard (refreshed["status"] as? Int ?? 500)<400 else{throw NSError(domain:"A munkamenet lejárt; jelentkezz be újra",code:401)};session=SessionVault.shared.session()};access=session?["access_token"] as? String}
  let result=try transport(path,body,access);return path.hasSuffix("player-auth") ? try saveResponse(result):result
 }
 func json(_ object:Any) throws -> String {String(data:try JSONSerialization.data(withJSONObject:object,options:[.fragmentsAllowed]),encoding:.utf8)!}
 func request(_ path:String,_ body:String,_ access:String?=nil,_ completion:@escaping([String:Any]?,Error?)->Void){queue.async{do{completion(try self.perform(path,body,access),nil)}catch{completion(nil,error)}}}
}
