const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `            <button
              onClick={handleBulkUploadToDrive}
              disabled={isBulkUploading}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50"
            >
              <Cloud className="w-4 h-4" />
              {isBulkUploading ? 'Caricamento in corso...' : \`Backup su Drive (\${selectedForBulk.size})\`}
            </button>`;

const newStr = `            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  if (selectedForBulk.size === filteredReports.length) {
                    setSelectedForBulk(new Set());
                  } else {
                    setSelectedForBulk(new Set(filteredReports.map(r => r.id)));
                  }
                }}
                className="text-xs px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all font-bold text-slate-300"
              >
                {selectedForBulk.size === filteredReports.length ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
              </button>
              <button
                onClick={handleBulkUploadToDrive}
                disabled={isBulkUploading}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                {isBulkUploading ? 'Caricamento in corso...' : \`Backup su Drive (\${selectedForBulk.size})\`}
              </button>
            </div>`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content);
console.log('Done');
