// Fire-and-forget forwarder to the external Google Apps Script webhook
const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzxS012mpI3ptNDe4mFzm6uw0AEkIVtgxWzCacKn7qgX3Tm4L36z-lWWdGBxOGYF-Iv/exec';

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
