const fs = require('fs');
let content = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

const importIdx = content.indexOf("import React");
content = content.substring(importIdx); // Strip the prepended div

const targetInsert = `<div
            onClick={handleCanvasClick}
            className="relative w-full max-w-md aspect-[4/3] bg-black/25 rounded-xl border border-white/10 cursor-crosshair overflow-hidden flex flex-col p-0 shadow-inner"
          >`;

// Let's find a safe spot to insert the selector.
// Search for "Carrozzeria e Segni Particolari"
const headingIdx = content.indexOf('<h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">Carrozzeria e Segni Particolari</h4>');

if (headingIdx !== -1) {
    const afterHeading = headingIdx + '<h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">Carrozzeria e Segni Particolari</h4>'.length;
    
    const selectorHtml = `
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10 mb-2 max-w-md w-full">
            <button 
              onClick={() => setVehicleType('automedica')}
              className={\`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition \${vehicleType === 'automedica' ? 'bg-cyan-600/30 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}\`}
            >
              Automedica
            </button>
            <button 
              onClick={() => setVehicleType('ambulanza')}
              className={\`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition \${vehicleType === 'ambulanza' ? 'bg-cyan-600/30 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}\`}
            >
              Ambulanza
            </button>
          </div>
`;
    
    content = content.substring(0, afterHeading) + selectorHtml + content.substring(afterHeading);
    fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', content);
    console.log("Fixed!");
} else {
    console.log("Could not find heading!");
}
