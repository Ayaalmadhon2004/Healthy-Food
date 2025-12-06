// utils/notification.ts

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("هذا المتصفح لا يدعم الإشعارات");
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icons/icon-192x192.png", // استخدم أيقونتك هنا
    });
  }
};
