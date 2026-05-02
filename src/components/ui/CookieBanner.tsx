'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-acid-green border-4 border-void-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden">
        {/* Subtle SVG Grid/Pattern in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="cookie-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="black" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cookie-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* SVG Cookie Icon */}
              <div className="bg-void-black p-2 shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 9.5 21 7.5 19 6C18 3.5 15.5 2 12 2Z" fill="#A3FF12" />
                  <circle cx="8" cy="8" r="1.5" fill="black" />
                  <circle cx="15" cy="10" r="1.5" fill="black" />
                  <circle cx="10" cy="15" r="1.5" fill="black" />
                  <circle cx="16" cy="16" r="1.5" fill="black" />
                  <path d="M19 6C18 3.5 15.5 2 12 2" stroke="black" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h2 className="font-urdu text-2xl text-void-black leading-relaxed">کوکیاں؟</h2>
              </div>
            </div>
            <button onClick={() => setIsVisible(false)} className="text-void-black hover:scale-110 transition-transform">
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          <p className="font-sans font-bold text-void-black text-sm uppercase leading-tight">
            We use cookies to track your questionable fashion choices. Accept or keep wearing mid clothes.
            Yeah, we take your cookies. No, you can&apos;t have them back.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-void-black text-acid-green font-twenly text-lg py-2 hover:bg-gray-900 transition-colors uppercase border-2 border-void-black"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 border-2 border-void-black text-void-black font-twenly text-lg py-2 hover:bg-void-black hover:text-acid-green transition-all uppercase"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
