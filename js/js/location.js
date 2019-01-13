// check for Geolocation support
if (navigator.geolocation) {
    console.log('Geolocation is supported!');

    var startPos;
    var geoOptionsAge = {
      maximumAge: 5 * 60 * 1000,
    }
    var geoOptionsTime = {
      timeout: 20 * 1000
   }
 
    var nudge = document.getElementById("nudge");
  
    var showNudgeBanner = function() {
      nudge.style.display = "block";
    };
  
    var hideNudgeBanner = function() {
      nudge.style.display = "none";
    };
  
    var nudgeTimeoutId = setTimeout(showNudgeBanner, 5000);
  
    var geoSuccess = function(position) {
      hideNudgeBanner();
      // We have the location, don't display banner
      clearTimeout(nudgeTimeoutId);
  
      // Do magic with location
      startPos = position;
      document.getElementById('startLat').innerHTML = startPos.coords.latitude;
      document.getElementById('startLon').innerHTML = startPos.coords.longitude;
    };
    var geoError = function(error) {
      
      console.log(error);
      switch(error.code) {
        case error.TIMEOUT:
          //try again with a longer timeout
          navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptionsTime.timeout + (5*1000) );
          break;
        case error.PERMISSION_DENIED:
          // The user didn't accept the callout
          showNudgeBanner();
          //(put loc fun in showNudgeBanner() callback) ?, so when user click ok\close for the banner, we get loc
          navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptionsTime);
          break;
        case error.POSITION_UNAVAILABLE:
          //say there's no network n try again when there is ?!!!?
          break;
        case 0://unknown error
          //just try again
          break;
      }
    };
    document.getElementById('findme').onclick = function() {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptionsAge);
    };

    document.getElementById('trackme').onclick = function() {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    };
}
else {
    console.log('Geolocation is not supported for this Browser/OS.');
}