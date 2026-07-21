const fs = require('fs');
const content = `import React from 'react';

/**
 * Sanitàservice ASL Taranto Logo Component
 */
export function SanitaserviceLogo({ className = '' }: { className?: string }) {
  const heightClass = className.includes('h-') ? '' : 'h-12';
  const shrinkClass = className.includes('shrink-') ? '' : 'shrink-0';
  
  const imageSrc = localStorage.getItem('sanitaservice_logo_custom');

  return (
    <div className={\`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative \${heightClass} \${shrinkClass} \${className}\`}>
      {imageSrc ? (
        <img src={imageSrc} alt="Sanitaservice Logo" className="h-full w-auto object-contain" />
      ) : (
        <div className="flex flex-col items-center text-[10px] text-slate-400 p-2 text-center">
          <span className="font-bold text-slate-500">Sanitaservice</span>
          <span>(Manca logo)</span>
        </div>
      )}
    </div>
  );
}

/**
 * 118 Taranto Soccorso Logo Component
 */
export function TarantoSoccorsoLogo({ className = '' }: { className?: string }) {
  const heightClass = className.includes('h-') ? '' : 'h-12';
  const shrinkClass = className.includes('shrink-') ? '' : 'shrink-0';

  const imageSrc = localStorage.getItem('taranto_soccorso_logo_custom');

  return (
    <div className={\`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative \${heightClass} \${shrinkClass} \${className}\`}>
      {imageSrc ? (
        <img src={imageSrc} alt="118 Taranto Soccorso Logo" className="h-full w-auto object-contain" />
      ) : (
        <div className="flex flex-col items-center text-[10px] text-slate-400 p-2 text-center">
          <span className="font-bold text-slate-500">Taranto Soccorso</span>
          <span>(Manca logo)</span>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/Logos.tsx', content);
