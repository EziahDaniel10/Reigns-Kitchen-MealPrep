import { Router } from 'express';
import { db } from '@workspace/db';
import { contactEnquiriesTable } from '@workspace/db/schema';
import { getResendClient } from '../lib/resend.js';

const router = Router();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message) {
      res.status(400).json({ success: false, error: 'Name and message are required' });
      return;
    }

    const [enquiry] = await db.insert(contactEnquiriesTable).values({
      name: String(name).trim(),
      email: email ? String(email).trim() : null,
      phone: phone ? String(phone).trim() : null,
      message: String(message).trim(),
    }).returning();

    const ownerEmail = process.env.OWNER_EMAIL;
    if (ownerEmail) {
      try {
        const { client, fromEmail } = getResendClient();
        await client.emails.send({
          from: `Reigns Kitchen <${fromEmail}>`,
          to: [ownerEmail],
          subject: `📩 New Enquiry from ${name}`,
          html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5dc;margin:0;padding:20px;">
            <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
              <div style="background:#1a2235;padding:20px 24px;">
                <h2 style="color:#FFD700;margin:0;font-size:18px;">📩 New Website Enquiry</h2>
              </div>
              <div style="padding:20px 24px;">
                <p><strong>Name:</strong> ${name}</p>
                ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p style="margin-top:12px;"><strong>Message:</strong></p>
                <div style="background:#f9f7f0;padding:12px;border-radius:8px;font-size:14px;">${String(message).replace(/\n/g, '<br/>')}</div>
              </div>
            </div>
          </body></html>`,
        });
      } catch (err) {
        console.error('Contact notification email failed:', err);
      }
    }

    res.json({ success: true, id: enquiry.id });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
});

export default router;
