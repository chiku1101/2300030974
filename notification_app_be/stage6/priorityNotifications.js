const notifications = [
  {
    ID: "1",
    Type: "Placement",
    Message: "CSSX Corporation hiring",
    Timestamp: "2026-04-22 17:51:18"
  },
  {
    ID: "2",
    Type: "Event",
    Message: "farewell",
    Timestamp: "2026-04-22 17:51:06"
  },
  {
    ID: "3",
    Type: "Result",
    Message: "mid-sem",
    Timestamp: "2026-04-22 17:51:30"
  },
  {
    ID: "4",
    Type: "Placement",
    Message: "AMD hiring",
    Timestamp: "2026-04-22 17:49:42"
  }
];

const weights = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getTopNotifications(notifications, limit = 10) {
  return notifications
    .map((notification) => ({
      ...notification,
      priority:
        weights[notification.Type] * 1000000000000 +
        new Date(notification.Timestamp).getTime()
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

const topNotifications = getTopNotifications(notifications);

console.log("Top Priority Notifications:\n");

topNotifications.forEach((notification, index) => {
  console.log(
    `${index + 1}. ${notification.Type} - ${notification.Message} - ${notification.Timestamp}`
  );
});