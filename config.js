// Új útvonalhoz ezt az objektumot módosítsd, a játékmotort nem kell átírni.
window.GAME_CONFIG = {
  title: 'A Szuper Titkos szövetség',
  startCity: {name:'Budapest', fantasy:'A Megye', lat:47.4979, lng:19.0402},
  destinationCity: {name:'Prága', fantasy:'Mordor', lat:50.0875, lng:14.4213},
  cities: [
    {name:'Budapest', fantasy:'A Megye', lat:47.4979, lng:19.0402},
    {name:'Pozsony', fantasy:'Völgyzugoly', lat:48.1486, lng:17.1077},
    {name:'Bécs', fantasy:'Lothlórien', lat:48.2082, lng:16.3738},
    {name:'Brno', fantasy:'Mória', lat:49.1951, lng:16.6068},
    {name:'Prága', fantasy:'Mordor', lat:50.0875, lng:14.4213}
  ],
  routes: [
    {name:'Északi Ösvény', cities:['Budapest','Pozsony','Brno','Prága']},
    {name:'Nyugati Ösvény', cities:['Budapest','Bécs','Brno','Prága']}
  ],
  hunting: {center:[50.0875,14.4213], radiusKm:5, sauronSpeedKmh:6, captureMeters:50, immunityMinutes:15, arrivalMinMinutes:30, arrivalMaxMinutes:60, arrivalDistanceKm:[2,3], hiddenAfterCaptureMinutes:60, recoveryMeters:1000},
  rumor: {refreshHours:3, visibleAtZoom:6, europeBounds:[[35,-12],[71,32]], locations:[[48.8566,2.3522],[52.52,13.405],[41.9028,12.4964],[50.0755,14.4378],[47.4979,19.0402],[48.2082,16.3738],[52.2297,21.0122],[45.4642,9.19],[50.8503,4.3517],[48.1486,17.1077],[46.0569,14.5058],[53.3498,-6.2603],[55.6761,12.5683],[59.3293,18.0686],[40.4168,-3.7038],[38.7223,-9.1393]]},
  maxPlayers:6,
  rings:['Arany','Rubin','Zafír','Smaragd','Mithril','Ametiszt']
};
