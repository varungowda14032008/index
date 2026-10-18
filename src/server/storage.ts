import fs from 'fs';
import path from 'path';
import {
  BusinessSettings,
  Service,
  Staff,
  DaySchedule,
  HolidayClosure,
  BlockedSlot,
  Appointment,
  NotificationLog,
} from './types';
import { dispatchPatientEmail } from './email';

interface DatabaseSchema {
  settings: BusinessSettings;
  services: Service[];
  staff: Staff[];
  schedule: DaySchedule[];
  holidays: HolidayClosure[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
  notifications: NotificationLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'aishwarya-hospital',
  name: 'Aishwarya Hospital',
  tagline: 'Multi-Specialty Healthcare & Advanced Surgical Centre',
  category: 'Multi-Specialty Private Hospital',
  phone: '+91 821 241 0255',
  email: 'appointments@aishwaryahospitalmysore.com',
  address: {
    street: 'A-1 Block, 30, 1st Main Rd, Vijayanagar 3rd Stage',
    city: 'Mysuru (Mysore)',
    state: 'Karnataka',
    postalCode: '570012',
    country: 'India',
  },
  googleMapsUrl:
    'https://www.google.com/maps/place/Aishwarya+Hospital/@12.3232344,76.5330479,13z/data=!4m7!3m6!1s0x3baf7ae5b0000001:0x505e14303dc36cc7!8m2!3d12.3232344!4d76.6092656!15sChJIT1NQSVRBTCBJTiBNWVNPUkVaFCISaG9zcGl0YWwgaW4gbXlzb3JlkgEQcHJpdmF0ZV9ob3NwaXRhbJoBI0NoWkRTVWhOTUc5blMwVkpRMEZuU1VOaWFGcFhTbFpuRUFF4AEA-gEFCLoBEEs!16s%2Fg%2F11cn30ybhq',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  bookingNoticeHours: 1,
  advanceBookingDays: 30,
  cancellationWindowHours: 4,
  bufferMinutes: 10,
  configuredByOwner: true,
  notesForOwner:
    'Verified information extracted from Google Maps listing (Aishwarya Hospital, Vijayanagar 3rd Stage, Mysuru). All services, doctor schedules, and emergency contacts are active.',
  policies: {
    cancellation:
      'Outpatient consultations can be rescheduled or cancelled up to 4 hours prior to appointment time without fee. For emergencies, please call our 24/7 casualty desk at +91 821 241 0255.',
    rescheduling:
      'Rescheduling is free and can be performed online using your Patient Booking Reference.',
    arrival:
      'Please arrive 10 minutes prior to your OPD consultation slot with previous medical reports and prescriptions for seamless doctor review.',
    privacy:
      'Patient health records and medical consultations adhere strictly to Indian medical privacy standards and clinical confidentiality.',
  },
};

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-obgyn',
    name: 'Obstetrics & Gynecology Consultation',
    category: "Women's Health & Maternity",
    durationMinutes: 30,
    bufferMinutes: 10,
    price: 500,
    description:
      'Comprehensive women’s health consultation including antenatal care, high-risk pregnancy monitoring, ultrasound review, and laparoscopic surgical guidance by senior specialists.',
    highlights: ['Antenatal & Postnatal Care', 'Laparoscopic Surgery Evaluation', 'Ultrasound Review'],
    active: true,
    image: '/src/assets/images/maternity_patient_room_1792253079647.jpg',
  },
  {
    id: 'srv-medicine',
    name: 'General Medicine & Diabetology Consultation',
    category: 'Internal Medicine',
    durationMinutes: 25,
    bufferMinutes: 10,
    price: 450,
    description:
      'Expert diagnosis and treatment of acute fevers, respiratory infections, hypertension, diabetes management, and chronic lifestyle metabolic disorders.',
    highlights: ['HbA1c & Glucose Analysis', 'Blood Pressure Management', 'Preventive Health Advice'],
    active: true,
    image: '/src/assets/images/doctor_consultation_room_1792253078608.jpg',
  },
  {
    id: 'srv-cardiology',
    name: 'Cardiology & Preventive Heart Screening',
    category: 'Cardiovascular Care',
    durationMinutes: 30,
    bufferMinutes: 10,
    price: 700,
    description:
      'Specialist cardiovascular consultation with review of 12-lead ECG, blood pressure profiling, cholesterol risk assessment, and chest pain triage.',
    highlights: ['12-Lead ECG Analysis', 'Cardiovascular Risk Stratification', 'Lifestyle Cardiac Guidance'],
    active: true,
    image: '/src/assets/images/hospital_exterior_modern_1792253077891.jpg',
  },
  {
    id: 'srv-surgery',
    name: 'General & Laparoscopic Surgery Consultation',
    category: 'Surgical Specialties',
    durationMinutes: 30,
    bufferMinutes: 10,
    price: 600,
    description:
      'Pre-operative evaluation for minimally invasive laparoscopic procedures including gallbladder stones, hernia repair, appendix, and trauma wound care in modern modular OTs.',
    highlights: ['Minimally Invasive Assessment', 'Day-Care Surgery Options', 'Post-Op Followup'],
    active: true,
    image: '/src/assets/images/hospital_operation_theatre_1792253079363.jpg',
  },
  {
    id: 'srv-pediatrics',
    name: 'Pediatrics & Child Wellness Consultation',
    category: 'Child Health',
    durationMinutes: 25,
    bufferMinutes: 10,
    price: 450,
    description:
      'Comprehensive child healthcare, newborn growth tracking, standard vaccination schedules, and treatment of pediatric infections in a comforting environment.',
    highlights: ['Growth & Milestone Tracking', 'Vaccination Schedule', 'Nutritional Counseling'],
    active: true,
  },
  {
    id: 'srv-master-checkup',
    name: 'Comprehensive Master Health Checkup Package',
    category: 'Preventive Health Packages',
    durationMinutes: 90,
    bufferMinutes: 15,
    price: 2499,
    description:
      'Holistic full-body health audit including complete hemogram, lipid profile, liver & kidney function tests, fasting blood sugar, ECG, chest X-ray review, and physician summary.',
    highlights: ['Comprehensive Lab Panel', 'ECG & Chest X-Ray Review', 'Complete Physician Consultation'],
    active: true,
  },
];

const DEFAULT_STAFF: Staff[] = [
  {
    id: 'doc-sushma',
    name: 'Dr. Sushma V. Dev',
    title: 'Senior Consultant - Obstetrics & Gynecology (MBBS, DGO, DNB)',
    bio: 'Renowned gynecologist and obstetrician with over 15 years of surgical excellence in high-risk pregnancies, normal deliveries, and advanced laparoscopic gynecology in Mysore.',
    specialties: ['High-Risk Obstetrics', 'Laparoscopic Hysterectomy', 'Infertility Evaluation'],
    assignedServiceIds: ['srv-obgyn', 'srv-master-checkup'],
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    active: true,
  },
  {
    id: 'doc-sumangala',
    name: 'Dr. G. N. Sumangala',
    title: 'Consultant - Obstetrics & Gynecology (MBBS, MS - OBG)',
    bio: 'Dedicated women’s health expert specializing in adolescent health, maternal care, cervical screening, and preventive gynecological care.',
    specialties: ['Antenatal Care', 'PCOS Management', 'Preventive Women Health'],
    assignedServiceIds: ['srv-obgyn'],
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    active: true,
  },
  {
    id: 'doc-mahesh',
    name: 'Dr. R. K. Mahesh',
    title: 'Chief Physician - Internal Medicine & Diabetology (MBBS, MD)',
    bio: 'Senior physician with expertise in complex metabolic disorders, hypertension, diabetes care, and infectious disease management.',
    specialties: ['Diabetology', 'Hypertension', 'Geriatric & Critical Care'],
    assignedServiceIds: ['srv-medicine', 'srv-master-checkup'],
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    active: true,
  },
  {
    id: 'doc-pradeep',
    name: 'Dr. Pradeep Kumar',
    title: 'Consultant - General & Laparoscopic Surgeon (MBBS, MS)',
    bio: 'Specialist in minimally invasive single-incision and keyhole laparoscopic procedures, acute surgical emergencies, and surgical oncology.',
    specialties: ['Laparoscopic Cholecystectomy', 'Hernia Repair', 'Emergency Trauma'],
    assignedServiceIds: ['srv-surgery'],
    activeDays: [1, 2, 3, 4, 5], // Mon - Fri
    active: true,
  },
  {
    id: 'doc-arvind',
    name: 'Dr. Arvind Swamy',
    title: 'Consultant - Cardiology & Non-Invasive Diagnostics (MBBS, MD, DM)',
    bio: 'Cardiologist with specialized focus in early coronary artery disease detection, echocardiography interpretation, and preventive cardiology.',
    specialties: ['ECG & Echo Diagnostics', 'Preventive Heart Care', 'Hypertension'],
    assignedServiceIds: ['srv-cardiology', 'srv-master-checkup'],
    activeDays: [2, 3, 4, 5, 6], // Tue - Sat
    active: true,
  },
  {
    id: 'doc-kavitha',
    name: 'Dr. Kavitha Murthy',
    title: 'Consultant - Pediatrics & Neonatology (MBBS, DCH, DNB)',
    bio: 'Compassionate pediatrician focusing on newborn intensive care, childhood allergy management, and developmental milestones.',
    specialties: ['Neonatal Care', 'Pediatric Vaccination', 'Child Nutrition'],
    assignedServiceIds: ['srv-pediatrics'],
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    active: true,
  },
];

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: 'Sunday', isOpen: true, openTime: '09:00', closeTime: '14:00' },
  { dayOfWeek: 1, dayName: 'Monday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
  { dayOfWeek: 2, dayName: 'Tuesday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
  { dayOfWeek: 3, dayName: 'Wednesday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
  { dayOfWeek: 4, dayName: 'Thursday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
  { dayOfWeek: 5, dayName: 'Friday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
  { dayOfWeek: 6, dayName: 'Saturday', isOpen: true, openTime: '08:30', closeTime: '20:30' },
];

class StorageEngine {
  private memoryDb: DatabaseSchema;

  constructor() {
    this.memoryDb = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // If it was the placeholder Atelier Nova, cleanly upgrade to verified Aishwarya Hospital data
        if (parsed.settings?.name === 'Atelier Nova' || !parsed.settings?.name) {
          const initialDb: DatabaseSchema = {
            settings: DEFAULT_SETTINGS,
            services: DEFAULT_SERVICES,
            staff: DEFAULT_STAFF,
            schedule: DEFAULT_SCHEDULE,
            holidays: [],
            blockedSlots: [],
            appointments: [],
            notifications: [],
          };
          this.saveDatabaseSync(initialDb);
          return initialDb;
        }

        return {
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          services: parsed.services?.length ? parsed.services : DEFAULT_SERVICES,
          staff: parsed.staff?.length ? parsed.staff : DEFAULT_STAFF,
          schedule: parsed.schedule?.length ? parsed.schedule : DEFAULT_SCHEDULE,
          holidays: parsed.holidays || [],
          blockedSlots: parsed.blockedSlots || [],
          appointments: parsed.appointments || [],
          notifications: parsed.notifications || [],
        };
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing fresh store:', err);
    }

    const initialDb: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      services: DEFAULT_SERVICES,
      staff: DEFAULT_STAFF,
      schedule: DEFAULT_SCHEDULE,
      holidays: [],
      blockedSlots: [],
      appointments: [],
      notifications: [],
    };
    this.saveDatabaseSync(initialDb);
    return initialDb;
  }

  private saveDatabaseSync(db: DatabaseSchema) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private persist() {
    this.saveDatabaseSync(this.memoryDb);
  }

  public getSettings(): BusinessSettings {
    return this.memoryDb.settings;
  }

  public updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.memoryDb.settings = { ...this.memoryDb.settings, ...updates, configuredByOwner: true };
    this.persist();
    return this.memoryDb.settings;
  }

  public getServices(onlyActive = true): Service[] {
    if (onlyActive) {
      return this.memoryDb.services.filter((s) => s.active);
    }
    return this.memoryDb.services;
  }

  public getServiceById(id: string): Service | undefined {
    return this.memoryDb.services.find((s) => s.id === id);
  }

  public saveService(service: Service): Service {
    const idx = this.memoryDb.services.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
      this.memoryDb.services[idx] = service;
    } else {
      this.memoryDb.services.push(service);
    }
    this.persist();
    return service;
  }

  public deleteService(id: string): boolean {
    const initialLen = this.memoryDb.services.length;
    this.memoryDb.services = this.memoryDb.services.filter((s) => s.id !== id);
    if (this.memoryDb.services.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getStaff(onlyActive = true): Staff[] {
    if (onlyActive) {
      return this.memoryDb.staff.filter((st) => st.active);
    }
    return this.memoryDb.staff;
  }

  public getStaffById(id: string): Staff | undefined {
    return this.memoryDb.staff.find((st) => st.id === id);
  }

  public saveStaff(member: Staff): Staff {
    const idx = this.memoryDb.staff.findIndex((st) => st.id === member.id);
    if (idx >= 0) {
      this.memoryDb.staff[idx] = member;
    } else {
      this.memoryDb.staff.push(member);
    }
    this.persist();
    return member;
  }

  public deleteStaff(id: string): boolean {
    const initialLen = this.memoryDb.staff.length;
    this.memoryDb.staff = this.memoryDb.staff.filter((s) => s.id !== id);
    if (this.memoryDb.staff.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getSchedule(): DaySchedule[] {
    return this.memoryDb.schedule;
  }

  public updateSchedule(schedule: DaySchedule[]): DaySchedule[] {
    this.memoryDb.schedule = schedule;
    this.persist();
    return this.memoryDb.schedule;
  }

  public getHolidays(): HolidayClosure[] {
    return this.memoryDb.holidays;
  }

  public addHoliday(holiday: HolidayClosure): HolidayClosure {
    this.memoryDb.holidays.push(holiday);
    this.persist();
    return holiday;
  }

  public deleteHoliday(id: string): boolean {
    const initialLen = this.memoryDb.holidays.length;
    this.memoryDb.holidays = this.memoryDb.holidays.filter((h) => h.id !== id);
    if (this.memoryDb.holidays.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getBlockedSlots(): BlockedSlot[] {
    return this.memoryDb.blockedSlots;
  }

  public addBlockedSlot(slot: BlockedSlot): BlockedSlot {
    this.memoryDb.blockedSlots.push(slot);
    this.persist();
    return slot;
  }

  public deleteBlockedSlot(id: string): boolean {
    const initialLen = this.memoryDb.blockedSlots.length;
    this.memoryDb.blockedSlots = this.memoryDb.blockedSlots.filter((b) => b.id !== id);
    if (this.memoryDb.blockedSlots.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getAppointments(filter?: {
    status?: string;
    serviceId?: string;
    staffId?: string;
    startDate?: string;
    endDate?: string;
  }): Appointment[] {
    return this.memoryDb.appointments
      .filter((appt) => {
        if (filter?.status && filter.status !== 'all' && appt.status !== filter.status) return false;
        if (filter?.serviceId && filter.serviceId !== 'all' && appt.serviceId !== filter.serviceId) return false;
        if (filter?.staffId && filter.staffId !== 'all' && appt.staffId !== filter.staffId) return false;
        if (filter?.startDate && appt.date < filter.startDate) return false;
        if (filter?.endDate && appt.date > filter.endDate) return false;
        return true;
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }

  public getAppointmentByReference(reference: string): Appointment | undefined {
    return this.memoryDb.appointments.find(
      (a) => a.reference.trim().toUpperCase() === reference.trim().toUpperCase()
    );
  }

  public updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
    reason?: string
  ): Appointment | undefined {
    const appt = this.memoryDb.appointments.find((a) => a.id === id);
    if (!appt) return undefined;
    appt.status = status;
    if (reason) appt.cancellationReason = reason;
    appt.updatedAt = new Date().toISOString();
    this.persist();

    // Dynamically build and record the email dispatch
    const notifType = status === 'cancelled' ? 'cancellation' : 'booking_confirmation';
    import('./email').then(({ dispatchPatientEmail }) => {
      dispatchPatientEmail(appt, this.memoryDb.settings, notifType).then((log) => {
        this.logNotification(log);
      }).catch(err => console.error('Email dispatch error:', err));
    }).catch(err => console.error('Failed to import email module:', err));

    return appt;
  }

  public logNotification(log: NotificationLog): void {
    this.memoryDb.notifications.unshift(log);
    if (this.memoryDb.notifications.length > 100) {
      this.memoryDb.notifications = this.memoryDb.notifications.slice(0, 100);
    }
    this.persist();
  }

  public getNotificationLogs(): NotificationLog[] {
    return this.memoryDb.notifications;
  }

  public getAvailableSlots(dateStr: string, serviceId: string, preferredStaffId?: string): {
    slots: { time: string; endTime: string; availableStaff: { id: string; name: string }[] }[];
    closed: boolean;
    closureReason?: string;
  } {
    const service = this.getServiceById(serviceId);
    if (!service) {
      return { slots: [], closed: true, closureReason: 'Service/Department not found or inactive' };
    }

    const holiday = this.memoryDb.holidays.find((h) => h.date === dateStr);
    if (holiday) {
      return { slots: [], closed: true, closureReason: `Special closure: ${holiday.reason}` };
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const daySchedule = this.memoryDb.schedule.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isOpen) {
      return { slots: [], closed: true, closureReason: `OPD Closed on ${daySchedule?.dayName || 'this day'}` };
    }

    let eligibleStaff = this.getStaff(true).filter((st) =>
      st.assignedServiceIds.includes(service.id) && st.activeDays.includes(dayOfWeek)
    );

    if (preferredStaffId && preferredStaffId !== 'any') {
      eligibleStaff = eligibleStaff.filter((st) => st.id === preferredStaffId);
    }

    if (eligibleStaff.length === 0) {
      return { slots: [], closed: true, closureReason: 'No consultant doctor scheduled for this department today' };
    }

    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
    const openTotalMinutes = openH * 60 + openM;
    const closeTotalMinutes = closeH * 60 + closeM;

    const stepInterval = 30; // slot interval in minutes

    const dayAppointments = this.memoryDb.appointments.filter(
      (a) => a.date === dateStr && a.status !== 'cancelled'
    );

    const dayBlocks = this.memoryDb.blockedSlots.filter((b) => b.date === dateStr);

    const availableSlots: {
      time: string;
      endTime: string;
      availableStaff: { id: string; name: string }[];
    }[] = [];

    for (
      let currentMinutes = openTotalMinutes;
      currentMinutes + service.durationMinutes <= closeTotalMinutes;
      currentMinutes += stepInterval
    ) {
      const slotEndMinutes = currentMinutes + service.durationMinutes;

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const slotStartTime = formatTime(currentMinutes);
      const slotEndTime = formatTime(slotEndMinutes);

      const freeStaffForSlot = eligibleStaff.filter((staff) => {
        const hasConflict = dayAppointments.some((appt) => {
          if (appt.staffId !== staff.id) return false;
          const [appH, appM] = appt.time.split(':').map(Number);
          const [appEndH, appEndM] = appt.endTime.split(':').map(Number);
          const apptStartMin = appH * 60 + appM;
          const apptEndMin = appEndH * 60 + appEndM + (this.memoryDb.settings.bufferMinutes || 10);

          return Math.max(currentMinutes, apptStartMin) < Math.min(slotEndMinutes + (this.memoryDb.settings.bufferMinutes || 10), apptEndMin);
        });

        if (hasConflict) return false;

        const isBlocked = dayBlocks.some((block) => {
          if (block.staffId && block.staffId !== staff.id) return false;
          const [bH, bM] = block.startTime.split(':').map(Number);
          const [bEndH, bEndM] = block.endTime.split(':').map(Number);
          const bStart = bH * 60 + bM;
          const bEnd = bEndH * 60 + bEndM;
          return Math.max(currentMinutes, bStart) < Math.min(slotEndMinutes, bEnd);
        });

        return !isBlocked;
      });

      if (freeStaffForSlot.length > 0) {
        availableSlots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          availableStaff: freeStaffForSlot.map((s) => ({ id: s.id, name: s.name })),
        });
      }
    }

    return {
      slots: availableSlots,
      closed: false,
    };
  }

  public createAppointmentAtomic(payload: {
    serviceId: string;
    staffId: string;
    date: string;
    time: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const service = this.getServiceById(payload.serviceId);
    if (!service || !service.active) {
      return { success: false, error: 'Selected consultation department is unavailable.' };
    }

    const availability = this.getAvailableSlots(payload.date, payload.serviceId, payload.staffId);
    if (availability.closed) {
      return { success: false, error: availability.closureReason || 'The hospital OPD is closed on this date.' };
    }

    const matchedSlot = availability.slots.find((s) => s.time === payload.time);
    if (!matchedSlot || matchedSlot.availableStaff.length === 0) {
      return {
        success: false,
        error: 'This consultation slot has just been filled. Please choose another time slot.',
      };
    }

    let assignedStaff: { id: string; name: string };
    if (payload.staffId && payload.staffId !== 'any') {
      const staffMatch = matchedSlot.availableStaff.find((s) => s.id === payload.staffId);
      if (!staffMatch) {
        return { success: false, error: 'Selected consultant doctor is not available at this time.' };
      }
      assignedStaff = staffMatch;
    } else {
      assignedStaff = matchedSlot.availableStaff[0];
    }

    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `AH-${Math.floor(1000 + Math.random() * 9000)}-${randomHex}`;

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.durationMinutes,
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      date: payload.date,
      time: payload.time,
      endTime: matchedSlot.endTime,
      customerName: payload.customerName.trim(),
      customerEmail: payload.customerEmail.trim(),
      customerPhone: payload.customerPhone.trim(),
      notes: payload.notes?.trim(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryDb.appointments.push(newAppointment);
    this.persist();

    // Dispatch patient email with appointment number, date, time, status, location link
    dispatchPatientEmail(newAppointment, this.memoryDb.settings, 'booking_confirmation')
      .then((log) => {
        this.logNotification(log);
      })
      .catch((err) => console.error('[Storage] Error dispatching booking confirmation email:', err));

    return { success: true, appointment: newAppointment };
  }

  public rescheduleAppointment(
    reference: string,
    contactVerification: string,
    newDate: string,
    newTime: string,
    preferredStaffId?: string
  ): { success: boolean; appointment?: Appointment; error?: string } {
    const appt = this.getAppointmentByReference(reference);
    if (!appt) {
      return { success: false, error: 'Appointment not found. Please verify your reference code.' };
    }

    const normVerify = contactVerification.trim().toLowerCase();
    const emailMatch = appt.customerEmail.toLowerCase() === normVerify;
    const phoneMatch = appt.customerPhone.replace(/\D/g, '').endsWith(normVerify.replace(/\D/g, ''));
    if (!emailMatch && !phoneMatch) {
      return { success: false, error: 'Verification failed. Email or phone number does not match this booking.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'Cancelled appointments cannot be rescheduled. Please book a new visit.' };
    }

    const availability = this.getAvailableSlots(newDate, appt.serviceId, preferredStaffId || appt.staffId);
    const slot = availability.slots.find((s) => s.time === newTime);
    if (!slot || slot.availableStaff.length === 0) {
      return { success: false, error: 'The requested new consultation slot is not available.' };
    }

    const assignedStaff = slot.availableStaff[0];

    appt.date = newDate;
    appt.time = newTime;
    appt.endTime = slot.endTime;
    appt.staffId = assignedStaff.id;
    appt.staffName = assignedStaff.name;
    appt.updatedAt = new Date().toISOString();
    this.persist();

    // Dispatch rescheduled email
    dispatchPatientEmail(appt, this.memoryDb.settings, 'reschedule')
      .then((log) => {
        this.logNotification(log);
      })
      .catch((err) => console.error('[Storage] Error dispatching reschedule email:', err));

    return { success: true, appointment: appt };
  }

  public cancelAppointment(
    reference: string,
    contactVerification: string,
    reason: string
  ): { success: boolean; appointment?: Appointment; error?: string } {
    const appt = this.getAppointmentByReference(reference);
    if (!appt) {
      return { success: false, error: 'Appointment not found.' };
    }

    const normVerify = contactVerification.trim().toLowerCase();
    const emailMatch = appt.customerEmail.toLowerCase() === normVerify;
    const phoneMatch = appt.customerPhone.replace(/\D/g, '').endsWith(normVerify.replace(/\D/g, ''));
    if (!emailMatch && !phoneMatch) {
      return { success: false, error: 'Verification failed. Email or phone number does not match this booking.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'This appointment is already cancelled.' };
    }

    const updated = this.updateAppointmentStatus(appt.id, 'cancelled', reason);
    return { success: true, appointment: updated };
  }
}

export const storage = new StorageEngine();
