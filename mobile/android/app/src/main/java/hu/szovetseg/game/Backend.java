package hu.szovetseg.game;
import android.content.Context;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import org.json.JSONObject;
final class Backend {
 static final String BASE="https://lpjgrmfzteuwjgrcgxqa.supabase.co";
 static final String KEY="sb_publishable_yg-D91Eguq1udrFG85mG_g_7nL3uREb";
 static final ExecutorService queue=Executors.newSingleThreadExecutor();
 interface Reply {void done(JSONObject response,Exception error);}
 static JSONObject transport(String path,String body,String access) throws Exception {
  if(!path.matches("/functions/v1/(game-api|player-auth)")&&!path.equals("/auth/v1/token?grant_type=refresh_token")&&!path.equals("/auth/v1/logout?scope=local"))throw new Exception("Tiltott natív végpont.");
  HttpURLConnection connection=(HttpURLConnection)new URL(BASE+path).openConnection();connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(15000);connection.setReadTimeout(15000);connection.setRequestMethod("POST");connection.setDoOutput(true);connection.setRequestProperty("apikey",KEY);connection.setRequestProperty("Content-Type","application/json");if(access!=null&&!access.isEmpty())connection.setRequestProperty("Authorization","Bearer "+access);
  try{try(java.io.OutputStream output=connection.getOutputStream()){output.write(body.getBytes(StandardCharsets.UTF_8));}int status=connection.getResponseCode();InputStream input=status>=400?connection.getErrorStream():connection.getInputStream();String text=input==null?"":read(input);if(input!=null)input.close();return new JSONObject().put("status",status).put("body",text);}finally{connection.disconnect();}
 }
 static String read(InputStream input) throws Exception {java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] buffer=new byte[4096];int size;while((size=input.read(buffer))!=-1)out.write(buffer,0,size);return out.toString("UTF-8");}
 static JSONObject saveResponse(SessionVault vault,JSONObject response) throws Exception {if(response.optInt("status")<300){JSONObject data=new JSONObject(response.optString("body","{}"));if(data.has("access_token")){data.put("expires_at",System.currentTimeMillis()+data.optLong("expires_in",3600)*1000);vault.save(data);}}return response;}
 static JSONObject perform(SessionVault vault,String path,String body,String incoming) throws Exception {
  JSONObject stored=vault.session();
  if(path.equals("/auth/v1/token?grant_type=refresh_token")){if(stored!=null)body=new JSONObject().put("refresh_token",stored.optString("refresh_token")).toString();return saveResponse(vault,transport(path,body,null));}
  if(!path.endsWith("player-auth")&&stored!=null){if(stored.optLong("expires_at")<System.currentTimeMillis()+60000){JSONObject refreshed=saveResponse(vault,transport("/auth/v1/token?grant_type=refresh_token",new JSONObject().put("refresh_token",stored.optString("refresh_token")).toString(),null));if(refreshed.optInt("status")>=400)throw new Exception("A munkamenet lejárt. Jelentkezz be újra.");stored=vault.session();}incoming=stored.optString("access_token");}
  JSONObject result=transport(path,body,incoming);
  if(path.endsWith("player-auth"))saveResponse(vault,result);
  return result;
 }
 static void request(Context context,String path,String body,String incoming,Reply reply){queue.execute(()->{try{reply.done(perform(new SessionVault(context),path,body,incoming),null);}catch(Exception e){reply.done(null,e);}});}
}
