// Fire-and-forget forwarder to the external Google Apps Script webhook
// WEBHOOK_URL: endpoint qui relaie les messages WhatsApp (UltraMsg)
export const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzykQu_pL6zhCByXPsP99XbqoDBdmk1vDSZmQHHnC8vWOAUMcGCrr7ZXnTw1C6D8DDp/exec';

export function sendWebhook(event: string, payload: Record<string, unknown>) {
  try {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        event,
        sent_at: new Date().toISOString(),
        ...payload,
      }),
    }).catch((err) => console.warn('Webhook forward failed:', err));
  } catch (err) {
    console.warn('Webhook error:', err);
  }
}
