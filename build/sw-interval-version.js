console.log("sw.js start");

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("setHourlyNotification");
  if (Notification.permission === "granted") {
    setHourlyNotification();
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

const getStartOfWeek = (date) => {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(currentDate.setDate(diff));
  return monday.toISOString().split("T")[0];
};

async function fetchCheckTodayNews() {
  try {
    const date = new Date().toISOString().split("T")[0];
    const weekStartDate = getStartOfWeek(date);
    const year = new Date(weekStartDate).getFullYear();
    const url = `https://api.github.com/repos/hochan222/stock-news/contents/build/news/${year}/${weekStartDate}.json`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("response data:", data, data[date], data[date] ? true : false);
    return data[date] ? true : false;
  } catch (error) {}
  return false;
}

async function setHourlyNotification() {
  const today = new Date().toISOString().split("T")[0];
  const cacheName = "hourly-notification";

  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(today);
  //   if (cachedResponse) return;

  console.log("aa", today, cacheName, cachedResponse);

  try {
    const isNewPublish = await fetchCheckTodayNews();
    console.log("isNewPublish", isNewPublish);
    if (isNewPublish) {
      // Cache the notification so it's only shown once per day
      cache.put(today, new Response("notified"));
      showNotification();
    }
  } catch (error) {
    console.error("Error fetching the news JSON:", error);
  }
}

function showNotification() {
  console.log("showNotification");
  self.registration.showNotification("오늘의 경제 뉴스", {
    body: "호찬이가 정리한 새로운 뉴스를 확인하세요!",
    icon: "https://hochan222.github.io/stock-news/build/icon.webp",
    badge: "https://hochan222.github.io/stock-news/build/icon.webp",
    tag: 'stock-news',
    renotify: true,
    lang: "ko-KR",
    timeStamp: Date.now(),
    vibrate: [200, 100, 200, 100, 200],
    dir: "ltr",
    data: {
      url: "https://hochan222.github.io/stock-news/build/",
    },
  });
}

// Trigger hourly notification check
setInterval(() => {
  if (Notification.permission === "granted") {
    console.log("setHourlyNotification");
    setHourlyNotification();
  }
}, 60 * 60 * 1000); // 1 hour

// setInterval(() => {
//   if (Notification.permission === "granted") {
//     console.log("setHourlyNotification");
//     setHourlyNotification();
//   }
// }, 5000); // 1 hour

