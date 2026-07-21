const fs = require('fs');
let content = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

// Find the real start
const importIdx = content.indexOf("import React");
content = content.substring(importIdx); // Strip everything before import React

const targetPos = content.indexOf('<div className="mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">');

if (targetPos !== -1) {
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
          </div>\n          `;
    
    content = content.substring(0, targetPos) + selectorHtml + content.substring(targetPos);
    fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', content);
    console.log("Fixed!");
} else {
    console.log("Could not find target!");
}
