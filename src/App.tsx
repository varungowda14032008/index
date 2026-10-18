import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { OwnerChecklistBanner } from './components/OwnerChecklistBanner';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { ExperienceSection } from './components/ExperienceSection';
import { PractitionersSection } from './components/PractitionersSection';
import { GallerySection } from './components/GallerySection';
import { LocationAndHours } from './components/LocationAndHours';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BookingWizard } from './components/BookingWizard';
import { ManageBookingModal } from './components/ManageBookingModal';
import { OwnerChecklistModal } from './components/OwnerChecklistModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BusinessSettings, Service, Staff, DaySchedule, Appointment } from './types/client';

export default function App() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal controls
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Booking selection state
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedStaffId, setPreselectedStaffId] = useState<string | null>(null);

  const bookingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    setIsLoading(true);
    try {
      const [bizRes, srvRes, stfRes, schRes] = await Promise.all([
        fetch('/api/business'),
        fetch('/api/services'),
        fetch('/api/staff'),
        fetch('/api/schedule'),
      ]);

      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusiness(bizData.data);
      }
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setServices(srvData.data);
      }
      if (stfRes.ok) {
        const stfData = await stfRes.json();
        setStaff(stfData.data);
      }
      if (schRes.ok) {
        const schData = await schRes.json();
        setSchedule(schData.data.weekly);
      }
    } catch (err) {
      console.error('Failed to load initial application state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBooking = (service?: Service, staffId?: string) => {
    if (service) setPreselectedService(service);
    if (staffId) setPreselectedStaffId(staffId);
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading || !business) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center text-stone-800 space-y-4">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-xl font-bold tracking-tight text-blue-950">Aishwarya Hospital</p>
        <p className="text-xs text-stone-500">Vijayanagar 3rd Stage, Mysuru · Loading clinical services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* 1. Verified Google Maps Banner & Emergency Helpline */}
      <OwnerChecklistBanner
        business={business}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenChecklistModal={() => setIsChecklistModalOpen(true)}
      />

      {/* 2. Top Navigation Bar */}
      <Navbar
        business={business}
        onBookClick={() => scrollToBooking()}
        onManageClick={() => setIsManageModalOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <HeroSection
          business={business}
          onBookClick={() => scrollToBooking()}
          onExploreServices={() => {
            const el = document.getElementById('departments');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Booking Section (Interactive Multi-step Wizard) */}
        <section id="booking" ref={bookingRef} className="py-20 bg-stone-100/70 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-blue-900">
                Outpatient Department
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-1 font-bold">
                Book an OPD Doctor Consultation
              </h2>
              <p className="text-sm text-stone-600 mt-2">
                Real-time appointment scheduling with senior consultant physicians and surgeons. No waiting lines at the hospital counter.
              </p>
            </div>

            <BookingWizard
              services={services}
              staff={staff}
              business={business}
              preselectedService={preselectedService}
              onBookingComplete={(_appointment: Appointment) => {
                // Refresh app data in background
                loadAppData();
              }}
            />
          </div>
        </section>

        {/* 5. Services Section */}
        <ServicesSection
          services={services}
          business={business}
          onSelectService={(srv) => scrollToBooking(srv)}
        />

        {/* 6. Experience & Philosophy Section */}
        <ExperienceSection
          business={business}
          onBookClick={() => scrollToBooking()}
        />

        {/* 7. Practitioners Section */}
        <PractitionersSection
          staff={staff}
          onBookWithStaff={(staffId) => scrollToBooking(undefined, staffId)}
        />

        {/* 8. Photo Gallery with Enlarged Viewer Lightbox */}
        <GallerySection />

        {/* 9. Location, Opening Hours & Concierge Contact */}
        <LocationAndHours
          business={business}
          schedule={schedule}
        />

        {/* 10. Frequently Asked Questions */}
        <FAQSection business={business} />
      </main>

      {/* 11. Footer */}
      <Footer
        business={business}
        onBookClick={() => scrollToBooking()}
        onManageClick={() => setIsManageModalOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onOpenChecklist={() => setIsChecklistModalOpen(true)}
      />

      {/* Modals */}
      {isManageModalOpen && (
        <ManageBookingModal
          business={business}
          onClose={() => setIsManageModalOpen(false)}
        />
      )}

      {isChecklistModalOpen && (
        <OwnerChecklistModal
          business={business}
          onClose={() => setIsChecklistModalOpen(false)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {isAdminOpen && (
        <AdminDashboard
          initialSettings={business}
          onClose={() => setIsAdminOpen(false)}
          onSettingsUpdated={(newSettings) => setBusiness(newSettings)}
        />
      )}
    </div>
  );
}
