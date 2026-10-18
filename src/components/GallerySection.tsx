import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    src: '/src/assets/images/hospital_exterior_modern_1792253077891.jpg',
    title: 'Hospital Entrance & 24/7 Emergency Casualty Bay',
    subtitle: 'Vijayanagar 3rd Stage, Mysuru',
    description:
      'Convenient road access on 1st Main Road with round-the-clock emergency casualty triage, dedicated ambulance parking, and patient reception.',
  },
  {
    id: 'gal-2',
    src: '/src/assets/images/doctor_consultation_room_1792253078608.jpg',
    title: 'Specialist Outpatient Consultation Suite',
    subtitle: 'OPD Clinical Diagnostics',
    description:
      'Private physician consultation rooms equipped with digital vitals monitoring, patient examination tables, and electronic medical record management.',
  },
  {
    id: 'gal-3',
    src: '/src/assets/images/hospital_operation_theatre_1792253079363.jpg',
    title: 'Laminar-Flow Modular Surgical Theatre',
    subtitle: 'Sterile Laparoscopic Surgery Suite',
    description:
      'State-of-the-art modular operating theatre with positive pressure HEPA filtration, precision LED surgical lighting, and laparoscopic towers.',
  },
  {
    id: 'gal-4',
    src: '/src/assets/images/maternity_patient_room_1792253079647.jpg',
    title: 'Private Patient Recovery & Maternity Suite',
    subtitle: 'Post-Operative Inpatient Wing',
    description:
      'Comfortable private patient recovery rooms featuring adjustable cardiac beds, attendant amenities, nurse call systems, and natural sunlight.',
  },
];

export const GallerySection: React.FC = () => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const openLightbox = (item: GalleryItem) => {
    setActiveItem(item);
  };

  const closeLightbox = () => {
    setActiveItem(null);
  };

  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (!activeItem) return;
    const currentIndex = GALLERY_ITEMS.findIndex((i) => i.id === activeItem.id);
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % GALLERY_ITEMS.length;
      setActiveItem(GALLERY_ITEMS[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
      setActiveItem(GALLERY_ITEMS[prevIndex]);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-900 mb-2">
            Hospital Facilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight font-bold">
            Campus Tour & Clinical Environments
          </h2>
          <p className="mt-3 text-stone-600 text-base">
            Take a visual tour of Aishwarya Hospital's clinical infrastructure, modular theatres, and patient suites.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="group cursor-pointer relative rounded-2xl overflow-hidden bg-stone-200 aspect-[4/5] shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={item.src}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-medium uppercase tracking-wider text-blue-300">
                  {item.subtitle}
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1 leading-snug">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge photograph</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-stone-950/90 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors"
              aria-label="Close enlarged view"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Nav Arrows */}
            <button
              onClick={() => navigateLightbox('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigateLightbox('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Frame */}
            <div className="aspect-[16/10] bg-black">
              <img
                src={activeItem.src}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details Footer */}
            <div className="p-6 bg-stone-900 text-stone-200 border-t border-stone-800">
              <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
                {activeItem.subtitle}
              </div>
              <h4 className="font-serif text-2xl text-white font-bold">{activeItem.title}</h4>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                {activeItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
