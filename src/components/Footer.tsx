import React from 'react';
import { BusinessSettings } from '../types/client';
import { ShieldCheck, MapPin, Phone, Mail, PhoneCall } from 'lucide-react';

interface FooterProps {
  business: BusinessSettings;
  onBookClick: () => void;
  onManageClick: () => void;
  onAdminClick: () => void;
  onOpenChecklist: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  business,
  onBookClick,
  onManageClick,
  onAdminClick,
  onOpenChecklist,
}) => {
  return (
    <footer className="bg-blue-950 text-blue-100 pt-16 pb-12 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-blue-900/80">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                +
              </span>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                {business.name}
              </span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed max-w-sm">
              {business.tagline}. Leading healthcare institution in Vijayanagar 3rd Stage, Mysuru dedicated to clinical excellence, safe maternity, and patient recovery.
            </p>
            <div className="pt-2 text-xs text-blue-200 space-y-1.5">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{business.address.street}, {business.address.city}, {business.address.state} - {business.address.postalCode}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Hospital Desk: {business.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-red-300 font-semibold">24/7 Helpline: +91 85128 30995</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{business.email}</span>
              </p>
            </div>
          </div>

          {/* Clinical Specialties */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Clinical Departments
            </p>
            <ul className="space-y-2 text-xs text-blue-200">
              <li>
                <a href="#departments" className="hover:text-white transition-colors">
                  Obstetrics & Gynecology (Maternity)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-white transition-colors">
                  General Medicine & Diabetology
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-white transition-colors">
                  General & Laparoscopic Surgery
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-white transition-colors">
                  Cardiology & Heart Care
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-white transition-colors">
                  Pediatrics & Neonatal Care
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  24/7 ICU & Modular Theatres
                </a>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Patient Services
            </p>
            <ul className="space-y-2 text-xs text-blue-200">
              <li>
                <button
                  onClick={onBookClick}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Book OPD Doctor Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={onManageClick}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Lookup / Reschedule Appointment
                </button>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">
                  Ambulance & Casualty Triage
                </a>
              </li>
              <li>
                <span className="block text-blue-300">
                  Daily OPD: 08:30 AM – 08:30 PM
                </span>
              </li>
              <li>
                <span className="block text-blue-300">
                  Casualty & Emergency: 24/7 All Days
                </span>
              </li>
            </ul>
          </div>

          {/* Hospital Administration */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Hospital Admin
            </p>
            <div className="space-y-2 text-xs">
              <button
                onClick={onAdminClick}
                className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium border border-blue-800"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>Doctor & Staff Portal</span>
              </button>

              <button
                onClick={onOpenChecklist}
                className="w-full py-1.5 px-3 rounded-lg border border-blue-900 hover:border-blue-800 text-blue-300 hover:text-white transition-colors text-center cursor-pointer text-[11px]"
              >
                Verified Business Details
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <p>© {new Date().getFullYear()} {business.name}, Mysuru. All clinical rights reserved.</p>
          <div className="flex items-center gap-4 text-blue-300 text-[11px]">
            <span>Verified Google Maps Listing</span>
            <span aria-hidden="true">·</span>
            <span>24/7 Emergency Healthcare</span>
            <span aria-hidden="true">·</span>
            <span>Vijayanagar 3rd Stage, Mysuru</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
