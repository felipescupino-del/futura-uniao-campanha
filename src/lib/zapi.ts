import axios from 'axios';

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID!;
const INSTANCE_TOKEN = process.env.ZAPI_INSTANCE_TOKEN!;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN!;
const BASE_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${INSTANCE_TOKEN}`;

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  imageUrl?: string | null,
  mediaType?: string | null,
  delayTypingSeconds = 2,
): Promise<void> {
  if (imageUrl && mediaType === 'video') {
    // Send video with caption
    await axios.post(
      `${BASE_URL}/send-video`,
      {
        phone,
        video: imageUrl,
        caption: message,
      },
      {
        headers: { 'Client-Token': CLIENT_TOKEN },
        timeout: 60_000,
      },
    );
  } else if (imageUrl) {
    // Send image with caption
    await axios.post(
      `${BASE_URL}/send-image`,
      {
        phone,
        image: imageUrl,
        caption: message,
      },
      {
        headers: { 'Client-Token': CLIENT_TOKEN },
        timeout: 30_000,
      },
    );
  } else {
    // Send text only
    await axios.post(
      `${BASE_URL}/send-text`,
      {
        phone,
        message,
        delayTyping: delayTypingSeconds,
      },
      {
        headers: { 'Client-Token': CLIENT_TOKEN },
        timeout: 20_000,
      },
    );
  }
}
