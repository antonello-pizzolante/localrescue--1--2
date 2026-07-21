const fs = require('fs');
let content = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

// Add bg images state
content = content.replace(
  "const [selectedPart, setSelectedPart] = useState('Fianco Destro');",
  `const [selectedPart, setSelectedPart] = useState('Fianco Destro');
  const [bgImages, setBgImages] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('vehicle_bgs') || '{}'); } catch { return {}; }
  });

  const handleBgUpload = (part: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const newBgs = { ...bgImages, [part]: result };
        setBgImages(newBgs);
        localStorage.setItem('vehicle_bgs', JSON.stringify(newBgs));
      };
      reader.readAsDataURL(file);
    }
  };`
);

// Replace SVG with Grid
const svgStart = content.indexOf('<svg className="w-full h-full text-slate-300 select-none"');
const svgEnd = content.indexOf('</svg>') + 6;

const replacementGrid = `
            {/* Background Grid for 4 Views */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {['Fianco Sinistro', 'Fianco Destro', 'Frontale (Anteriore)', 'Posteriore (Retro)'].map((view, idx) => {
                const label = view.split(' ')[0];
                return (
                  <div key={view} className="relative border border-white/5 flex items-center justify-center overflow-hidden group">
                    {bgImages[view] ? (
                      <img src={bgImages[view]} alt={view} className="w-full h-full object-cover select-none pointer-events-none opacity-50" />
                    ) : (
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex flex-col items-center select-none pointer-events-none">
                        <ImageIcon className="w-4 h-4 mb-1 opacity-50" />
                        <span>{label}</span>
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10" onClick={(e) => { e.stopPropagation(); document.getElementById('bg-upload-'+idx)?.click(); }}>
                       <span className="bg-cyan-500/80 text-white text-[9px] px-2 py-1 rounded cursor-pointer pointer-events-auto shadow">Cambia Foto</span>
                       <input id={'bg-upload-'+idx} type="file" accept="image/*" className="hidden" onChange={(e) => handleBgUpload(view, e)} />
                    </div>
                  </div>
                );
              })}
            </div>
`;

content = content.substring(0, svgStart) + replacementGrid + content.substring(svgEnd);

fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', content);
