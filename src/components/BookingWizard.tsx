import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  CalendarCheck,
  Stethoscope,
  Phone,
  Mail,
  Hospital,
} from 'lucide-react';
import { Service, Staff, BusinessSettings, Appointment, SlotInfo } from '../types/client';
import { downloadICSFile } from '../utils/calendar';

interface BookingWizardProps {
  services: Service[];
  staff: Staff[];
  business: BusinessSettings;
  preselectedService?: Service | null;
  onBookingComplete?: (appointment: Appointment) => void;
  onCancel?: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  staff,
  business,
  preselectedService,
  onBookingComplete,
  onCancel,
}) => {
  // Wizard Step: 1 to 7
  const [step, setStep] = useState<number>(preselectedService ? 2 : 1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService?.id || (services[0]?.id || '')
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [agreeToPolicy, setAgreeToPolicy] = useState<boolean>(false);

  // Slots fetching and status
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Email Preview & Resend States
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [isResendingEmail, setIsResendingEmail] = useState<boolean>(false);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedStaffObj = staff.find((st) => st.id === selectedStaffId);

  const handleResendEmail = async () => {
    if (!confirmedAppointment) return;
    setIsResendingEmail(true);
    setEmailSentNotice(null);
    try {
      const res = await fetch(`/api/appointments/${confirmedAppointment.reference}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: confirmedAppointment.customerEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSentNotice(`Email re-sent to ${confirmedAppointment.customerEmail} with appointment #${confirmedAppointment.reference}, time, date, location link, and confirmed status.`);
      } else {
        setEmailSentNotice(data.error || 'Failed to dispatch email.');
      }
    } catch {
      setEmailSentNotice('Network error re-sending email.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Initialize tomorrow's date by default if empty
  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedServiceId) {
      fetchAvailability(selectedDate, selectedServiceId, selectedStaffId);
    }
  }, [selectedDate, selectedServiceId, selectedStaffId]);

  const fetchAvailability = async (date: string, serviceId: string, staffId: string) => {
    setIsLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch(
        `/api/availability?date=${date}&serviceId=${serviceId}&staffId=${staffId}`
      );
      const data = await res.json();
      if (data.closed) {
        setSlotsError(data.closureReason || 'The hospital OPD is closed on this date.');
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots || []);
        if (selectedTime && !data.slots.some((s: SlotInfo) => s.time === selectedTime)) {
          setSelectedTime('');
        }
      }
    } catch {
      setSlotsError('Unable to retrieve consultation slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validateCustomerDetails = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errors.name = 'Please provide patient full legal name.';
    }
    if (!customerEmail.trim()) {
      errors.email = 'Please provide an email address for confirmation.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!customerPhone.trim()) {
      errors.phone = 'Please provide a contact phone number for SMS confirmation.';
    } else if (customerPhone.replace(/\D/g, '').length < 8) {
      errors.phone = 'Please provide a complete 10-digit telephone number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (!agreeToPolicy) {
      setSubmissionError('Please accept the hospital consultation policy to proceed.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          date: selectedDate,
          time: selectedTime,
          customerName,
          customerEmail,
          customerPhone,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete appointment booking.');
      }

      setConfirmedAppointment(data.data);
      setStep(7);
      if (onBookingComplete) {
        onBookingComplete(data.data);
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'An unexpected error occurred. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 24; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({
        dateStr,
        dayName,
        monthName,
        dayNum: dd,
        isSunday: d.getDay() === 0,
      });
    }
    return dates;
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Step Progress Header */}
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-200" />
          <span className="font-serif font-bold text-lg">
            Doctor Appointment & OPD Reservation
          </span>
        </div>

        <div className="text-xs text-blue-200 font-mono">
          Step <span className="text-white font-bold">{step}</span> of 7
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* ================= STEP 1: SELECT SPECIALTY ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">1. Select Clinical Speciality</h3>
              <p className="text-sm text-stone-600 mt-1">
                Choose the clinical department or health check package for your appointment.
              </p>
            </div>

            <div className="space-y-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedServiceId === srv.id
                      ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-stone-900 text-base">
                        {srv.name}
                      </span>
                      <span className="text-xs text-blue-700 font-medium">
                        {srv.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 max-w-xl">{srv.description}</p>
                  </div>

                  <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-lg font-serif font-bold text-blue-950 tabular-nums">
                      {business.currency}{srv.price}
                    </span>
                    <span className="text-[11px] text-stone-500">Pay at hospital counter</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedServiceId}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Doctor Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT DOCTOR ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">2. Select Consultant Doctor</h3>
              <p className="text-sm text-stone-600 mt-1">
                Choose a specific specialist doctor or choose 'Any Available Doctor' for earliest slot.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedStaffId('any')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedStaffId === 'any'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-lg">
                    Any Available Specialist Doctor
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    First available qualified physician or surgeon on duty. Recommended for maximum schedule availability.
                  </p>
                </div>
                <div className="pt-4 text-xs font-medium text-blue-800">Broadest slot choices</div>
              </div>

              {staff
                .filter((st) => st.assignedServiceIds.includes(selectedService.id))
                .map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedStaffId === st.id
                        ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-sm mb-3">
                        {st.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-lg">{st.name}</h4>
                      <p className="text-xs text-blue-800 font-medium">{st.title}</p>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">{st.bio}</p>
                    </div>
                    <div className="pt-3 border-t border-stone-100 mt-3 text-[11px] text-stone-500">
                      Focus: {st.specialties.join(' · ')}
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Specialities</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Date</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SELECT DATE ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">3. Select Appointment Date</h3>
              <p className="text-sm text-stone-600 mt-1">
                Choose an upcoming consultation date. OPD operates daily (Sunday morning OPD available).
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {generateDateOptions().slice(0, 18).map((item) => (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    selectedDate === item.dateStr
                      ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
                      : 'border-stone-200 hover:border-blue-300 bg-white text-stone-800'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider font-semibold">{item.dayName}</span>
                  <span className="text-xl font-serif font-bold my-0.5 tabular-nums">
                    {item.dayNum}
                  </span>
                  <span className="text-[10px] opacity-75">{item.monthName}</span>
                  {item.isSunday && <span className="text-[9px] mt-0.5 opacity-90">Morning OPD</span>}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs text-stone-600">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Or choose from calendar:</span>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:outline-blue-700"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                disabled={!selectedDate}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Time Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SELECT TIME SLOT ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">4. Select Consultation Time</h3>
              <p className="text-sm text-stone-600 mt-1">
                Consultation slots for <strong className="text-stone-900">{selectedDate}</strong> at Aishwarya Hospital OPD.
              </p>
            </div>

            {isLoadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center text-stone-500 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Checking real-time doctor availability...</p>
              </div>
            ) : slotsError ? (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold">No OPD sessions on this date</p>
                  <p className="text-xs mt-1 text-amber-700">{slotsError}</p>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-3 text-xs underline font-medium hover:text-amber-950 cursor-pointer"
                  >
                    Select an alternate date
                  </button>
                </div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <Clock className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-semibold text-stone-800">All consultation slots booked</p>
                <p className="text-xs text-stone-500 mt-1">
                  Please pick another date or choose 'Any Available Doctor'.
                </p>
                <button
                  onClick={() => setStep(3)}
                  className="mt-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  Change Date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedTime === slot.time
                        ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
                        : 'border-stone-200 hover:border-blue-300 bg-white text-stone-800'
                    }`}
                  >
                    <span className="font-mono text-base font-bold tabular-nums">{slot.time}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        selectedTime === slot.time ? 'text-blue-100' : 'text-stone-500'
                      }`}
                    >
                      Until {slot.endTime}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(5)}
                disabled={!selectedTime}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: PATIENT DETAILS ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">5. Patient Information</h3>
              <p className="text-sm text-stone-600 mt-1">
                Your consultation token and SMS confirmation will be issued to these details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Patient Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Gowda"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700 ${
                    formErrors.name ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                  }`}
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Contact Phone Number (for SMS token) *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700 ${
                      formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700 ${
                      formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Symptoms or Medical Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention current symptoms, duration, previous prescriptions, or any known drug allergies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  if (validateCustomerDetails()) {
                    setStep(6);
                  }
                }}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Review Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: REVIEW ================= */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold">6. Review Appointment Details</h3>
              <p className="text-sm text-stone-600 mt-1">
                Please verify the department, doctor schedule, and hospital location before confirmation.
              </p>
            </div>

            {submissionError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{submissionError}</span>
              </div>
            )}

            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Department</span>
                  <p className="font-serif text-lg font-bold text-stone-900">
                    {selectedService.name}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Consultation Duration</span>
                  <p className="font-mono text-sm text-stone-900">{selectedService.durationMinutes} minutes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone-200">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Consultation Slot</span>
                  <p className="text-sm font-semibold text-stone-900">
                    {selectedDate} at {selectedTime}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Consultant Doctor</span>
                  <p className="text-sm font-semibold text-stone-900">
                    {selectedStaffObj ? selectedStaffObj.name : 'First Available Doctor on Duty'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone-200">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Patient Name</span>
                  <p className="text-sm font-semibold text-stone-900">{customerName}</p>
                  <p className="text-xs text-stone-600">{customerPhone} · {customerEmail}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Hospital Location</span>
                  <p className="text-sm font-semibold text-stone-900">
                    Aishwarya Hospital, Vijayanagar 3rd Stage, Mysuru
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-base font-serif font-bold text-stone-900 block">Consultation Fee</span>
                  <span className="text-xs text-stone-500">Payable at hospital registration desk upon arrival</span>
                </div>
                <span className="text-2xl font-serif font-bold text-blue-950 tabular-nums">
                  {business.currency}{selectedService.price}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToPolicy}
                  onChange={(e) => setAgreeToPolicy(e.target.checked)}
                  className="mt-1 rounded border-stone-300 text-blue-700 focus:ring-blue-700 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs text-stone-600 leading-relaxed">
                  <span className="font-semibold text-stone-900">I agree to the OPD Appointment Terms:</span>{' '}
                  {business.policies.cancellation}
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(5)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting || !agreeToPolicy}
                className="px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking OPD Token...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Doctor Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 7: CONFIRMED SCREEN ================= */}
        {step === 7 && confirmedAppointment && (
          <div className="space-y-8 text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-800">
                Doctor Appointment Confirmed
              </span>
              <h3 className="text-3xl font-serif text-stone-900 font-bold mt-1">
                Your OPD Slot Has Been Scheduled
              </h3>
              <p className="text-sm text-stone-600 max-w-lg mx-auto mt-2">
                Your consultation token is reserved at Aishwarya Hospital. Please present this reference code at the registration desk upon your arrival.
              </p>
            </div>

            <div className="bg-blue-50/60 rounded-3xl border border-blue-200 p-6 max-w-md mx-auto text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <span className="text-xs text-blue-900 uppercase tracking-wider font-semibold">
                  Patient Token Reference
                </span>
                <span className="font-mono text-base font-bold text-blue-950 tracking-wider">
                  {confirmedAppointment.reference}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-800">
                <div className="flex justify-between">
                  <span className="text-stone-500">Department:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Consultant:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date & Slot:</span>
                  <span className="font-semibold text-stone-900">
                    {confirmedAppointment.date} at {confirmedAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Patient:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Hospital:</span>
                  <span className="font-semibold text-stone-900">Aishwarya Hospital, Mysuru</span>
                </div>
              </div>
            </div>

            {/* Official Email Message Dispatched Box */}
            <div className="bg-emerald-50/80 rounded-3xl border border-emerald-200 p-6 max-w-md mx-auto text-left space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-900">
                    Email Message Sent to Patient
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950">
                  CONFIRMED
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Sent To:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Appointment Number:</span>
                  <span className="font-mono font-bold text-blue-900">#{confirmedAppointment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className="font-bold text-emerald-700">CONFIRMED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Appointment Date:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Appointment Time:</span>
                  <span className="font-semibold text-stone-900">{confirmedAppointment.time} – {confirmedAppointment.endTime}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex flex-col gap-1">
                  <span className="text-stone-500">Location Link:</span>
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-medium break-all hover:text-blue-900"
                  >
                    {business.googleMapsUrl}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(true)}
                  className="text-xs font-semibold text-emerald-900 underline hover:text-emerald-950 cursor-pointer"
                >
                  View Sent Patient Email
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                  className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {isResendingEmail ? 'Sending...' : 'Resend Email'}
                </button>
              </div>

              {emailSentNotice && (
                <p className="text-[11px] text-emerald-800 font-medium pt-1">
                  ✓ {emailSentNotice}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => downloadICSFile(confirmedAppointment, business)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 border border-stone-300 hover:bg-stone-50 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Print Appointment Token</span>
              </button>
            </div>

            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Need to reschedule or cancel? Use your appointment number{' '}
              <strong className="text-stone-900">{confirmedAppointment.reference}</strong> in the{' '}
              <span className="text-blue-700 underline font-semibold">Lookup Appointment</span> tool.
            </p>
          </div>
        )}
      </div>

      {/* Patient Email Preview Modal */}
      {showEmailPreview && confirmedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowEmailPreview(false)}
        >
          <div
            className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-700" />
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">Patient Email Message</h4>
                  <p className="text-[11px] text-stone-500">Dispatched to {confirmedAppointment.customerEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            {/* Simulated Email View */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50">
              <div className="bg-blue-900 text-white p-5 text-center">
                <h3 className="font-serif text-xl font-bold">{business.name}</h3>
                <p className="text-xs text-blue-200 mt-0.5">Vijayanagar 3rd Stage, Mysuru · Multi-Specialty Healthcare</p>
              </div>

              <div className="p-6 bg-white space-y-4">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs uppercase tracking-wider">
                    APPOINTMENT CONFIRMED
                  </span>
                  <h4 className="font-serif text-xl font-bold text-stone-900 mt-2">
                    Your OPD Doctor Consultation is Confirmed
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Dear <strong>{confirmedAppointment.customerName}</strong>, please find your appointment number, schedule, and hospital location link below.
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Appointment Number:</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">#{confirmedAppointment.reference}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Appointment Status:</span>
                    <span className="font-bold text-emerald-700">CONFIRMED</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Appointment Date:</span>
                    <span className="font-bold text-stone-900">{confirmedAppointment.date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Appointment Time:</span>
                    <span className="font-bold text-stone-900">{confirmedAppointment.time} – {confirmedAppointment.endTime}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Doctor:</span>
                    <span className="font-semibold text-stone-900">{confirmedAppointment.staffName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500 font-medium">Department:</span>
                    <span className="font-semibold text-stone-900">{confirmedAppointment.serviceName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500 font-medium">Patient Contact:</span>
                    <span className="font-semibold text-stone-900">{confirmedAppointment.customerPhone}</span>
                  </div>
                </div>

                {/* Location Link Button */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-2">
                  <p className="text-xs font-semibold text-blue-950">Hospital Location & Directions:</p>
                  <p className="text-xs text-blue-900">
                    {business.address.street}, {business.address.city}, {business.address.state} - {business.address.postalCode}
                  </p>
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs"
                  >
                    📍 Open in Google Maps Directions
                  </a>
                </div>

                <div className="text-xs text-stone-500 border-t pt-3 space-y-1">
                  <p><strong>Emergency Contacts:</strong></p>
                  <p>• Hospital Desk: {business.phone} | 24/7 Casualty Helpline: +91 85128 30995</p>
                  <p>• Instructions: Please arrive 10 minutes prior with previous prescriptions.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-xl hover:bg-stone-800"
              >
                Close Email Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
