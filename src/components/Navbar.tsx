import React, { useState } from 'react';
import { Menu, X, CalendarCheck, ShieldCheck, PhoneCall } from 'lucide-react';
import { BusinessSettings } from '../types/client';

interface NavbarProps {
  business: BusinessSettings;
  onBookClick: () => void;
  onManageClick: () => void;
  onAdminClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  business,
  onBookClick,
  onManageClick,
  onAdminClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="#"
            className="text-2xl font-serif font-bold tracking-tight text-blue-950 hover:text-blue-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-sans font-extrabold text-base shadow-xs">
              +
            </span>
            <span>{business.name}</span>
          </a>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <a href="#departments" className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0">
              Departments
            </a>
            <a href="#doctors" className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0">
              Specialist Doctors
            </a>
            <a href="#facilities" className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0">
              Facilities & ICU
            </a>
            <a href="#gallery" className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0">
              Hospital Tour
            </a>
            <a href="#location" className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0">
              Contact & OPD Hours
            </a>
          </nav>

          {/* Zone 3: 1 primary action + subtle utilities */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={onManageClick}
              className="text-xs font-medium text-stone-600 hover:text-blue-900 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-transparent hover:border-stone-200"
              title="Look up, reschedule, or cancel your OPD appointment"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Lookup Appointment</span>
            </button>

            <button
              onClick={onAdminClick}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 px-2 py-1.5 rounded"
              title="Hospital Front Desk & Doctor Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </button>

            <button
              onClick={onBookClick}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              Book OPD Appointment
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onBookClick}
              className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Book OPD
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 pt-2 text-base font-medium text-stone-700">
            <a
              href="#departments"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-blue-900"
            >
              Clinical Departments
            </a>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-blue-900"
            >
              Consultant Doctors
            </a>
            <a
              href="#facilities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-blue-900"
            >
              Facilities & Diagnostics
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-blue-900"
            >
              Hospital Tour
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-blue-900"
            >
              Location & Emergency Contacts
            </a>
          </nav>

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
            >
              Book OPD Appointment
            </button>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onManageClick();
                }}
                className="flex-1 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Lookup Visit</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="flex-1 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
