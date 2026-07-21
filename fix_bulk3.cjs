const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const badPart = `                        {/* Checkbox per Bulk Upload */}
                        <div 
                          className="mr-3 flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-all \${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                  const isSelected = isAut`;

content = content.replace(badPart, `const isSelected = isAut`);

const insertTarget = `                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Summary */}`;

const replaceWith = `                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Bulk Upload Checkbox */}
                        <div 
                          className="mr-2 flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-all \${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        {/* Summary */}`;

content = content.replace(insertTarget, replaceWith);

fs.writeFileSync(file, content);
console.log('Done');
