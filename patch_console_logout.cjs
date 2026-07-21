const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                Google Drive Connesso
              </div>`;

const newStr = `<div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                Google Drive Connesso
              </div>
              <button
                onClick={async () => {
                  try {
                    await logoutGoogle();
                    setIsGoogleLinked(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-xs px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all font-bold text-slate-300"
                title="Scollega account Google"
              >
                Scollega
              </button>
            </div>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
console.log('Done');
