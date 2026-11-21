package hu.szovetseg.game;
import android.app.*;
import android.content.*;
import android.location.*;
import android.os.*;
import android.Manifest;
import android.content.pm.PackageManager;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONObject;
public final class LocationService extends Service implements LocationListener {
 private LocationManager manager;private SessionVault vault;private long lastSent;private final AtomicBoolean pending=new AtomicBoolean(false);
 static void start(Context c){new SessionVault(c).sharing(true);c.startForegroundService(new Intent(c,LocationService.class));}
 static void stop(Context c){new SessionVault(c).sharing(false);c.stopService(new Intent(c,LocationService.class));Backend.request(c,"/functions/v1/game-api","{\"action\":\"stop\"}",null,(r,e)->{});}
 @Override public void onCreate(){super.onCreate();vault=new SessionVault(this);manager=(LocationManager)getSystemService(LOCATION_SERVICE);NotificationManager notifications=getSystemService(NotificationManager.class);notifications.createNotificationChannel(new NotificationChannel("sharing","Aktív helymegosztás",NotificationManager.IMPORTANCE_LOW));}
 @Override public int onStartCommand(Intent intent,int flags,int startId){
  if(intent!=null&&"STOP".equals(intent.getAction())){stop(this);return START_NOT_STICKY;}
  if(!vault.sharing()||vault.session()==null||checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){vault.sharing(false);stopSelf();return START_NOT_STICKY;}
  Intent open=new Intent(this,MainActivity.class);PendingIntent openApp=PendingIntent.getActivity(this,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);PendingIntent stop=PendingIntent.getService(this,1,new Intent(this,LocationService.class).setAction("STOP"),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  Notification notification=new Notification.Builder(this,"sharing").setSmallIcon(android.R.drawable.ic_menu_mylocation).setContentTitle("A Szövetség · Helymegosztás aktív").setContentText("Lezárt képernyő mellett is megosztod a friss helyedet.").setOngoing(true).setContentIntent(openApp).addAction(new Notification.Action.Builder(null,"Megosztás leállítása",stop).build()).build();
  startForeground(19,notification);
  try{if(manager.isProviderEnabled(LocationManager.GPS_PROVIDER))manager.requestLocationUpdates(LocationManager.GPS_PROVIDER,10000,0,this);if(manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER))manager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,10000,0,this);}catch(SecurityException e){vault.sharing(false);stopSelf();}
  return START_STICKY;
 }
 @Override public void onLocationChanged(Location location){if(!vault.sharing()||!location.hasAccuracy()||location.getAccuracy()>50||System.currentTimeMillis()-location.getTime()>30000||System.currentTimeMillis()-lastSent<10000||!pending.compareAndSet(false,true))return;lastSent=System.currentTimeMillis();try{JSONObject point=new JSONObject().put("lat",location.getLatitude()).put("lng",location.getLongitude()).put("accuracy",location.getAccuracy()).put("background",true);String body=new JSONObject().put("action","location").put("data",point).toString();Backend.request(this,"/functions/v1/game-api",body,null,(r,e)->pending.set(false));}catch(Exception e){pending.set(false);}}
 @Override public void onProviderDisabled(String provider){}@Override public void onProviderEnabled(String provider){}@Override public void onStatusChanged(String provider,int status,Bundle extras){}
 @Override public void onDestroy(){if(manager!=null){try{manager.removeUpdates(this);}catch(SecurityException ignored){}}stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();}
 @Override public IBinder onBind(Intent i){return null;}
}
