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

// Backend ab data-only payload bhejta hai (koi "notification" field nahi) -
// isliye "title"/"body"/etc. payload.data se aate hain, payload.notification
// se nahi. Data-only isliye taaki browser khud auto-display na kare - warna
// ye humare showNotification() ke saath milke duplicate ban jaata tha
messaging.onBackgroundMessage((payload) => {
  console.log("Background message:", payload);

  const { title, body, icon, badge, link } = payload.data || {};

  self.registration.showNotification(title, {
    body,
    icon: icon || "/icon-192.png", // Large icon (notification body)
    badge: badge || "/notification-icon.png", // Small status bar icon
    vibrate: [200, 100, 200],
    data: { link },
  });
});

// Data-only messages FCM ka built-in click handler use nahi karte, isliye
// notification click yahan khud handle karna padta hai - already khuli
// tab ko focus karo, warna nayi tab kholo
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(link);
      }),
  );
});
