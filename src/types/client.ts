import { BusinessSettings, Service, Staff, DaySchedule, HolidayClosure, Appointment, NotificationLog } from '../server/types';

export interface BookingState {
  serviceId: string;
  staffId: string; // 'any' or specific staff ID
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export interface SlotInfo {
  time: string;
  endTime: string;
  availableStaff: { id: string; name: string }[];
}

export interface SetupChecklistItem {
  id: string;
  title: string;
  status: 'verified' | 'warning' | 'pending' | 'configured_default' | 'production_smtp' | 'dev_preview_mode';
  description: string;
  actionNeeded?: string;
}

export type {
  BusinessSettings,
  Service,
  Staff,
  DaySchedule,
  HolidayClosure,
  Appointment,
  NotificationLog,
};
