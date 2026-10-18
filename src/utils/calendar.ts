import { Appointment, BusinessSettings } from '../types/client';

export function generateICS(appointment: Appointment, business: BusinessSettings): string {
  const [year, month, day] = appointment.date.split('-').map(Number);
  const [startHour, startMin] = appointment.time.split(':').map(Number);
  const [endHour, endMin] = appointment.endTime.split(':').map(Number);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Format as YYYYMMDDTHHmmSS
  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startHour)}${pad(startMin)}00`;
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endHour)}${pad(endMin)}00`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const location = `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.postalCode}`;
  const description = `Appointment for ${appointment.serviceName} with ${appointment.staffName}. Reference: ${appointment.reference}. Phone: ${business.phone}. Policies: Please arrive 5-10 minutes early.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atelier Nova//Appointment Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.reference}@atelier-nova.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${appointment.serviceName} - ${business.name}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSFile(appointment: Appointment, business: BusinessSettings) {
  const icsData = generateICS(appointment, business);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `appointment-${appointment.reference}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
