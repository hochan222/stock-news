console.log("sw.js version 1.0.0");

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (
    Notification.permission === "granted" &&
    "periodicSync" in self.registration
  ) {
    registerPeriodicSync();
  } else {
    console.warn("Periodic Sync not supported or permission denied");
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

function getStartOfWeek(date) {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(currentDate.setDate(diff));
  return monday.toISOString().split("T")[0];
}

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
    return data[date] ? true : false;
  } catch (error) {}
  return false;
}

async function registerPeriodicSync() {
  try {
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    const registration = await self.registration;
    if (status.state === "granted") {
      await registration.periodicSync.register("check-news-daily", {
        minInterval: 6 * 60 * 60 * 1000, // 6 hours
      });
    } else {
      console.warn("Periodic Sync not supported");
    }
  } catch (error) {
    console.error("Error during PeriodicSync registration:", error);
  }
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-news-daily") {
    event.waitUntil(setDailyNotification());
  }
});

async function setDailyNotification() {
  const today = new Date().toISOString().split("T")[0];
  const cacheName = "daily-notification";

  const cache = await caches.open(cacheName);
  const cacheKeys = await cache.keys();
  const cachedResponse = await cache.match(today);
  if (cachedResponse) return;

  try {
    const isNewPublish = await fetchCheckTodayNews();
    if (!isNewPublish) return;

    cache.put(today, new Response("notified"));
    showNotification();

    if (cacheKeys.length > 3) {
      await cache.delete(keys[0]);
    }
  } catch (error) {
    console.error("Error fetching the news JSON:", error);
  }
}

showNotification();

function showNotification() {
  self.registration.showNotification("오늘의 경제 뉴스", {
    body: "호찬이가 정리한 새로운 뉴스를 확인하세요!",
    icon: "https://hochan222.github.io/stock-news/build/icon.webp",
    badge: "https://hochan222.github.io/stock-news/build/icon.webp",
    tag: "stock-news",
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
