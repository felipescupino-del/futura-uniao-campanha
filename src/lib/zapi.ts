import axios from 'axios';

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID!;
const INSTANCE_TOKEN = process.env.ZAPI_INSTANCE_TOKEN!;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN!;

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  delayTypingSeconds = 2,
): Promise<void> {
  await axios.post(
    `https://api.z-api.io/instances/${INSTANCE_ID}/token/${INSTANCE_TOKEN}/send-text`,
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
