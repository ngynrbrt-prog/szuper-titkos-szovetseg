package hu.szovetseg.game;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.net.Uri;
import android.content.Intent;
import android.Manifest;
import android.content.pm.PackageManager;
import org.json.JSONObject;
public final class MainActivity extends Activity {
 private static final String APP="https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/";
 private WebView web;private String pendingStart;private SessionVault vault;
 private boolean trusted(String url){if(url==null)return false;Uri u=Uri.parse(url);return "https".equals(u.getScheme())&&"ngynrbrt-prog.github.io".equals(u.getHost())&&("/szuper-titkos-szovetseg/".equals(u.getPath())||"/szuper-titkos-szovetseg/index.html".equals(u.getPath()));}
 @Override public void onCreate(Bundle saved){super.onCreate(saved);vault=new SessionVault(this);web=new WebView(this);setContentView(web);web.setOnApplyWindowInsetsListener((view,insets)->{if(android.os.Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(android.view.WindowInsets.Type.systemBars());view.setPadding(bars.left,bars.top,bars.right,bars.bottom);}else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});web.requestApplyInsets();WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setUserAgentString(settings.getUserAgentString()+" Szovetseg/1.9.0");web.addJavascriptInterface(new Host(),"AndroidHost");web.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){if(trusted(r.getUrl().toString()))return false;String scheme=r.getUrl().getScheme();if("https".equals(scheme)||"http".equals(scheme))startActivity(new Intent(Intent.ACTION_VIEW,r.getUrl()));return true;}});web.loadUrl(APP+"?native=1&v=1.9.0");if(vault.sharing()&&checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED){try{LocationService.start(this);}catch(Exception ignored){}}}
 @Override protected void onResume(){super.onResume();if(web!=null)web.post(()->{if(trusted(web.getUrl()))web.evaluateJavascript("window.dispatchEvent(new Event('nativeResume'))",null);});}
 final class Host {@JavascriptInterface public void postMessage(String raw){runOnUiThread(()->handle(raw));}}
 private void respond(String id,JSONObject data,String error){web.post(()->{if(!trusted(web.getUrl()))return;try{JSONObject result=new JSONObject().put("data",data==null?JSONObject.NULL:data).put("error",error==null?JSONObject.NULL:error);web.evaluateJavascript("window.NativeBridge&&window.NativeBridge.receive("+JSONObject.quote(id)+","+JSONObject.quote(result.toString())+")",null);}catch(Exception ignored){}});}
 private void handle(String raw){String id="";try{if(!trusted(web.getUrl())||raw.length()>100000)throw new Exception("Tiltott natív kérés.");JSONObject message=new JSONObject(raw);id=message.getString("id");String type=message.getString("type");JSONObject data=message.optJSONObject("data");if(data==null)data=new JSONObject();final String callback=id;
  switch(type){
   case "session":respond(id,vault.session(),null);break;
   case "saveSession":{JSONObject s=data.optJSONObject("session"),old=vault.session();if(s!=null&&(old==null||s.optLong("expires_at")>=old.optLong("expires_at")))vault.save(s);respond(id,new JSONObject(),null);break;}
   case "clearSession":LocationService.stop(this);vault.save(null);respond(id,new JSONObject(),null);break;
   case "status":respond(id,new JSONObject().put("sharing",vault.sharing()).put("platform","android"),null);break;
   case "start":if(vault.session()==null)throw new Exception("Előbb jelentkezz be.");pendingStart=id;requestPermissions(android.os.Build.VERSION.SDK_INT>=33?new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION,Manifest.permission.POST_NOTIFICATIONS}:new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},19);break;
   case "stop":if(pendingStart!=null){respond(pendingStart,null,"A megosztás indítását leállítottad.");pendingStart=null;}LocationService.stop(this);respond(id,new JSONObject().put("sharing",false),null);break;
   case "http":{String path=data.getString("path"),body=data.optString("body","{}"),authorization=data.optString("authorization","");Backend.request(this,path,body,authorization,(r,e)->respond(callback,r,e==null?null:e.getMessage()));break;}
   default:throw new Exception("Ismeretlen natív művelet.");
  }
 }catch(Exception e){respond(id,null,e.getMessage());}}
 @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] grants){super.onRequestPermissionsResult(request,permissions,grants);if(request!=19||pendingStart==null)return;String id=pendingStart;pendingStart=null;if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){respond(id,null,"Pontos helyengedély szükséges.");return;}if(android.os.Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){respond(id,null,"Az aktív megosztást jelző értesítés engedélye szükséges.");return;}try{LocationService.start(this);respond(id,new JSONObject().put("sharing",true),null);}catch(Exception e){vault.sharing(false);respond(id,null,e.getMessage());}}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}
