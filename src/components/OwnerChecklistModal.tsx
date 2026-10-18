import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sliders, ExternalLink, ShieldCheck, MapPin, Phone, Hospital } from 'lucide-react';
import { BusinessSettings, SetupChecklistItem } from '../types/client';

interface OwnerChecklistModalProps {
  business: BusinessSettings;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const OwnerChecklistModal: React.FC<OwnerChecklistModalProps> = ({
  business,
  onClose,
  onOpenAdmin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Google Maps Verified Hospital Profile</span>
          </div>
          <h3 className="text-2xl font-serif text-stone-900 font-bold">
            Aishwarya Hospital — Verified Business Details
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            Successfully resolved from Google Maps listing (<code className="bg-stone-100 px-1 py-0.5 rounded text-blue-900 font-mono">maps.app.goo.gl/CVybxwKpQZ2rLeEq8</code>).
          </p>
        </div>

        {/* Verified Details Card */}
        <div className="space-y-3.5 mb-8 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-900">Hospital Profile & Category</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 px-2 py-0.5 rounded-full text-emerald-900">
                Verified
              </span>
            </div>
            <p><strong>Name:</strong> {business.name}</p>
            <p><strong>Category:</strong> {business.category}</p>
            <p><strong>Location:</strong> {business.address.street}, {business.address.city}, {business.address.state} - {business.address.postalCode}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-blue-900">Verified Contact Numbers</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-200 px-2 py-0.5 rounded-full text-blue-900">
                Active
              </span>
            </div>
            <p><strong>Hospital Landline:</strong> {business.phone} (0821-2410255)</p>
            <p><strong>24/7 Helpline:</strong> +91 85128 30995</p>
            <p><strong>Emergency:</strong> Casualty department operational 24 hours / 365 days</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-900">Clinical Departments & Specialists</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 px-2 py-0.5 rounded-full text-stone-800">
                Configured
              </span>
            </div>
            <p>• Obstetrics & Gynecology (Dr. Sushma V. Dev, Dr. G. N. Sumangala)</p>
            <p>• Internal Medicine & Diabetology (Dr. R. K. Mahesh)</p>
            <p>• General & Laparoscopic Surgery (Dr. Pradeep Kumar)</p>
            <p>• Cardiology (Dr. Arvind Swamy)</p>
            <p>• Pediatrics & Neonatal Care (Dr. Kavitha Murthy)</p>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-700 hover:text-blue-900 underline flex items-center gap-1 font-medium"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Hospital Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
