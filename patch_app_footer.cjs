const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<p>© 2026 - LocalRescue • Check List 118 Taranto Soccorso • Centrale Operativa<\/p>/;
const replacement = `<div className="flex flex-col gap-1">
            <p>© 2026 - LocalRescue • Check List 118 Taranto Soccorso • Centrale Operativa</p>
            <p className="font-bold text-cyan-400">Created by Antonello Pizzolante</p>
          </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
