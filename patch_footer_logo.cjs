const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFooter = `<div className="flex flex-col gap-1">
            <p>© 2026 - LocalRescue • Check List 118 Taranto Soccorso • Centrale Operativa</p>
            <p className="font-bold text-cyan-400">Created by Antonello Pizzolante</p>
          </div>`;

const newFooter = `<div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p>© 2026 - LocalRescue • Check List 118 Taranto Soccorso • Centrale Operativa</p>
              <p className="font-bold text-cyan-400">Created by Local Rescue</p>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start mt-2 border-t border-white/5 pt-4">
               {/* Il logo fornito dall'utente. Assicurati di caricare il file immagine in "public/footer-logo.png" */}
               <img 
                 src="/footer-logo.png" 
                 alt="Produced by Action Minds, Designed by Antonello Pizzolante & Mirko Serio" 
                 className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity"
                 onError={(e) => {
                   // Fallback visuale se l'immagine non è ancora caricata nei file di progetto
                   e.currentTarget.style.display = 'none';
                   const fallback = document.getElementById('footer-logo-fallback');
                   if (fallback) fallback.style.display = 'flex';
                 }}
               />
               <div id="footer-logo-fallback" className="hidden items-center gap-2 text-cyan-400 font-bold text-[11px] tracking-wide" style={{ display: 'none' }}>
                 <span>Produced by ACTION MINDS</span>
                 <span className="w-1 h-1 rounded-full bg-cyan-400 opacity-50"></span>
                 <span>Designed by Antonello Pizzolante & Mirko Serio</span>
               </div>
            </div>
          </div>`;

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
  fs.writeFileSync(file, content);
  console.log('Footer updated');
} else {
  console.log('Footer target not found');
}
