import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function initNotifications(memberId) {
  try {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    // Service worker manually register karo
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await navigator.serviceWorker.ready;

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.log("No FCM token received");
      return false;
    }

    console.log("FCM Token:", token);

    // Token Supabase mein save karo
    // await supabase.from("fcm_tokens").upsert(
    //   {
    //     member_id: memberId,
    //     token: token,
    //   },
    //   { onConflict: "member_id" },
    // );

    // Token Supabase mein save karo
    // Pehle same token ka purana record delete karo
    await supabase
      .from("fcm_tokens")
      .delete()
      .eq("token", token)
      .neq("member_id", memberId);
    // Same token → different member → delete karo

    // Phir upsert karo
    await supabase.from("fcm_tokens").upsert(
      {
        member_id: memberId,
        token: token,
      },
      { onConflict: "member_id" },
    );

    // Approval ke waqt member ke paas abhi tak koi token nahi hota (wahi
    // isi function se save hota hai), isliye welcome push us waqt nahi ja
    // paata - ab token ban gaya hai to /send-welcome dobara try karo. Route
    // khud idempotent hai (welcome_push_sent/welcome_email_sent check karta
    // hai), isliye baar-baar call karna bhi safe hai
    fetch(`${import.meta.env.VITE_API_URL}/api/notifications/send-welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    }).catch((err) => console.log("Welcome notify error:", err));

    // Foreground notifications handle karo
    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);

      // Foreground mein bhi notification show karo
      if (Notification.permission === "granted") {
        const { title, body, icon } = payload.notification;
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: icon || "/icon-192.png",
            badge: "/notification-icon.png",
            vibrate: [200, 100, 200],
            data: payload.fcmOptions,
          });
        });
      }
    });

    console.log("Notifications initialized ✅");
    return true;
  } catch (error) {
    console.log("Notification init error:", error);
    return false;
  }
}

export async function sendTestNotification() {
  if (Notification.permission === "granted") {
    new Notification("AB Fitness 🏋️", {
      body: "Notifications are working! 💪",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  }
}
