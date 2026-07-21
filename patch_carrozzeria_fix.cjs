const fs = require('fs');
const file = 'src/components/CarrozzeriaSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `
                <div 
                  className="text-xs font-bold text-slate-500 uppercase flex flex-col items-center select-none cursor-pointer text-center px-4 hover:text-slate-300 transition-colors pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    mainFileInputRef.current?.click();
                  }}
                >
                  <input type="file" accept="image/*" className="hidden" ref={mainFileInputRef} onChange={handleMainBgUpload} />
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50 mx-auto" />
                  <span>Carica Schema {vehicleType === 'automedica' ? 'Automedica' : 'Ambulanza'}</span>
                </div>`;

content = content.replace(targetStr, '');

// Wait, the previous patch had: 
// content = content.replace(uploadUI, '');
// It probably failed. Let's just do a big replace.
content = content.replace(/<div\s+className="text-xs font-bold text-slate-500 uppercase flex flex-col items-center[\s\S]*?<\/div>/m, '');

fs.writeFileSync(file, content);
