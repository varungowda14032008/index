export interface BusinessSettings {
  id: string;
  name: string;
  tagline: string;
  category: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  googleMapsUrl: string;
  currency: string;
  timezone: string;
  bookingNoticeHours: number;
  advanceBookingDays: number;
  cancellationWindowHours: number;
  bufferMinutes: number;
  configuredByOwner: boolean;
  notesForOwner: string;
  policies: {
    cancellation: string;
    rescheduling: string;
    arrival: string;
    privacy: string;
  };
}

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  bufferMinutes: number;
  price: number;
  description: string;
  highlights: string[];
  active: boolean;
  image?: string;
  requiresConsultation?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  assignedServiceIds: string[];
  activeDays: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  active: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 0-6
  dayName: string;
  isOpen: boolean;
  openTime: string; // "08:30"
  closeTime: string; // "20:30"
}

export interface HolidayClosure {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
}

export interface BlockedSlot {
  id: string;
  staffId?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  reference: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  staffId: string;
  staffName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  endTime: string; // "HH:mm"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  appointmentReference: string;
  appointmentNumber: string;
  recipient: string;
  type: 'booking_confirmation' | 'cancellation' | 'reschedule' | 'reminder';
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  subject: string;
  appointmentDate: string;
  appointmentTime: string;
  locationLink: string;
  htmlBody: string;
  textBody: string;
  previewSnippet: string;
  timestamp: string;
  deliveryState: 'sent_via_smtp' | 'dev_captured_and_logged';
  error?: string;
}
