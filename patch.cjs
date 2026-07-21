const fs = require('fs');

const content = `import React, { useRef, useState } from 'react';

/**
 * Sanitàservice ASL Taranto Logo Component
 */
export function SanitaserviceLogo({ className = '' }: { className?: string }) {
  const heightClass = className.includes('h-') ? '' : 'h-12';
  const shrinkClass = className.includes('shrink-') ? '' : 'shrink-0';
  
  const [imageSrc, setImageSrc] = useState<string | null>(localStorage.getItem('sanitaservice_logo_custom') || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        localStorage.setItem('sanitaservice_logo_custom', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={\`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative \${heightClass} \${shrinkClass} \${className} \${!imageSrc ? 'cursor-pointer hover:bg-slate-50' : ''}\`}
      onClick={() => {
        if (!imageSrc) {
          fileInputRef.current?.click();
        }
      }}
    >
      {!imageSrc && (
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      )}
      {imageSrc ? (
        <img src={imageSrc} alt="Sanitaservice Logo" className="h-full w-auto object-contain" />
      ) : (
        <div className="flex flex-col items-center text-[10px] text-slate-400 p-2 text-center">
          <span className="font-bold text-slate-500">Sanitaservice</span>
          <span>Clicca per inserire il logo</span>
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

  const [imageSrc, setImageSrc] = useState<string | null>(localStorage.getItem('taranto_soccorso_logo_custom') || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        localStorage.setItem('taranto_soccorso_logo_custom', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={\`flex items-center justify-center p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-sm relative \${heightClass} \${shrinkClass} \${className} \${!imageSrc ? 'cursor-pointer hover:bg-slate-50' : ''}\`}
      onClick={() => {
        if (!imageSrc) {
          fileInputRef.current?.click();
        }
      }}
    >
      {!imageSrc && (
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      )}
      {imageSrc ? (
        <img src={imageSrc} alt="118 Taranto Soccorso Logo" className="h-full w-auto object-contain" />
      ) : (
        <div className="flex flex-col items-center text-[10px] text-slate-400 p-2 text-center">
          <span className="font-bold text-slate-500">Taranto Soccorso</span>
          <span>Clicca per inserire il logo</span>
        </div>
      )}
    </div>
  );
}
\`;

fs.writeFileSync('src/components/Logos.tsx', content);
