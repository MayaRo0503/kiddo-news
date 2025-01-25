import notifier from "node-notifier";

export function sendAlert(message: string): void {
  notifier.notify({
    title: "Crawler Alert",
    message: message,
    sound: true,
    wait: true,
  });
}
