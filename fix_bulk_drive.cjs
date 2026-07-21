const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const badStr = `                        {/* Checkbox per Bulk Upload */}
                        <div 
                          className="mr-3 flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\\\`w-5 h-5 rounded border flex items-center justify-center transition-all \\\${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\\\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                  const isSelected = isAut`;

const goodStr = `                  const isSelected = isAut`;

content = content.replace(badStr, goodStr);

const checkboxHtml = `
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {/* Checkbox per Bulk Upload */}
                        <div 
                          className="flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-all \${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
`;

content = content.replace('<div className="flex-1 min-w-0">\n                      <div className="flex items-center gap-3">', checkboxHtml);

fs.writeFileSync(file, content);
console.log('Done');
