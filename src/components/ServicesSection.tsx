import React, { useState } from 'react';
import { Clock, Check, ArrowRight, Stethoscope } from 'lucide-react';
import { Service, BusinessSettings } from '../types/client';

interface ServicesSectionProps {
  services: Service[];
  business: BusinessSettings;
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  business,
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <section id="departments" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-700" />
              <span>Clinical Specialities & Outpatient Department</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight font-bold">
              Specialist Consultations & Healthcare Services
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl text-base">
              Schedule in-person consultations with leading specialist doctors across Mysuru. Choose your clinical department to reserve a guaranteed consultation slot.
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/80 rounded-xl self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
                }`}
              >
                {cat === 'all' ? 'All Specialities' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Image if available */}
                {service.image && (
                  <div className="mb-5 aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-blue-900">{service.category}</span>
                  <div className="flex items-center gap-1 tabular-nums font-mono">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{service.durationMinutes} min consultation</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-stone-900 mb-3 group-hover:text-blue-950 transition-colors">
                  {service.name}
                </h3>

                <p className="text-sm text-stone-600 leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Highlights List */}
                {service.highlights && service.highlights.length > 0 && (
                  <div className="space-y-1.5 mb-6 pt-3 border-t border-stone-100">
                    {service.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                        <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fee and Book Action */}
              <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">OPD Consultation Fee</span>
                  <span className="text-2xl font-serif font-bold text-blue-950 tabular-nums">
                    {business.currency}{service.price}
                  </span>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency & Casualty Quick Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>24/7 Emergency Casualty & Ambulance Desk</span>
            </div>
            <p className="text-xs text-red-800 mt-1">
              For acute emergencies, chest pain, trauma, or urgent labor delivery, proceed directly to our Emergency casualty entrance on 1st Main Rd, Vijayanagar 3rd Stage, or call immediately.
            </p>
          </div>
          <a
            href={`tel:${business.phone}`}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-xs"
          >
            <span>Call {business.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
