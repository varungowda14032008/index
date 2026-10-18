import React from 'react';
import { Staff } from '../types/client';
import { Calendar, UserCheck, Stethoscope } from 'lucide-react';

interface PractitionersSectionProps {
  staff: Staff[];
  onBookWithStaff: (staffId: string) => void;
}

export const PractitionersSection: React.FC<PractitionersSectionProps> = ({
  staff,
  onBookWithStaff,
}) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section id="doctors" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-700" />
            <span>Senior Medical Faculty</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight font-bold">
            Consultant Physicians & Surgeons
          </h2>
          <p className="mt-3 text-stone-600 text-base">
            Our medical staff includes distinguished specialists and surgeons committed to ethical, compassionate, evidence-based patient healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-xs">
                    {doctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                      {doctor.name}
                    </h3>
                    <p className="text-xs font-medium text-blue-800 mt-0.5">
                      {doctor.title}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {doctor.bio}
                </p>

                {/* Specialties badges */}
                <div className="mb-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Clinical Focus
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OPD Schedule */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>
                    OPD Days:{' '}
                    <strong className="text-stone-800">
                      {doctor.activeDays.map((d) => dayNames[d]).join(', ')}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-medium">Outpatient Clinic</span>
                <button
                  onClick={() => onBookWithStaff(doctor.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 rounded-full transition-colors cursor-pointer"
                >
                  Book with {doctor.name.replace('Dr. ', '').split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
