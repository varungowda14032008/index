import React, { useState } from 'react';
import { CheckCircle2, PhoneCall, ShieldCheck, MapPin } from 'lucide-react';
import { BusinessSettings } from '../types/client';

interface OwnerChecklistBannerProps {
  business: BusinessSettings;
  onOpenAdmin: () => void;
  onOpenChecklistModal: () => void;
}

export const OwnerChecklistBanner: React.FC<OwnerChecklistBannerProps> = ({
  business,
  onOpenAdmin,
  onOpenChecklistModal,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside aria-label="Verified Google Maps business notice and 24/7 casualty emergency alert" className="bg-sky-950 text-sky-100 text-xs border-b border-sky-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold uppercase tracking-wider text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Google Maps Listing</span>
            </span>
            <span className="text-sky-200">
              <strong>{business.name}</strong> · Vijayanagar 3rd Stage, Mysuru
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            {/* Direct Emergency Call */}
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>24/7 Emergency: {business.phone}</span>
            </a>

            <button
              onClick={onOpenChecklistModal}
              className="text-sky-300 hover:text-white transition-colors cursor-pointer text-[11px] hidden md:inline"
            >
              Hospital Details
            </button>

            <button
              onClick={onOpenAdmin}
              className="px-2 py-0.5 bg-sky-900/60 hover:bg-sky-800 text-sky-200 rounded transition-colors text-[11px] cursor-pointer"
            >
              Staff Portal
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-sky-400 hover:text-sky-200 text-sm ml-1"
              title="Dismiss"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
