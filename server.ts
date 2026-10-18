import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './src/server/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'atelier-admin-session-token-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'atelier2026';

app.use(express.json());

// Simple Auth Middleware for Admin Routes
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.substring(7);
  if (token !== ADMIN_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Forbidden: Invalid admin session token' });
  }
  next();
};

/* -------------------------------------------------------------
   PUBLIC BUSINESS & SERVICES ENDPOINTS
------------------------------------------------------------- */

// Get business profile and policies
app.get('/api/business', (_req, res) => {
  const settings = storage.getSettings();
  res.json({ success: true, data: settings });
});

// Update business settings (Admin)
app.put('/api/business', requireAdminAuth, (req, res) => {
  try {
    const updated = storage.updateSettings(req.body);
    res.json({ success: true, data: updated, message: 'Business settings updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings.' });
  }
});

// Get active services
app.get('/api/services', (_req, res) => {
  const services = storage.getServices(true);
  res.json({ success: true, data: services });
});

// Get all services including inactive (Admin)
app.get('/api/admin/services', requireAdminAuth, (_req, res) => {
  const services = storage.getServices(false);
  res.json({ success: true, data: services });
});

// Create/Update service (Admin)
app.post('/api/admin/services', requireAdminAuth, (req, res) => {
  try {
    const { name, category, durationMinutes, price, description, highlights, active, image } = req.body;
    if (!name || !durationMinutes || price === undefined) {
      return res.status(400).json({ error: 'Name, duration, and price are required.' });
    }
    const service = storage.saveService({
      id: req.body.id || `srv-${Date.now()}`,
      name,
      category: category || 'General',
      durationMinutes: Number(durationMinutes),
      bufferMinutes: req.body.bufferMinutes ? Number(req.body.bufferMinutes) : 15,
      price: Number(price),
      description: description || '',
      highlights: Array.isArray(highlights) ? highlights : [],
      active: active !== undefined ? Boolean(active) : true,
      image: image || undefined,
    });
    res.json({ success: true, data: service });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete service (Admin)
app.delete('/api/admin/services/:id', requireAdminAuth, (req, res) => {
  const deleted = storage.deleteService(req.params.id);
  res.json({ success: deleted });
});

// Get staff list
app.get('/api/staff', (_req, res) => {
  const staff = storage.getStaff(true);
  res.json({ success: true, data: staff });
});

// Admin get all staff
app.get('/api/admin/staff', requireAdminAuth, (_req, res) => {
  const staff = storage.getStaff(false);
  res.json({ success: true, data: staff });
});

// Admin save staff
app.post('/api/admin/staff', requireAdminAuth, (req, res) => {
  try {
    const { id, name, title, bio, specialties, assignedServiceIds, activeDays, active } = req.body;
    if (!name || !title) {
      return res.status(400).json({ error: 'Name and title are required.' });
    }
    const member = storage.saveStaff({
      id: id || `stf-${Date.now()}`,
      name,
      title,
      bio: bio || '',
      specialties: Array.isArray(specialties) ? specialties : [],
      assignedServiceIds: Array.isArray(assignedServiceIds) ? assignedServiceIds : [],
      activeDays: Array.isArray(activeDays) ? activeDays : [1, 2, 3, 4, 5],
      active: active !== undefined ? Boolean(active) : true,
    });
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin delete staff
app.delete('/api/admin/staff/:id', requireAdminAuth, (req, res) => {
  const deleted = storage.deleteStaff(req.params.id);
  res.json({ success: deleted });
});

// Get weekly schedule and closures
app.get('/api/schedule', (_req, res) => {
  res.json({
    success: true,
    data: {
      weekly: storage.getSchedule(),
      holidays: storage.getHolidays(),
      blockedSlots: storage.getBlockedSlots(),
    },
  });
});

// Update weekly schedule (Admin)
app.put('/api/admin/schedule', requireAdminAuth, (req, res) => {
  try {
    const updated = storage.updateSchedule(req.body.weekly);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add holiday closure (Admin)
app.post('/api/admin/holidays', requireAdminAuth, (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason) return res.status(400).json({ error: 'Date and reason are required.' });
    const holiday = storage.addHoliday({ id: `hol-${Date.now()}`, date, reason });
    res.json({ success: true, data: holiday });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete holiday (Admin)
app.delete('/api/admin/holidays/:id', requireAdminAuth, (req, res) => {
  const deleted = storage.deleteHoliday(req.params.id);
  res.json({ success: deleted });
});

// Add blocked slot (Admin)
app.post('/api/admin/blocked-slots', requireAdminAuth, (req, res) => {
  try {
    const { date, startTime, endTime, staffId, reason } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).json({ error: 'Date, start and end times required.' });
    const block = storage.addBlockedSlot({
      id: `blk-${Date.now()}`,
      date,
      startTime,
      endTime,
      staffId: staffId || undefined,
      reason: reason || 'Reserved time',
    });
    res.json({ success: true, data: block });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete blocked slot (Admin)
app.delete('/api/admin/blocked-slots/:id', requireAdminAuth, (req, res) => {
  const deleted = storage.deleteBlockedSlot(req.params.id);
  res.json({ success: deleted });
});

/* -------------------------------------------------------------
   BOOKING & AVAILABILITY ENGINE
------------------------------------------------------------- */

// Calculate live available slots
app.get('/api/availability', (req, res) => {
  const { date, serviceId, staffId } = req.query;
  if (!date || !serviceId) {
    return res.status(400).json({ error: 'Date and serviceId query parameters are required.' });
  }

  const result = storage.getAvailableSlots(
    String(date),
    String(serviceId),
    staffId ? String(staffId) : undefined
  );
  res.json({ success: true, ...result });
});

// Create appointment (Atomic Concurrency-safe)
app.post('/api/appointments', (req, res) => {
  try {
    const { serviceId, staffId, date, time, customerName, customerEmail, customerPhone, notes } = req.body;

    if (!serviceId || !date || !time || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        error: 'Missing required booking details (service, date, time, name, email, phone).',
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Concurrency-safe creation
    const result = storage.createAppointmentAtomic({
      serviceId,
      staffId: staffId || 'any',
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    if (!result.success) {
      return res.status(409).json({ error: result.error || 'Failed to book slot.' });
    }

    res.status(201).json({
      success: true,
      data: result.appointment,
      message: 'Appointment successfully confirmed and scheduled.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error creating appointment.' });
  }
});

// Lookup appointment by reference and email or phone
app.get('/api/appointments/lookup', (req, res) => {
  const { reference, contact } = req.query;
  if (!reference || !contact) {
    return res.status(400).json({ error: 'Booking reference and contact verification required.' });
  }

  const appt = storage.getAppointmentByReference(String(reference));
  if (!appt) {
    return res.status(404).json({ error: 'No appointment found with that reference number.' });
  }

  const normContact = String(contact).trim().toLowerCase();
  const emailMatch = appt.customerEmail.toLowerCase() === normContact;
  const phoneMatch = appt.customerPhone.replace(/\D/g, '').endsWith(normContact.replace(/\D/g, ''));

  if (!emailMatch && !phoneMatch) {
    return res.status(403).json({ error: 'Verification failed. Email or phone does not match this booking.' });
  }

  const settings = storage.getSettings();
  const apptDateTime = new Date(`${appt.date}T${appt.time}:00`);
  const hoursUntil = (apptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const canModify = appt.status === 'confirmed' && hoursUntil >= (settings.cancellationWindowHours || 24);

  res.json({
    success: true,
    data: {
      ...appt,
      canModify,
      hoursUntilAppointment: Math.round(hoursUntil * 10) / 10,
      policyWindowHours: settings.cancellationWindowHours,
    },
  });
});

// Reschedule appointment
app.post('/api/appointments/:reference/reschedule', (req, res) => {
  const { reference } = req.params;
  const { contact, newDate, newTime, staffId } = req.body;

  if (!contact || !newDate || !newTime) {
    return res.status(400).json({ error: 'Contact verification, new date, and new time are required.' });
  }

  const result = storage.rescheduleAppointment(reference, contact, newDate, newTime, staffId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    data: result.appointment,
    message: 'Your appointment has been successfully rescheduled.',
  });
});

// Cancel appointment
app.post('/api/appointments/:reference/cancel', (req, res) => {
  const { reference } = req.params;
  const { contact, reason } = req.body;

  if (!contact) {
    return res.status(400).json({ error: 'Contact verification is required.' });
  }

  const result = storage.cancelAppointment(reference, contact, reason || 'Customer requested cancellation');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    data: result.appointment,
    message: 'Your appointment has been cancelled in accordance with our policy.',
  });
});

// Get email message for an appointment (shows appointment number, date, time, location link, status)
app.get('/api/appointments/:reference/email', (req, res) => {
  const { reference } = req.params;
  const appt = storage.getAppointmentByReference(reference);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const logs = storage.getNotificationLogs().filter((l) => l.appointmentReference === appt.reference);
  const latestLog = logs[0] || null;

  const settings = storage.getSettings();

  res.json({
    success: true,
    data: {
      appointmentNumber: appt.reference,
      status: appt.status,
      date: appt.date,
      time: `${appt.time} - ${appt.endTime}`,
      locationLink: settings.googleMapsUrl,
      hospitalName: settings.name,
      hospitalAddress: `${settings.address.street}, ${settings.address.city}, ${settings.address.state} - ${settings.address.postalCode}`,
      patientName: appt.customerName,
      patientEmail: appt.customerEmail,
      patientPhone: appt.customerPhone,
      doctorName: appt.staffName,
      department: appt.serviceName,
      notification: latestLog,
    },
  });
});

// Re-send or trigger patient email message
app.post('/api/appointments/:reference/resend-email', async (req, res) => {
  try {
    const { reference } = req.params;
    const { targetEmail } = req.body;

    const appt = storage.getAppointmentByReference(reference);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (targetEmail) {
      appt.customerEmail = targetEmail.trim();
    }

    const { dispatchPatientEmail } = await import('./src/server/email');
    const settings = storage.getSettings();
    const type = appt.status === 'cancelled' ? 'cancellation' : 'booking_confirmation';

    const log = await dispatchPatientEmail(appt, settings, type);
    storage.logNotification(log);

    res.json({
      success: true,
      message: `Email message successfully dispatched to ${appt.customerEmail} with appointment number #${appt.reference}, date, time, location link, and status: ${appt.status.toUpperCase()}.`,
      data: log,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch email' });
  }
});

/* -------------------------------------------------------------
   ADMIN AUTHENTICATION & MANAGEMENT
------------------------------------------------------------- */

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      user: { role: 'owner', name: 'Atelier Director' },
    });
  }

  res.status(401).json({ error: 'Invalid administrator password.' });
});

// Admin list appointments with filtering & stats
app.get('/api/admin/appointments', requireAdminAuth, (req, res) => {
  const { status, serviceId, staffId, startDate, endDate } = req.query;
  const appointments = storage.getAppointments({
    status: status ? String(status) : undefined,
    serviceId: serviceId ? String(serviceId) : undefined,
    staffId: staffId ? String(staffId) : undefined,
    startDate: startDate ? String(startDate) : undefined,
    endDate: endDate ? String(endDate) : undefined,
  });

  const all = storage.getAppointments();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = all.filter((a) => a.date === todayStr && a.status !== 'cancelled');
  const upcoming = all.filter((a) => a.date >= todayStr && a.status === 'confirmed');
  const completed = all.filter((a) => a.status === 'completed');
  const totalRevenue = all
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

  res.json({
    success: true,
    data: appointments,
    stats: {
      totalBookings: all.length,
      todayCount: todayAppts.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      totalRevenue,
    },
  });
});

// Admin update appointment status
app.put('/api/admin/appointments/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['confirmed', 'pending', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = storage.updateAppointmentStatus(id, status, reason);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  res.json({ success: true, data: updated });
});

// Admin notifications log
app.get('/api/admin/notifications', requireAdminAuth, (_req, res) => {
  res.json({
    success: true,
    data: storage.getNotificationLogs(),
    info: {
      mode: 'audit_preview_active',
      notice:
        'Development Notification Engine active. Emails are captured to this audit trail and rendered in real-time. For live external SMTP/SendGrid delivery, configure credentials in .env.',
    },
  });
});

// Owner setup checklist endpoint
app.get('/api/setup-checklist', (_req, res) => {
  const settings = storage.getSettings();
  const services = storage.getServices(false);
  const staff = storage.getStaff(false);

  const items = [
    {
      id: 'maps-check',
      title: 'Google Maps Shortlink Inaccessibility Notice',
      status: 'warning',
      description:
        'The provided Google Maps link (https://maps.app.goo.gl/CVybxwKpQZ2rLeEq81) resolved to a 404/Dynamic Link Not Found. Default placeholders have been created and are ready for verification.',
      actionNeeded: 'Update your official business name, address, and Google Maps URL in the Admin Settings tab.',
    },
    {
      id: 'business-profile',
      title: 'Business Profile & Contact Information',
      status: settings.configuredByOwner ? 'verified' : 'configured_default',
      description: `Current: ${settings.name} (${settings.category}), ${settings.address.city}`,
    },
    {
      id: 'services-check',
      title: 'Services & Pricing Catalog',
      status: services.length > 0 ? 'verified' : 'pending',
      description: `${services.length} active treatments configured with durations and prices.`,
    },
    {
      id: 'staff-check',
      title: 'Staff Specialists & Schedules',
      status: staff.length > 0 ? 'verified' : 'pending',
      description: `${staff.length} practitioners registered with assigned treatments.`,
    },
    {
      id: 'policies-check',
      title: 'Booking & Cancellation Policies',
      status: 'verified',
      description: `${settings.cancellationWindowHours}h advance notice required. Buffer time: ${settings.bufferMinutes}m.`,
    },
    {
      id: 'notifications-check',
      title: 'Email Notification Delivery',
      status: process.env.SMTP_HOST ? 'production_smtp' : 'dev_preview_mode',
      description: process.env.SMTP_HOST
        ? 'Live SMTP gateway connected.'
        : 'Development preview active. Confirmations log to local audit center with interactive email views.',
    },
  ];

  res.json({ success: true, items });
});

/* -------------------------------------------------------------
   DEVELOPMENT / PRODUCTION SERVING
------------------------------------------------------------- */

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Atelier Nova] Full-stack business server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
