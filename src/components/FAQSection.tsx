import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BusinessSettings } from '../types/client';

interface FAQSectionProps {
  business: BusinessSettings;
}

interface FAQItem {
  q: string;
  a: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ business }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'How do I book an OPD doctor consultation at Aishwarya Hospital?',
      a: 'You can book an Outpatient Department (OPD) appointment online directly through this portal. Select your clinical department, choose your preferred consultant doctor, pick an available date and time slot, and enter the patient details. You will instantly receive a digital Patient Booking Reference with zero upfront payment required.',
    },
    {
      q: 'What should patients bring for their doctor appointment?',
      a: 'Please bring any previous medical prescriptions, lab reports, ultrasound or X-ray scans, and government photo identification. Please arrive 10 minutes prior to your allocated slot for vitals recording at the nursing station.',
    },
    {
      q: 'Are emergency services and the hospital pharmacy open 24/7?',
      a: 'Yes. Aishwarya Hospital maintains a fully operational 24/7 Casualty & Emergency Department with round-the-clock medical officers, ICU nurses, laboratory diagnostics, and an on-site 24-hour pharmacy.',
    },
    {
      q: 'Does Aishwarya Hospital support cashless insurance and Mediclaim TPA?',
      a: 'Yes, we facilitate cashless hospitalization and Mediclaim reimbursement with major health insurance providers and Third Party Administrators (TPAs). Our dedicated TPA helpdesk assists patients with pre-authorization and claims documentation.',
    },
    {
      q: 'Can I reschedule or cancel my OPD consultation?',
      a: 'Yes. You can manage your appointment online anytime using the "Lookup Appointment" feature on our website. Enter your Booking Reference (e.g. AH-XXXX-XXXX) and registered phone number to change your appointment date/time or cancel.',
    },
  ];

  return (
    <section className="py-20 bg-stone-100 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2">
            Patient Help & Guidelines
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight font-bold">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-stone-600 text-sm">
            Helpful information regarding doctor consultations, casualty admission, and patient care.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-stone-900">
                    {faq.q}
                  </span>
                  <span className="p-1 text-stone-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
