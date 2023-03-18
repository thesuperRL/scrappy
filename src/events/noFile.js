import { postEphemeral } from "../lib/api-utils.js";
import { t } from "../lib/transcript.js";
import fetch from "node-fetch";

export default async ({ event }) => {
  const { channel, ts, user, text } = event;
  await Promise.all([
    app.chat.delete({ channel, ts }),
    postEphemeral(channel, t("messages.delete", { text }), user),
  ]);
};

export const noFileCheck = async ({ message, next }) => {
  if (
    !message.subtype &&
    !message.thread_ts &&
    message.channel == process.env.CHANNEL
  )
    await next();
};