import UIKit
import WebKit
final class GameViewController:UIViewController,WKScriptMessageHandler,WKNavigationDelegate {
 var web:WKWebView!
 let appURL=URL(string:"https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/?native=1&v=1.9.2")!
 func trusted(_ url:URL?)->Bool{guard let u=url else{return false};return u.scheme=="https"&&u.host=="ngynrbrt-prog.github.io"&&["/szuper-titkos-szovetseg/","/szuper-titkos-szovetseg/index.html"].contains(u.path)}
 override func viewDidLoad(){super.viewDidLoad();let configuration=WKWebViewConfiguration();configuration.applicationNameForUserAgent="Szovetseg/1.9.2";configuration.userContentController.add(self,name:"SzovetsegNative");web=WKWebView(frame:.zero,configuration:configuration);web.navigationDelegate=self;web.translatesAutoresizingMaskIntoConstraints=false;view.addSubview(web);NSLayoutConstraint.activate([web.leadingAnchor.constraint(equalTo:view.leadingAnchor),web.trailingAnchor.constraint(equalTo:view.trailingAnchor),web.topAnchor.constraint(equalTo:view.safeAreaLayoutGuide.topAnchor),web.bottomAnchor.constraint(equalTo:view.safeAreaLayoutGuide.bottomAnchor)]);view.backgroundColor = .white;web.load(URLRequest(url:appURL));NotificationCenter.default.addObserver(self,selector:#selector(resume),name:UIApplication.didBecomeActiveNotification,object:nil)}
 @objc func resume(){LocationTracker.shared.resumeRequested();if trusted(web?.url){web.evaluateJavaScript("window.dispatchEvent(new Event('nativeResume'))",completionHandler:nil)}}
 func reply(_ id:String,_ data:Any?,_ error:Error?=nil){DispatchQueue.main.async{guard self.trusted(self.web.url) else{return};do{let result=try Backend.shared.json(["data":data ?? NSNull(),"error":error?.localizedDescription as Any? ?? NSNull()]);let idJSON=try Backend.shared.json(id),textJSON=try Backend.shared.json(result);self.web.evaluateJavaScript("window.NativeBridge&&window.NativeBridge.receive(\(idJSON),\(textJSON))",completionHandler:nil)}catch{}}}
 func userContentController(_ controller:WKUserContentController,didReceive message:WKScriptMessage){guard message.frameInfo.isMainFrame,trusted(message.frameInfo.request.url),trusted(web.url),let raw=message.body as? String,raw.count<100000,let bytes=raw.data(using:.utf8),let envelope=(try? JSONSerialization.jsonObject(with:bytes)) as? [String:Any],let id=envelope["id"] as? String,let type=envelope["type"] as? String else{return};let data=envelope["data"] as? [String:Any] ?? [:]
  do{switch type{
   case "session":reply(id,SessionVault.shared.session())
   case "saveSession":if let session=data["session"] as? [String:Any]{let old=SessionVault.shared.session();if old==nil||(session["expires_at"] as? Double ?? 0)>=(old?["expires_at"] as? Double ?? 0){try SessionVault.shared.save(session)}};reply(id,[:])
   case "clearSession":LocationTracker.shared.stop();try SessionVault.shared.save(nil);reply(id,[:])
   case "status":reply(id,["sharing":SessionVault.shared.sharing,"platform":"ios"])
   case "start":LocationTracker.shared.start{error in self.reply(id,["sharing":SessionVault.shared.sharing],error)}
   case "stop":LocationTracker.shared.stop();reply(id,["sharing":false])
   case "http":guard let path=data["path"] as? String else{throw NSError(domain:"Hiányzó végpont",code:400)};Backend.shared.request(path,data["body"] as? String ?? "{}",data["authorization"] as? String){result,error in self.reply(id,result,error)}
   default:throw NSError(domain:"Ismeretlen natív művelet",code:400)
  }}catch{reply(id,nil,error)}
 }
 func webView(_ webView:WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){if trusted(action.request.url){decisionHandler(.allow)}else{if let url=action.request.url,["https","http"].contains(url.scheme ?? ""){UIApplication.shared.open(url)};decisionHandler(.cancel)}}
 deinit{NotificationCenter.default.removeObserver(self)}
}
