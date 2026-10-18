import React from 'react';
import { ShieldCheck, Activity, HeartHandshake, Syringe } from 'lucide-react';
import { BusinessSettings } from '../types/client';

interface ExperienceSectionProps {
  business: BusinessSettings;
  onBookClick: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  business,
  onBookClick,
}) => {
  return (
    <section id="facilities" className="py-20 bg-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2">
            Clinical Infrastructure
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 tracking-tight font-bold">
            Modern Medical Technology & Sterile Surgical Suites
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            {business.name} combines advanced medical diagnostic infrastructure with patient-centered compassionate care. Our clinical campus in Vijayanagar 3rd Stage is equipped for routine consultations as well as acute surgical interventions.
          </p>
        </div>

        {/* 2-Column Split: Image Showcase and Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Pair */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 shadow-md">
              <img
                src="/src/assets/images/hospital_operation_theatre_1792253079363.jpg"
                alt="Modular surgical operating theatre at Aishwarya Hospital"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 shadow-md mt-8">
              <img
                src="/src/assets/images/doctor_consultation_room_1792253078608.jpg"
                alt="Spotless doctor consultation suite at Aishwarya Hospital"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Clinical Pillars List */}
          <div className="lg:col-span-6 space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Modular Laminar-Flow Operation Theatres
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  Equipped with HEPA positive pressure air handling, advanced laparoscopic video towers, and strict infection-control protocols to ensure safe surgical outcomes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  24/7 Intensive Care & Trauma Management
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  Dedicated multi-bed intensive care unit (ICU) supported by continuous telemetry monitoring, defibrillators, mechanical ventilators, and on-call intensivists.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Maternal Care, Labor Room & Neonatal Nursery
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  Dedicated maternity delivery suite with fetal monitors and phototherapy newborn care, led by experienced obstetricians and pediatricians.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onBookClick}
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
              >
                Schedule Doctor Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
