const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  "import { MOCK_CREW_STATUSES",
  "import { ScadenzeMezzi } from './ScadenzeMezzi';\nimport { MOCK_CREW_STATUSES"
);

const scadenzeHtml = `
      {/* SCADENZE MEZZI SECTION */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-white tracking-tight font-display flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          Scadenze e Revisioni Mezzi
        </h2>
        <ScadenzeMezzi />
      </div>
`;

content = content.replace(
  "    </div>\n  );\n}",
  scadenzeHtml + "\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
