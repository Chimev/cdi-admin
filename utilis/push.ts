import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";

const expo = new Expo();

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, any>; // tells the app where to go when tapped
};

// Sends a notification to every member's phone. Returns how many were sent.
export async function sendPushToAll({ title, body, data = {} }: PushPayload) {
  await connectToDB();

  const users = await User.find({ pushTokens: { $exists: true, $ne: [] } })
    .select("pushTokens")
    .lean();

  // One message per unique, valid token
  const tokens = [...new Set(users.flatMap((u: any) => u.pushTokens))].filter(
    (t) => Expo.isExpoPushToken(t)
  );

  if (tokens.length === 0) return { sent: 0 };

  const messages: ExpoPushMessage[] = tokens.map((to) => ({
    to,
    title,
    body,
    data,
    sound: "default",
    channelId: "announcements",
  }));

  // Expo accepts up to 100 per request, so send in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const deadTokens: string[] = [];

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket, i) => {
        if (
          ticket.status === "error" &&
          ticket.details?.error === "DeviceNotRegistered"
        ) {
          deadTokens.push(chunk[i].to as string);
        }
      });
    } catch (error) {
      console.error("Push chunk error:", error);
    }
  }

  // Clean up phones that uninstalled the app
  if (deadTokens.length > 0) {
    await User.updateMany({}, { $pull: { pushTokens: { $in: deadTokens } } });
  }

  return { sent: tokens.length - deadTokens.length };
}