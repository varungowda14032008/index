import React, { useState } from 'react';
import { Clock, Shield, MapPin, ArrowRight, Activity, PhoneCall, Award } from 'lucide-react';
import { BusinessSettings } from '../types/client';

interface HeroSectionProps {
  business: BusinessSettings;
  onBookClick: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  business,
  onBookClick,
  onExploreServices,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-stone-50 to-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Proposition and Booking CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            {/* Unboxed category metadata (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-900">
              <span>{business.category}</span>
              <span aria-hidden="true">·</span>
              <span>Vijayanagar 3rd Stage, Mysuru</span>
              <span aria-hidden="true">·</span>
              <span>24/7 Emergency</span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.14] tracking-tight font-bold"
              style={{ textWrap: 'balance' }}
            >
              Trusted Multi-Specialty Healthcare & Advanced Surgical Centre
            </h1>

            {/* Concise Value Proposition */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Delivering patient-centred clinical excellence in Mysuru. From comprehensive maternity care and minimally invasive laparoscopic surgery to 24/7 casualty trauma and specialized medical consultations.
            </p>

            {/* Booking & Emergency Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onBookClick}
                className="px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-full hover:bg-blue-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer"
              >
                <span>Book OPD Doctor Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreServices}
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-800 bg-white border border-stone-300 rounded-full hover:bg-stone-50 hover:border-stone-400 active:scale-[0.98] transition-all flex items-center justify-center whitespace-nowrap cursor-pointer shadow-xs"
              >
                View Clinical Departments
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-600" />
                <span>24/7 Casualty & Trauma Response</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Modular Sterile OTs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                <span>1st Main Rd, Vijayanagar 3rd Stage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 bg-stone-200">
              <img
                src="/src/assets/images/hospital_exterior_modern_1792253077891.jpg"
                alt="Aishwarya Hospital main building and ambulance emergency bay in Mysuru"
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!imageLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200 text-stone-500 p-6 text-center">
                  <Activity className="w-8 h-8 mb-2 text-blue-600" />
                  <p className="font-serif text-lg text-stone-800">Aishwarya Hospital</p>
                  <p className="text-xs text-stone-500 mt-1">Vijayanagar 3rd Stage, Mysuru</p>
                </div>
              )}

              {/* Verified Hospital Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-200 shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-stone-900">24/7 Emergency Services Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Hospital Highlights Strip */}
        <div className="mt-14 pt-8 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Care Availability</p>
            <p className="mt-1 font-serif text-xl sm:text-2xl text-blue-950 font-bold">24 Hours / 365 Days</p>
            <p className="text-xs text-stone-500 mt-0.5">Continuous casualty, ICU & pharmacy</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Maternity & Women</p>
            <p className="mt-1 font-serif text-xl sm:text-2xl text-blue-950 font-bold">Expert OB/GYN</p>
            <p className="text-xs text-stone-500 mt-0.5">Dedicated labor & neonatal suites</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Surgical Infrastructure</p>
            <p className="mt-1 font-serif text-xl sm:text-2xl text-blue-950 font-bold">Modular OTs</p>
            <p className="text-xs text-stone-500 mt-0.5">Minimally invasive laparoscopic tech</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Online OPD Booking</p>
            <p className="mt-1 font-serif text-xl sm:text-2xl text-blue-950 font-bold">Zero Wait Time</p>
            <p className="text-xs text-stone-500 mt-0.5">Pre-booked guaranteed consultation slots</p>
          </div>
        </div>
      </div>
    </section>
  );
};
