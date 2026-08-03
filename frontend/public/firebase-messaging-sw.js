// importScripts(
//   "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
// );

// firebase.initializeApp({
//   apiKey: "AIzaSyA9w5hFKsP8qazghWRmNpngVvdtnNzm-58",
//   authDomain: "abfitness-105c2.firebaseapp.com",
//   projectId: "abfitness-105c2",
//   messagingSenderId: "385925821836",
//   appId: "1:385925821836:web:d8ed570df65218601cd2a9",
// });

// const messaging = firebase.messaging();

// // Background notifications handle karo
// messaging.onBackgroundMessage((payload) => {
//   console.log("Background message:", payload);

//   const { title, body, icon } = payload.notification;

//   self.registration.showNotification(title, {
//     body,
//     icon: icon || "/icon-192.png",
//     badge: "/icon-192.png",
//     badge: "/notification-icon.png",
//     vibrate: [200, 100, 200],
//   });
// });

importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyA9w5hFKsP8qazghWRmNpngVvdtnNzm-58",
  authDomain: "abfitness-105c2.firebaseapp.com",
  projectId: "abfitness-105c2",
  messagingSenderId: "385925821836",
  appId: "1:385925821836:web:d8ed570df65218601cd2a9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message:", payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png", // Large icon (notification body)
    badge: "/notification-icon.png", // Small status bar icon
    vibrate: [200, 100, 200],
    data: payload.fcmOptions,
  });
});
