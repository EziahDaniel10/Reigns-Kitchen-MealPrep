import { Router } from 'express';
import { getResendClient } from '../lib/resend.js';

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
    const body = await response.text();
    console.log(`WhatsApp → +${phone}: status=${response.status} body=${body.slice(0, 120)}`);
    return response.ok;
  } catch (err) {
    console.error(`WhatsApp → +${phone}: FAILED`, err);
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
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  deliveryFee?: number;
  tax?: number;
  allergies?: string;
  deliveryType: string;
  note?: string;
  items: OrderItem[];
  total: string;
}

function formatOrderMessage(order: OrderBody & { orderNumber: string }): string {
  const { customerName, customerPhone, customerEmail, deliveryAddress, deliveryDate, deliveryWindow, deliveryFee, tax, allergies, deliveryType, items, note, orderNumber } = order;

  const itemList = items
    .map(item => {
      const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
      const qty = parseInt(String(item.qty), 10);
      const lineTotal = (price * qty).toFixed(2);
      return `• ${item.name} x${qty} — $${lineTotal}`;
    })
    .join('\n');

  const itemsSubtotal = items.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(String(item.qty), 10);
    return sum + (price * qty);
  }, 0);

  const fee = deliveryFee ?? 0;
  const taxAmt = tax ?? 0;
  const grandTotal = (itemsSubtotal + fee + taxAmt).toFixed(2);
  const isPickup = deliveryType === 'Pickup';

  return [
    `🍽️ NEW ORDER — Reigns Kitchen`,
    `━━━━━━━━━━━━━━━━━━`,
    `🔖 Order #${orderNumber}`,
    `👤 Name: ${customerName}`,
    `📞 Phone: ${customerPhone}`,
    customerEmail ? `📧 Email: ${customerEmail}` : '',
    `━━━━━━━━━━━━━━━━━━`,
    isPickup ? `🏪 PICKUP ORDER` : `🚗 DELIVERY — Friday`,
    !isPickup && deliveryAddress ? `📍 Address: ${deliveryAddress}` : '',
    !isPickup && deliveryDate ? `📅 Date: ${deliveryDate}` : '',
    !isPickup && deliveryWindow ? `🕐 Window: ${deliveryWindow}` : '',
    `━━━━━━━━━━━━━━━━━━`,
    `ORDER:`,
    itemList,
    `━━━━━━━━━━━━━━━━━━`,
    `🧾 Subtotal: $${itemsSubtotal.toFixed(2)}`,
    isPickup ? `🏪 Pickup: Free` : `🚗 Delivery: $${fee.toFixed(2)}`,
    `💵 Tax (6%): $${taxAmt.toFixed(2)}`,
    `💰 TOTAL: $${grandTotal}`,
    allergies ? `⚠️ Allergies: ${allergies}` : '',
    note ? `📝 Note: ${note}` : '',
    `━━━━━━━━━━━━━━━━━━`,
  ].filter(Boolean).join('\n');
}

function buildOwnerEmailHtml(order: OrderBody & { orderNumber: string }): string {
  const { customerName, customerPhone, customerEmail, deliveryAddress, deliveryDate, deliveryWindow, deliveryFee, tax, allergies, deliveryType, items, note, orderNumber } = order;

  const itemRows = items.map(item => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(String(item.qty), 10);
    return `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;">${item.name}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;text-align:center;">x${qty}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;text-align:right;">$${(price * qty).toFixed(2)}</td>
    </tr>`;
  }).join('');

  const itemsTotal = items.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(String(item.qty), 10);
    return sum + price * qty;
  }, 0);
  const fee = deliveryFee ?? 0;
  const taxAmt = tax ?? 0;
  const grandTotal = (itemsTotal + fee + taxAmt).toFixed(2);
  const isPickup = deliveryType === 'Pickup';

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5dc;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a2235;padding:24px 28px;">
      <h1 style="color:#FFD700;font-size:20px;margin:0;">🍽️ New Order — Reigns Kitchen</h1>
      <p style="color:#fff;opacity:0.7;margin:4px 0 0;font-size:13px;">Order #${orderNumber}</p>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:5px 0;color:#666;font-size:13px;">👤 Name</td><td style="padding:5px 0;font-weight:600;">${customerName}</td></tr>
        <tr><td style="padding:5px 0;color:#666;font-size:13px;">📞 Phone</td><td style="padding:5px 0;font-weight:600;">${customerPhone}</td></tr>
        ${customerEmail ? `<tr><td style="padding:5px 0;color:#666;font-size:13px;">📧 Email</td><td style="padding:5px 0;font-weight:600;">${customerEmail}</td></tr>` : ''}
        <tr><td style="padding:5px 0;color:#666;font-size:13px;">${isPickup ? '🏪 Type' : '🚗 Type'}</td><td style="padding:5px 0;font-weight:600;">${isPickup ? 'Pickup' : 'Friday Delivery'}</td></tr>
        ${!isPickup && deliveryAddress ? `<tr><td style="padding:5px 0;color:#666;font-size:13px;">📍 Address</td><td style="padding:5px 0;font-weight:600;">${deliveryAddress}</td></tr>` : ''}
        ${!isPickup && deliveryDate ? `<tr><td style="padding:5px 0;color:#666;font-size:13px;">📅 Delivery Date</td><td style="padding:5px 0;font-weight:600;">${deliveryDate}</td></tr>` : ''}
        ${!isPickup && deliveryWindow ? `<tr><td style="padding:5px 0;color:#666;font-size:13px;">🕐 Window</td><td style="padding:5px 0;font-weight:600;">${deliveryWindow}</td></tr>` : ''}
      </table>
      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#1a2235;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:8px 0 0;color:#666;">Subtotal</td>
          <td style="padding:8px 0 0;text-align:right;color:#666;">$${itemsTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0 0;color:#666;">${isPickup ? 'Pickup' : 'Delivery Fee'}</td>
          <td style="padding:4px 0 0;text-align:right;color:#666;">${isPickup ? 'Free' : `$${fee.toFixed(2)}`}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0 0;color:#666;">Tax (6%)</td>
          <td style="padding:4px 0 0;text-align:right;color:#666;">$${taxAmt.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 0 0;font-weight:700;font-size:15px;border-top:1px solid #eee;">Total</td>
          <td style="padding:8px 0 0;text-align:right;font-weight:700;font-size:15px;color:#1a2235;border-top:1px solid #eee;">$${grandTotal}</td>
        </tr>
      </table>
      ${allergies ? `<div style="margin-top:16px;padding:12px;background:#fff8e1;border-left:4px solid #c9a84c;border-radius:8px;font-size:13px;color:#555;">⚠️ <strong>Allergies / Special Instructions:</strong> ${allergies}</div>` : ''}
      ${note ? `<div style="margin-top:12px;padding:12px;background:#f9f7f0;border-radius:8px;font-size:13px;color:#555;">📝 <strong>Note:</strong> ${note}</div>` : ''}
    </div>
  </div>
</body></html>`;
}

function buildCustomerEmailHtml(order: OrderBody & { orderNumber: string }): string {
  const { customerName, items, orderNumber, deliveryFee, tax, deliveryDate, deliveryWindow, deliveryType } = order;

  const itemRows = items.map(item => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(String(item.qty), 10);
    return `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;">${item.name}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;text-align:center;">x${qty}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0ede4;text-align:right;">$${(price * qty).toFixed(2)}</td>
    </tr>`;
  }).join('');

  const itemsTotal2 = items.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(String(item.qty), 10);
    return sum + price * qty;
  }, 0);
  const fee2 = deliveryFee ?? 0;
  const taxAmt2 = tax ?? 0;
  const grandTotal = (itemsTotal2 + fee2 + taxAmt2).toFixed(2);
  const isPickup2 = deliveryType === 'Pickup';

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5dc;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a2235;padding:24px 28px;text-align:center;">
      <h1 style="color:#FFD700;font-size:22px;margin:0;">Reigns Kitchen</h1>
      <p style="color:#fff;opacity:0.8;margin:6px 0 0;font-size:14px;">Order Confirmation</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;margin:0 0 4px;">Hi <strong>${customerName}</strong> 👋</p>
      <p style="color:#555;font-size:14px;margin:0 0 24px;">We've received your order and will confirm via WhatsApp, phone or email shortly.</p>
      <div style="background:#f9f7f0;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Order Number</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1a2235;">#${orderNumber}</p>
      </div>
      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#1a2235;">Your Order</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:8px 0 0;color:#666;">Subtotal</td>
          <td style="padding:8px 0 0;text-align:right;color:#666;">$${itemsTotal2.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0 0;color:#666;">${isPickup2 ? 'Pickup' : 'Delivery Fee'}</td>
          <td style="padding:4px 0 0;text-align:right;color:#666;">${isPickup2 ? 'Free' : `$${fee2.toFixed(2)}`}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0 0;color:#666;">Tax (6%)</td>
          <td style="padding:4px 0 0;text-align:right;color:#666;">$${taxAmt2.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 0 0;font-weight:700;font-size:15px;border-top:1px solid #eee;">Total</td>
          <td style="padding:8px 0 0;text-align:right;font-weight:700;font-size:15px;color:#1a2235;border-top:1px solid #eee;">$${grandTotal}</td>
        </tr>
      </table>
      <div style="margin-top:24px;padding:14px 16px;background:#f0f9f4;border-radius:8px;font-size:13px;color:#2d6a4f;">
        ${isPickup2
          ? '🏪 <strong>Pickup Order</strong> — We\'ll send you the pickup address and ready-time via WhatsApp after confirming your order.'
          : `📅 <strong>Delivery Date:</strong> ${deliveryDate || 'Friday (to be confirmed)'}<br/>${deliveryWindow ? `🕐 <strong>Window:</strong> ${deliveryWindow}<br/>` : ''}We'll be in touch to confirm your delivery details!`
        }
      </div>
    </div>
    <div style="padding:16px 28px;background:#f9f7f0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">Reigns Kitchen · Chef-Crafted Meal Prep</p>
    </div>
  </div>
</body></html>`;
}

async function sendEmails(order: OrderBody & { orderNumber: string }): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn('OWNER_EMAIL not set — skipping email notifications');
    return;
  }

  try {
    const { client, fromEmail } = getResendClient();
    const from = `Reigns Kitchen <${fromEmail}>`;

    // Owner backup notification (always sent)
    const ownerPromise = client.emails.send({
      from,
      to: [ownerEmail],
      subject: `🍽️ New Order #${order.orderNumber} — ${order.customerName}`,
      html: buildOwnerEmailHtml(order),
    });

    // Customer confirmation (only if they provided an email)
    const customerPromise = order.customerEmail
      ? client.emails.send({
          from,
          to: [order.customerEmail],
          subject: `Your Reigns Kitchen Order is Confirmed! #${order.orderNumber}`,
          html: buildCustomerEmailHtml(order),
        })
      : Promise.resolve(null);

    const [ownerResult, customerResult] = await Promise.all([ownerPromise, customerPromise]);
    console.log('Owner email sent:', ownerResult);
    if (customerResult) console.log('Customer email sent:', customerResult);
  } catch (err) {
    // Email errors are non-fatal — WhatsApp is the primary channel
    console.error('Email send error:', err);
  }
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

    // Send WhatsApp + emails in parallel
    const [whatsappResults] = await Promise.all([
      Promise.all(recipients.map(r => sendWhatsApp(r.phone, r.apikey, message))),
      sendEmails(order),
    ]);

    const allSent = whatsappResults.every(r => r === true);

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
