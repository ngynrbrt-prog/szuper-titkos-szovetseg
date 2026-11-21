package hu.szovetseg.game;
import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;
final class SessionVault {
 private final Context context;
 SessionVault(Context c){context=c.getApplicationContext();}
 private SecretKey key() throws Exception {
  KeyStore store=KeyStore.getInstance("AndroidKeyStore");store.load(null);
  if(!store.containsAlias("szovetseg-session")){KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");generator.init(new KeyGenParameterSpec.Builder("szovetseg-session",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());generator.generateKey();}
  return ((KeyStore.SecretKeyEntry)store.getEntry("szovetseg-session",null)).getSecretKey();
 }
 synchronized JSONObject session(){try{String blob=context.getSharedPreferences("native",0).getString("session",null);if(blob==null)return null;String[] parts=blob.split(":");Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(parts[0],Base64.NO_WRAP)));return new JSONObject(new String(cipher.doFinal(Base64.decode(parts[1],Base64.NO_WRAP)),StandardCharsets.UTF_8));}catch(Exception e){return null;}}
 synchronized void save(JSONObject session) throws Exception {if(session==null){context.getSharedPreferences("native",0).edit().remove("session").apply();return;}Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());String blob=Base64.encodeToString(c.getIV(),Base64.NO_WRAP)+":"+Base64.encodeToString(c.doFinal(session.toString().getBytes(StandardCharsets.UTF_8)),Base64.NO_WRAP);context.getSharedPreferences("native",0).edit().putString("session",blob).apply();}
 boolean sharing(){return context.getSharedPreferences("native",0).getBoolean("sharing",false);}
 void sharing(boolean enabled){context.getSharedPreferences("native",0).edit().putBoolean("sharing",enabled).apply();}
}
