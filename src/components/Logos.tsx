import React from 'react';

/**
 * Sanitàservice ASL Taranto Logo Component
 */
export function SanitaserviceLogo({ className = '' }: { className?: string }) {
  const heightClass = className.includes('h-') ? '' : 'h-12';
  const shrinkClass = className.includes('shrink-') ? '' : 'shrink-0';
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <div className={`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative ${heightClass} ${shrinkClass} ${className}`}>
       <img src={`${baseUrl}logo-1.png`} alt="Sanitaservice Logo" className="h-full w-auto object-contain" />
    </div>
  );
}

/**
 * 118 Taranto Soccorso Logo Component
 */
export function TarantoSoccorsoLogo({ className = '' }: { className?: string }) {
  const heightClass = className.includes('h-') ? '' : 'h-12';
  const shrinkClass = className.includes('shrink-') ? '' : 'shrink-0';
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <div className={`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative ${heightClass} ${shrinkClass} ${className}`}>
       <img src={`${baseUrl}logo-2.png`} alt="118 Taranto Soccorso Logo" className="h-full w-auto object-contain" />
    </div>
  );
}
