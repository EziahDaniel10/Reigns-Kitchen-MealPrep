import { Router } from 'express';

const router = Router();

function getRecipients() {
  const recipients: { phone: string; apikey: string }[] = [];
  let i = 1;
  while (process.env[`CALLMEBOT_PHONE_${i}`]) {
    recipients.push({
      phone: process.env[`CALLMEBOT_PHONE_${i}`]!,
      apikey: process.env[`CALLMEBOT_APIKEY_${i}`]!,
    });
    i++;
  }
  return recipients;
}

async function sendWhatsApp(phone: string, apikey: string, message: string): Promise<boolean> {
  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderBody {
  customerName: string;
  customerPhone: string;
  deliveryType: string;
  note?: string;
  items: OrderItem[];
  total: string;
}

function formatOrderMessage(order: OrderBody & { orderNumber: string }): string {
  const { customerName, customerPhone, deliveryType, items, total, note, orderNumber } = order;

  const itemList = items
    .map(item => `• ${item.name} x${item.qty} — $${(item.price * item.qty).toFixed(2)}`)
    .join('\n');

  return [
    `🍽️ NEW ORDER — Reigns Kitchen`,
    `━━━━━━━━━━━━━━━━━━`,
    `🔖 Order #${orderNumber}`,
    `👤 Customer: ${customerName}`,
    `📞 Phone: ${customerPhone}`,
    `🚗 ${deliveryType}`,
    `━━━━━━━━━━━━━━━━━━`,
    `ORDER DETAILS:`,
    itemList,
    `━━━━━━━━━━━━━━━━━━`,
    `💰 TOTAL: $${total}`,
    note ? `📝 Note: ${note}` : '',
    `━━━━━━━━━━━━━━━━━━`,
    `Reply to confirm with customer.`,
  ].filter(Boolean).join('\n');
}

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RK-${dateStr}-${rand}`;
}

router.post('/send-order', async (req, res) => {
  try {
    const body = req.body as OrderBody;
    const order = { ...body, orderNumber: generateOrderNumber() };

    if (!order.customerName || !order.customerPhone || !order.items?.length) {
      res.status(400).json({ success: false, error: 'Missing required order fields' });
      return;
    }

    const message = formatOrderMessage(order);
    const recipients = getRecipients();

    if (recipients.length === 0) {
      res.status(500).json({ success: false, error: 'No WhatsApp recipients configured' });
      return;
    }

    const results = await Promise.all(
      recipients.map(r => sendWhatsApp(r.phone, r.apikey, message))
    );

    const allSent = results.every(r => r === true);

    res.json({
      success: allSent,
      orderNumber: order.orderNumber,
      message: allSent
        ? 'Order received! We will confirm shortly.'
        : 'Order placed but notification partially failed.',
    });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, error: 'Failed to process order' });
  }
});

export default router;
