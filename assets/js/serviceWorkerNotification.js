/**
 * from
 * 1. https://developers.google.com/web/fundamentals/push-notifications?authuser=1
 */

if ('serviceWorker' in navigator) {
    registerServiceWorker()
    .then(_srvcWrkr => { // maybe todo: enable ask for notification permission only after sw has registered
        console.log('is there result:', _srvcWrkr);
    }, _rjct => {
        console.error('register service worker', _rjct);
    }).catch(err => {
        console.error('did not register service worker', err);
    })
} else {
    // Push / Service Worker isn't supported on this browser, disable or hide UI.
    throw new Error("Service Worker isn't supported on this browser");
}

function checkPermissionStatus() {
  if (Notification.permission === "granted") { // hide the toggle button and helper text in create alert modal
    
  } else { // leave as is
    
  }
}

function testMethod() {
    console.log('I am in serviceWorkerNotifications');
}

function askPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        console.log("we got notificatiob", result);
        resolve(result);
      });
  
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') { // 'granted', 'default' or 'denied'
        throw new Error('We weren\'t granted permission.');
      } else {
        console.log('we alredy have permssion');
        subscribeUserToPush()
      } // here is a good time to ask again for another permission.
    });
  }

  function registerServiceWorker() {
    return navigator.serviceWorker.register('/sw.js', {scope: './'}) // relative file path: /assets/js/serviceWorkerNotification.js
    .then(function(registration) {
      console.log('Service worker successfully registered.');
      return registration;
    })
    .catch(function(err) {
      console.error('Unable to register service worker.', err);
    });
  }

  function subscribeUserToPush() {
    // do an if check to make sure permission is granted
    return navigator.serviceWorker.register('/sw.js', {scope: './'})
    .then(function(registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BBLEBBxiYOL0nqq_VXwKiuIffjbQBiXXkJyMDoRwGJvNiqTHg3sJ3xSM-s8jLqHKWmROKpM1ZH-88gtfIi1y7DE'
        )
      };
  
      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function(pushSubscription) {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      console.log(pushSubscription);
      sendSubscriptionToBackEnd(pushSubscription) // remember not to do this twice
      return pushSubscription;
    });
  }

  function sendSubscriptionToBackEnd(subscription) {
    return fetch('/save-push-subscription/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription) // body must be stringfied
    })
    .then(function(response) {
      console.log('servr saving push', response);
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
  
      return response // .json();
    }, function catchErr(err) {
      console.error('err saving push sub', err);
    })
    .then(function(responseData) {
      console.log('res from our server saving pM', responseData);
      if (!(responseData.ok)) {
        console.error('Bad response from server.', responseData);
        throw new Error('Bad response from server.');
      }
    });
  }

  // {"endpoint":"https://fcm.googleapis.com/fcm/send/e6fzYIbA0Q0:APA91bGRYibxp3M7hMsVyiqoDTpiZ8nuoiGKSRJ6ZfYHlLpXYpvyf4DsDXZXApFUhMI8AtAFzqF0_Ka_U4PK7Pn3srB5LTvPB7kTGXNG9JBQ-fd7O_mDwTdTNAgBUFdLHQ8LEz1O5P1_","expirationTime":null,"keys":{"p256dh":"BDIeicRXkowQvzGr2jgz8-QkIBLRvWV5m_ide5WKs44Eadl_YVPrnCdOtXoO_DFdMeCtQiehs4DMrV2-guN-ZOo","auth":"BPdlCZEVuUCWG5bnG--jHw"}}
  // https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/app/scripts/main.js

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }