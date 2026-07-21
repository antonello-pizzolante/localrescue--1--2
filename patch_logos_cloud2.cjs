const fs = require('fs');
let code = fs.readFileSync('src/components/Logos.tsx', 'utf8');

// Replace the fallback UI for Sanitaservice
code = code.replace(
  /<div className="flex flex-col items-center text-\[10px\] text-slate-400 p-2 text-center">\s*<span className="font-bold text-slate-500">Sanitaservice<\/span>\s*<span>Clicca per inserire il logo<\/span>\s*<\/div>/g,
  `<div className="relative w-full h-full flex items-center justify-center group">
          <img src="/sanitaservice-logo.svg" alt="Sanitaservice Logo Default" className="h-full w-auto object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 text-center px-1">
            <span>Carica Logo Cloud</span>
          </div>
        </div>`
);

// Replace the fallback UI for Taranto Soccorso
code = code.replace(
  /<div className="flex flex-col items-center text-\[10px\] text-slate-400 p-2 text-center">\s*<span className="font-bold text-slate-500">Taranto Soccorso<\/span>\s*<span>Clicca per inserire il logo<\/span>\s*<\/div>/g,
  `<div className="relative w-full h-full flex items-center justify-center group">
          <img src="/taranto-soccorso-logo.svg" alt="Taranto Soccorso Logo Default" className="h-full w-auto object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 text-center px-1">
            <span>Carica Logo Cloud</span>
          </div>
        </div>`
);

fs.writeFileSync('src/components/Logos.tsx', code);
