import PushSubscription from "../models/PushSubscription.js";
import { sendPushNotification } from "../utils/push.js";

/**
 * subscribeUser
 * ...
 */
export async function subscribeUser(req, res) {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }

    // Update if exists, or create new
    await PushSubscription.findOneAndUpdate(
      { "subscription.endpoint": subscription.endpoint },
      { userId, subscription },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
