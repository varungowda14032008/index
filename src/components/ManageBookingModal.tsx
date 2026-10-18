import React, { useState } from 'react';
import { X, Search, Calendar, Clock, AlertCircle, CheckCircle2, RotateCcw, Mail, ExternalLink } from 'lucide-react';
import { Appointment, BusinessSettings, SlotInfo } from '../types/client';

interface ManageBookingModalProps {
  business: BusinessSettings;
  onClose: () => void;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  business,
  onClose,
}) => {
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<(Appointment & { canModify?: boolean; hoursUntilAppointment?: number }) | null>(null);

  // Reschedule sub-state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<SlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Cancellation sub-state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Email Preview state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !contact.trim()) {
      setError('Please provide both your booking reference and email or phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(
        `/api/appointments/lookup?reference=${encodeURIComponent(reference.trim())}&contact=${encodeURIComponent(contact.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to find appointment.');
      }
      setAppointment(data.data);
    } catch (err: any) {
      setError(err.message || 'Error looking up appointment.');
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadRescheduleSlots = async (date: string) => {
    if (!appointment) return;
    setNewDate(date);
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${date}&serviceId=${appointment.serviceId}`);
      const data = await res.json();
      setRescheduleSlots(data.slots || []);
    } catch {
      setRescheduleSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleExecuteReschedule = async () => {
    if (!appointment || !newDate || !newTime) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.reference}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contact.trim(),
          newDate,
          newTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage('Your appointment has been successfully rescheduled. A notification email has been dispatched with updated time, date, location link, and status: RESCHEDULED.');
      setAppointment({ ...appointment, ...data.data });
      setIsRescheduling(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCancel = async () => {
    if (!appointment) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.reference}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contact.trim(),
          reason: cancelReason || 'Patient requested cancellation online',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage('Your appointment has been cancelled. A cancellation email has been dispatched to your email address with appointment number, date, time, location link, and status: CANCELLED.');
      setAppointment({ ...appointment, status: 'cancelled' });
      setIsCancelling(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!appointment) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.reference}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: appointment.customerEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus(`Email successfully dispatched to ${appointment.customerEmail} with appointment #${appointment.reference}, date, time, location link, and status: ${appointment.status.toUpperCase()}.`);
      } else {
        setResendStatus(data.error || 'Failed to dispatch email.');
      }
    } catch {
      setResendStatus('Network error dispatching email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-blue-900 mb-1">
            Patient Self-Service
          </div>
          <h3 className="text-2xl font-serif text-stone-900 font-bold">Manage Your Appointment</h3>
          <p className="text-xs text-stone-600 mt-1">
            Look up your consultation token to check status, review email notifications, reschedule, or cancel.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {!appointment ? (
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Appointment Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. AH-8492-X"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono uppercase bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Registered Phone or Email *
              </label>
              <input
                type="text"
                placeholder="Phone or email provided during booking"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-blue-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching Patient Records...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find My Appointment</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Appointment Details Box */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <span className="font-mono text-sm font-bold text-blue-900">
                  #{appointment.reference}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    appointment.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-stone-700">
                <p>
                  <strong className="text-stone-900">Department:</strong> {appointment.serviceName}
                </p>
                <p>
                  <strong className="text-stone-900">Doctor:</strong> {appointment.staffName}
                </p>
                <p>
                  <strong className="text-stone-900">Date & Slot:</strong> {appointment.date} at {appointment.time} – {appointment.endTime}
                </p>
                <p>
                  <strong className="text-stone-900">Patient:</strong> {appointment.customerName} ({appointment.customerPhone})
                </p>
                {appointment.cancellationReason && (
                  <p className="text-red-700">
                    <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
                  </p>
                )}
              </div>
            </div>

            {/* Email Message Summary Card */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              appointment.status === 'cancelled'
                ? 'bg-red-50/80 border-red-200 text-red-950'
                : 'bg-blue-50/80 border-blue-200 text-blue-950'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>Patient Email Message Status:</span>
                </span>
                <span className={`uppercase font-bold ${appointment.status === 'cancelled' ? 'text-red-700' : 'text-emerald-700'}`}>
                  {appointment.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-stone-700 pt-1">
                <p>• <strong>Email Sent To:</strong> {appointment.customerEmail}</p>
                <p>• <strong>Appointment Number:</strong> #{appointment.reference}</p>
                <p>• <strong>Scheduled Date & Time:</strong> {appointment.date} at {appointment.time}</p>
                <p>
                  • <strong>Hospital Location Link:</strong>{' '}
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-medium hover:text-blue-900"
                  >
                    Open Google Maps Link
                  </a>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="font-bold underline text-blue-800 hover:text-blue-950 cursor-pointer"
                >
                  View Full Email Sent to Patient
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="px-2.5 py-1 bg-white border border-stone-300 rounded text-[11px] font-medium hover:bg-stone-50 cursor-pointer"
                >
                  {isResending ? 'Resending...' : 'Resend Email'}
                </button>
              </div>

              {resendStatus && (
                <p className="text-[11px] text-emerald-800 font-medium pt-1">
                  ✓ {resendStatus}
                </p>
              )}
            </div>

            {/* Rescheduling Interface */}
            {isRescheduling && (
              <div className="p-4 rounded-xl border border-stone-300 bg-stone-100/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    Select New Consultation Date & Time
                  </h4>
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => handleLoadRescheduleSlots(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-900"
                />

                {isLoadingSlots ? (
                  <div className="text-center py-3 text-xs text-stone-500">Checking availability...</div>
                ) : rescheduleSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {rescheduleSlots.map((s) => (
                      <button
                        key={s.time}
                        onClick={() => setNewTime(s.time)}
                        className={`py-1.5 text-xs font-mono rounded border ${
                          newTime === s.time
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-blue-300'
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                ) : newDate ? (
                  <p className="text-xs text-stone-500 text-center py-2">
                    No open slots on this date.
                  </p>
                ) : null}

                <button
                  onClick={handleExecuteReschedule}
                  disabled={!newDate || !newTime || isLoading}
                  className="w-full py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  Confirm New Slot & Send Updated Email
                </button>
              </div>
            )}

            {/* Cancellation Interface */}
            {isCancelling && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-900">
                    Confirm Appointment Cancellation
                  </h4>
                  <button
                    onClick={() => setIsCancelling(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Dismiss
                  </button>
                </div>

                <p className="text-xs text-stone-600">
                  Please let us know your reason for cancellation (optional):
                </p>
                <input
                  type="text"
                  placeholder="e.g., Symptoms resolved, schedule conflict..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-900"
                />

                <button
                  onClick={handleExecuteCancel}
                  disabled={isLoading}
                  className="w-full py-2 bg-red-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Cancellation & Send Cancellation Email
                </button>
              </div>
            )}

            {/* Action buttons if confirmed and not yet rescheduling/cancelling */}
            {!isRescheduling && !isCancelling && appointment.status === 'confirmed' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRescheduling(true)}
                    className="flex-1 py-2.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule Consultation</span>
                  </button>

                  <button
                    onClick={() => setIsCancelling(true)}
                    className="flex-1 py-2.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Cancel Appointment</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between">
              <button
                onClick={() => setAppointment(null)}
                className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                Look up a different appointment
              </button>
              <button
                onClick={onClose}
                className="text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-stone-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Email Preview Modal */}
      {showEmailModal && appointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-stone-200 max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-700" />
                <h4 className="font-serif text-lg font-bold">Email Message Sent to Patient</h4>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-stone-200">
                <span className={`inline-block px-3 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  APPOINTMENT {appointment.status.toUpperCase()}
                </span>
                <h4 className="font-serif text-lg font-bold text-stone-900 mt-2">{business.name}</h4>
                <p className="text-stone-500">Subject: [{appointment.status.toUpperCase()}] Appointment #{appointment.reference}</p>
                <p className="text-stone-500">Sent to: {appointment.customerEmail}</p>
              </div>

              <div className="space-y-1.5 text-stone-800">
                <p><strong>Appointment Number:</strong> <span className="font-mono text-blue-900 font-bold">#{appointment.reference}</span></p>
                <p><strong>Status:</strong> <span className={appointment.status === 'cancelled' ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>{appointment.status.toUpperCase()}</span></p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.time} – {appointment.endTime}</p>
                <p><strong>Doctor:</strong> {appointment.staffName}</p>
                <p><strong>Department:</strong> {appointment.serviceName}</p>
                <p><strong>Patient Name:</strong> {appointment.customerName}</p>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <p className="font-bold text-stone-900 mb-1">Hospital Location & Maps Link:</p>
                <p className="text-stone-600 mb-2">{business.address.street}, {business.address.city}, {business.address.state} - {business.address.postalCode}</p>
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-white bg-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase hover:bg-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
