import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Send, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { BusinessSettings, DaySchedule } from '../types/client';

interface LocationAndHoursProps {
  business: BusinessSettings;
  schedule: DaySchedule[];
}

export const LocationAndHours: React.FC<LocationAndHoursProps> = ({
  business,
  schedule,
}) => {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('General Medicine');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) {
      setFormError('Please enter your name, contact phone number, and query.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormMessage('');
    }, 500);
  };

  return (
    <section id="location" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2">
            Hospital Location & Emergency Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight font-bold">
            Visit Aishwarya Hospital in Vijayanagar, Mysuru
          </h2>
          <p className="mt-3 text-stone-600 text-base">
            Centrally situated on 1st Main Road, Vijayanagar 3rd Stage. Our emergency casualty department and pharmacy remain open 24 hours a day, 365 days a year.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Hours & Emergency Contacts */}
          <div className="lg:col-span-6 space-y-6">
            {/* 24/7 Emergency Card */}
            <div className="p-6 bg-red-600 text-white rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest bg-red-700 px-3 py-1 rounded-full">
                  24/7 Emergency & Casualty
                </span>
                <span className="text-xs bg-white text-red-700 px-2.5 py-0.5 rounded-full font-bold">
                  Always Open
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold">Emergency Helpline Numbers</h3>
                <p className="text-xs text-red-100 mt-1">
                  Immediate ambulance dispatch, trauma response, and emergency admissions:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`tel:${business.phone}`}
                  className="flex-1 py-3 px-4 bg-white text-red-700 rounded-xl font-bold text-center text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{business.phone}</span>
                </a>
                <a
                  href="tel:+918512830995"
                  className="flex-1 py-3 px-4 bg-red-800 text-white rounded-xl font-bold text-center text-sm hover:bg-red-900 transition-colors flex items-center justify-center gap-2 border border-red-500"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>+91 85128 30995</span>
                </a>
              </div>
            </div>

            {/* OPD Hours */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Outpatient Department (OPD) Hours
                </span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  OPD Open Daily
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {schedule.map((item) => (
                  <div
                    key={item.dayOfWeek}
                    className="flex items-center justify-between py-1 text-stone-700"
                  >
                    <span className="font-semibold text-stone-900">{item.dayName}</span>
                    <span className="font-mono tabular-nums text-stone-600">
                      {item.openTime} – {item.closeTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">Address & Directions</h3>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-stone-900 text-sm">Aishwarya Hospital</strong>
                    <span>
                      {business.address.street}<br />
                      {business.address.city}, {business.address.state} - {business.address.postalCode}, India
                    </span>
                    <div className="mt-2">
                      <a
                        href={business.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1.5 underline"
                      >
                        <span>Open Verified Google Maps Location</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="text-[11px] text-stone-400 block uppercase">Inquiries Email</span>
                    <a href={`mailto:${business.email}`} className="text-stone-900 hover:underline">
                      {business.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
                Hospital Helpdesk
              </div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold mb-2">
                Patient Inquiries & Medical Assistance
              </h3>
              <p className="text-xs text-stone-600 mb-6">
                Have a question regarding surgery scheduling, health check packages, or insurance cashless TPA empanelment? Leave your details below.
              </p>

              {isSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Thank you. Our hospital front desk coordinator will contact you shortly.</span>
                </div>
              )}

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Patient / Attendant Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Gowda"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 focus:outline-blue-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 focus:outline-blue-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 focus:outline-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Department of Interest
                    </label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 focus:outline-blue-700"
                    >
                      <option>Obstetrics & Gynecology</option>
                      <option>General Medicine & Diabetology</option>
                      <option>General & Laparoscopic Surgery</option>
                      <option>Cardiology & Heart Care</option>
                      <option>Pediatrics & Child Wellness</option>
                      <option>Master Health Check Packages</option>
                      <option>Insurance & Cashless TPA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Query / Message *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your medical inquiry, preferred doctor, or hospital service requirement..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 focus:outline-blue-700"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Hospital Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
