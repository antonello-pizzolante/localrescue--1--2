const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

// We have the row "VEHICLE CODE & STATION ROW"
const rowMatch = `              {/* VEHICLE CODE & STATION ROW (Side by Side) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Codice Mezzo */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                  <div className={\`p-2 rounded-lg \${activeRole === 'sanitari' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}\`}>
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Codice Mezzo
                    </label>
                    <select
                      value={vehicleCode}
                      onChange={(e) => setVehicleCode(e.target.value)}
                      className="w-full bg-transparent text-sm text-white font-medium outline-none mt-0.5 cursor-pointer border-none p-0 focus:ring-0"
                    >
                      <option className="bg-slate-900 text-white" value="TA-01">TA-01 (Ambulanza A)</option>
                      <option className="bg-slate-900 text-white" value="TA-02">TA-02 (Ambulanza B)</option>
                      <option className="bg-slate-900 text-white" value="TA-04">TA-04 (Automedica)</option>
                      <option className="bg-slate-900 text-white" value="TA-08">TA-08 (Ambulanza C)</option>
                      <option className="bg-slate-900 text-white" value="TA-12">TA-12 (Ambulanza D)</option>
                    </select>
                  </div>
                </div>

                {/* Postazione */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">`;

const replacement = `              {/* STATION ROW */}
              <div className="grid grid-cols-1 gap-4">
                {/* Postazione */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">`;

if (content.includes(rowMatch)) {
  content = content.replace(rowMatch, replacement);
  fs.writeFileSync('src/components/Login.tsx', content);
  console.log('Vehicle code selector removed.');
} else {
  console.log('Vehicle code selector not found.');
}
