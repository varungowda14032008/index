import nodemailer from 'nodemailer';
import { Appointment, BusinessSettings, NotificationLog } from './types';

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log('[EmailService] Configured live SMTP transport with host:', host);
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    console.log('[EmailService] Configured live Gmail transport');
  }

  return transporter;
}

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

export function buildPatientEmail(
  appointment: Appointment,
  business: BusinessSettings,
  type: 'booking_confirmation' | 'cancellation' | 'reschedule'
): EmailPayload {
  const isConfirmed = type === 'booking_confirmation';
  const isCancelled = type === 'cancellation';
  const isRescheduled = type === 'reschedule';

  const statusText = isCancelled ? 'CANCELLED' : isRescheduled ? 'RESCHEDULED' : 'CONFIRMED';
  const statusColor = isCancelled ? '#dc2626' : '#16a34a';
  const statusBg = isCancelled ? '#fef2f2' : '#f0fdf4';

  const subject = `[${statusText}] Appointment #${appointment.reference} · ${business.name}`;

  const locationLink = business.googleMapsUrl;
  const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.state} - ${business.address.postalCode}`;

  const text = `
============================================================
${business.name.toUpperCase()} — APPOINTMENT ${statusText}
============================================================

Dear ${appointment.customerName},

Your appointment status: ${statusText}

APPOINTMENT DETAILS:
- Appointment Number: ${appointment.reference}
- Status: ${statusText}
- Date: ${appointment.date}
- Time: ${appointment.time} to ${appointment.endTime}
- Department: ${appointment.serviceName}
- Doctor: ${appointment.staffName}
- Patient Name: ${appointment.customerName}
- Phone: ${appointment.customerPhone}

LOCATION & DIRECTIONS:
- Hospital Address: ${fullAddress}
- Google Maps Location Link: ${locationLink}

EMERGENCY & HELPLINE CONTACTS:
- Hospital Reception: ${business.phone}
- 24/7 Casualty Helpline: +91 85128 30995
- Email: ${business.email}

${
  isCancelled
    ? 'NOTE: This appointment has been cancelled. If this was not done by you or you wish to schedule a new consultation, please visit our website or call our front desk.'
    : 'INSTRUCTIONS: Please arrive 10 minutes prior to your allocated slot with previous medical reports and prescriptions for seamless doctor consultation.'
}

Thank you,
Aishwarya Hospital Medical Team
Vijayanagar 3rd Stage, Mysuru
============================================================
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f4; margin: 0; padding: 24px; color: #1c1917; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #1e3a8a; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe; }
    .content { padding: 32px 24px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}; margin-bottom: 20px; }
    .card { background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4; padding: 20px; margin-bottom: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0efee; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #78716c; font-weight: 500; }
    .value { color: #0c0a09; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background-color: #1d4ed8; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; margin: 12px 0; }
    .footer { background-color: #f5f5f4; padding: 20px 24px; font-size: 12px; color: #78716c; text-align: center; border-top: 1px solid #e7e5e4; }
    .alert-box { background-color: ${isCancelled ? '#fef2f2' : '#eff6ff'}; border-left: 4px solid ${isCancelled ? '#dc2626' : '#2563eb'}; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; font-size: 13px; color: #1c1917; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${business.name}</h1>
      <p>Vijayanagar 3rd Stage, Mysuru · Multi-Specialty Healthcare</p>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <div class="status-badge">Appointment ${statusText}</div>
        <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">
          ${isCancelled ? 'Your appointment has been cancelled' : 'Your consultation has been confirmed'}
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">
          Dear <strong>${appointment.customerName}</strong>, please find your complete appointment details below.
        </p>
      </div>

      <div class="card">
        <div class="row">
          <span class="label">Appointment Number</span>
          <span class="value" style="font-family: monospace; font-size: 15px; color: #1e3a8a;">${appointment.reference}</span>
        </div>
        <div class="row">
          <span class="label">Appointment Status</span>
          <span class="value" style="color: ${statusColor}; font-weight: 700;">${statusText}</span>
        </div>
        <div class="row">
          <span class="label">Appointment Date</span>
          <span class="value">${appointment.date}</span>
        </div>
        <div class="row">
          <span class="label">Appointment Time</span>
          <span class="value">${appointment.time} – ${appointment.endTime}</span>
        </div>
        <div class="row">
          <span class="label">Department</span>
          <span class="value">${appointment.serviceName}</span>
        </div>
        <div class="row">
          <span class="label">Consultant Doctor</span>
          <span class="value">${appointment.staffName}</span>
        </div>
        <div class="row">
          <span class="label">Patient Name</span>
          <span class="value">${appointment.customerName}</span>
        </div>
        <div class="row">
          <span class="label">Contact Number</span>
          <span class="value">${appointment.customerPhone}</span>
        </div>
      </div>

      <div class="alert-box">
        <strong>Hospital Address:</strong><br>
        ${fullAddress}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${locationLink}" class="btn" target="_blank" rel="noopener noreferrer">
          📍 Open Hospital in Google Maps Directions
        </a>
      </div>

      <div style="font-size: 13px; color: #4b5563; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        <p style="margin: 0 0 8px 0;"><strong>Need immediate assistance or emergency care?</strong></p>
        <p style="margin: 0 0 4px 0;">• Hospital Desk: <a href="tel:${business.phone}" style="color: #1d4ed8; font-weight: 600;">${business.phone}</a></p>
        <p style="margin: 0 0 4px 0;">• 24/7 Emergency Casualty: <a href="tel:+918512830995" style="color: #dc2626; font-weight: 700;">+91 85128 30995</a></p>
        <p style="margin: 0;">• Concierge Email: <a href="mailto:${business.email}" style="color: #1d4ed8;">${business.email}</a></p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;">Aishwarya Hospital · Vijayanagar 3rd Stage, Mysuru, Karnataka 570012</p>
      <p style="margin: 0;">This email serves as your official patient appointment record.</p>
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}

export async function dispatchPatientEmail(
  appointment: Appointment,
  business: BusinessSettings,
  type: 'booking_confirmation' | 'cancellation' | 'reschedule'
): Promise<NotificationLog> {
  const { subject, html, text } = buildPatientEmail(appointment, business, type);

  const statusText = type === 'cancellation' ? 'cancelled' : type === 'reschedule' ? 'rescheduled' : 'confirmed';

  let deliveryState: 'sent_via_smtp' | 'dev_captured_and_logged' = 'dev_captured_and_logged';
  let deliveryError: string | undefined = undefined;

  const mailer = getTransporter();
  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"${business.name}" <${business.email}>`,
        to: appointment.customerEmail,
        subject,
        text,
        html,
      });
      deliveryState = 'sent_via_smtp';
      console.log(`[EmailService] Live email successfully dispatched to ${appointment.customerEmail}`);
    } catch (err: any) {
      console.error('[EmailService] SMTP send failure:', err);
      deliveryError = err.message || 'SMTP delivery failure';
    }
  } else {
    console.log(
      `[EmailService] No SMTP credentials configured. Email captured to audit trail for ${appointment.customerEmail}`
    );
  }

  const log: NotificationLog = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    appointmentReference: appointment.reference,
    appointmentNumber: appointment.reference,
    recipient: appointment.customerEmail,
    type,
    status: statusText,
    subject,
    appointmentDate: appointment.date,
    appointmentTime: `${appointment.time} – ${appointment.endTime}`,
    locationLink: business.googleMapsUrl,
    htmlBody: html,
    textBody: text,
    previewSnippet: `[${statusText.toUpperCase()}] Appointment #${appointment.reference} for ${appointment.serviceName} on ${appointment.date} at ${appointment.time}. Google Maps link included.`,
    timestamp: new Date().toISOString(),
    deliveryState,
    error: deliveryError,
  };

  return log;
}
