const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

// Add import for ScadenzeMezzi
content = content.replace(
  "import { AutistiChecklistReport",
  "import { ScadenzeMezzi } from './ScadenzeMezzi';\nimport { AutistiChecklistReport"
);

// Add Calendar icon to imports
content = content.replace(
  "import {   Cloud, Database, Search,",
  "import {   Cloud, Database, Search, Calendar,"
);

// Add activeView state
content = content.replace(
  "  const [searchTerm, setSearchTerm] = useState('');",
  "  const [activeView, setActiveView] = useState<'archivio' | 'scadenze'>('archivio');\n  const [searchTerm, setSearchTerm] = useState('');"
);

// Add tabs in header
const tabsHtml = `
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveView('archivio')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all \${
              activeView === 'archivio' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Database className="w-4 h-4" />
            <span>Archivio Check List</span>
          </button>
          <button
            onClick={() => setActiveView('scadenze')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all \${
              activeView === 'scadenze' 
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Calendar className="w-4 h-4" />
            <span>Scadenze Mezzi</span>
          </button>
        </div>

        {activeView === 'archivio' ? (
          <>
`;

content = content.replace(
  "      {/* FILTERS & STATS */}",
  tabsHtml + "\n      {/* FILTERS & STATS */}"
);

// Close the conditional rendering of archivio
const closingArchivio = `
          </>
        ) : (
          <ScadenzeMezzi />
        )}
      </div>

      {/* Confirmation Modals for archivio... */}
`;
content = content.replace(
  "      {/* Modals */}",
  "          </>\n        ) : (\n          <ScadenzeMezzi />\n        )}\n\n      {/* Modals */}"
);


fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
