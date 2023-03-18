import FormData from "form-data";
import Mux from "@mux/mux-node";
import emoji from "node-emoji";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import prisma from "./prisma.js";
import channelKeywords from "./channelKeywords.js";
import emojiKeywords from "./emojiKeywords.js";
import { SEASON_EMOJI } from "./seasons.js";

export const timeout = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const execute = async (actionToExecute) => {
  return async (slackObject, ...props) => {
    await slackObject.ack();
    await functionAdd(slackObject, ...props);
  };
};

export const getNow = (tz) => {
  const date = new Date().toLocaleString("en-US", { timeZone: tz });
  return new Date(date).toISOString();
};

export const getDayFromISOString = (ISOString) => {
  const date = new Date(ISOString);
  try {
    date.setHours(date.getHours() - 4);
    ISOString = date.toISOString();
  } catch {}
  try {
    const month = ISOString.split("-")[1];
    const day = ISOString.split("-")[2].split("T")[0];
    return `${month}-${day}`;
  } catch {}
};

export const formatText = async (text) => {
  text = replaceEmoji(text).replace("&amp;", "&");
  let users = text.match(/<@U\S+>/g) || [];
  await Promise.all(
    users.map(async (u) => {
      const uID = u.substring(2, u.length - 1);
      const userRecord = await getUserRecord(uID);
      if (!userRecord) {
        app.client.users.profile
          .get({ user: u.substring(2, u.length - 1) })
          .then(({ profile }) => profile.display_name || profile.real_name)
          .then((displayName) => (text = text.replace(u, `@${displayName}`)));
      } else text = text.replace(u, `@${userRecord.username}`);
    })
  );
  let channels = text.match(/<#[^|>]+\|\S+>/g) || [];
  channels.forEach(async (channel) => {
    const channelName = channel.split("|")[1].replace(">", "");
    text = text.replace(channel, `#${channelName}`);
  });
  return text;
};

export const getUrlFromString = (str) => {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  let url = str.match(urlRegex)[0];
  if (url.includes("|")) url = url.split("|")[0];
  if (url.startsWith("<")) url = url.substring(1, url.length - 1);
  return url;
};
