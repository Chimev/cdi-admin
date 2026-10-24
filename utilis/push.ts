import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import Notification from "@/utilis/models/Notification";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, any>;
};

export async function sendPushToAll({ title, body, data = {} }: PushPayload) {
  await connectToDB();

  const users = await User.find({ pushTokens: { $exists: true, $ne: [] } })
    .select("pushTokens")
    .lean();

  const tokens = [...new Set(users.flatMap((u: any) => u.pushTokens))].filter(
    (t) => Expo.isExpoPushToken(t)
  );

  console.log(`Push: sending "${title}" to ${tokens.length} device(s)`);

  if (tokens.length === 0) return { sent: 0 };

  const messages: ExpoPushMessage[] = tokens.map((to) => ({
    to,
    title,
    body,
    data,
    sound: "default",
    channelId: "announcements",
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const deadTokens: string[] = [];
  let failed = 0;

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket, i) => {
        if (ticket.status === "error") {
          failed++;
          console.error("Push ticket error:", ticket.details?.error, ticket.message);
          if (ticket.details?.error === "DeviceNotRegistered") {
            deadTokens.push(chunk[i].to as string);
          }
        }
      });
    } catch (error) {
      console.error("Push chunk error:", error);
      failed += chunk.length;
    }
  }

  if (deadTokens.length > 0) {
    await User.updateMany({}, { $pull: { pushTokens: { $in: deadTokens } } });
  }

  console.log(`Push: ${tokens.length - failed} accepted, ${failed} failed`);

  return { sent: tokens.length - failed };
}

type NotifyPayload = PushPayload & {
  type: "General Broadcast" | "Event Reminder" | "SFD Update" | "Testimony";
};

// Sends to every phone AND saves it to history (shown in the app's inbox)
export async function notifyAll({ title, body, data = {}, type }: NotifyPayload) {
  let status = "sent";
  let sentCount = 0;

  try {
    const result = await sendPushToAll({ title, body, data });
    sentCount = result.sent;
    if (sentCount === 0) status = "no-recipients";
  } catch (error) {
    console.error("Push error:", error);
    status = "failed";
  }

  const record = await Notification.create({
    title,
    message: body,
    type,
    status,
    sentCount,
    data,
  });

  return { status, sentCount, record };
}