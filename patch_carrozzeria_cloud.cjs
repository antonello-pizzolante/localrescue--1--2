const fs = require('fs');

let content = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

const importAdd = `import { doc, getDoc, setDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase';\n`;

// Add imports
content = content.replace("import React,", importAdd + "import React,");

// Add useEffect
const useEffectAdd = `
  useEffect(() => {
    const fetchBgs = async () => {
      try {
        const docRefAuto = doc(db, 'settings', 'vehicle_bg_automedica');
        const snapAuto = await getDoc(docRefAuto);
        if (snapAuto.exists() && snapAuto.data().imageSrc) {
          setBgImageAutomedica(snapAuto.data().imageSrc);
          localStorage.setItem('vehicle_bg_automedica', snapAuto.data().imageSrc);
        }

        const docRefAmb = doc(db, 'settings', 'vehicle_bg_ambulanza');
        const snapAmb = await getDoc(docRefAmb);
        if (snapAmb.exists() && snapAmb.data().imageSrc) {
          setBgImageAmbulanza(snapAmb.data().imageSrc);
          localStorage.setItem('vehicle_bg_ambulanza', snapAmb.data().imageSrc);
        }
      } catch (err) {
        console.error("Error loading vehicle backgrounds from cloud:", err);
      }
    };
    fetchBgs();
  }, []);
`;

content = content.replace(/const fileInputRefs = useRef<\{ \[key: string\]: HTMLInputElement \| null \}>\(\{\}\);/g, `const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});\n${useEffectAdd}`);

// Replace "Nessuno Schema Inserito" with upload capability
const uploadLogic = `
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const handleMainBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        try {
          if (vehicleType === 'automedica') {
            setBgImageAutomedica(result);
            localStorage.setItem('vehicle_bg_automedica', result);
            await setDoc(doc(db, 'settings', 'vehicle_bg_automedica'), { imageSrc: result }, { merge: true });
          } else {
            setBgImageAmbulanza(result);
            localStorage.setItem('vehicle_bg_ambulanza', result);
            await setDoc(doc(db, 'settings', 'vehicle_bg_ambulanza'), { imageSrc: result }, { merge: true });
          }
        } catch (err) {
          console.error("Error saving background to cloud:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };
`;

content = content.replace("const handleCanvasClick", uploadLogic + "\n  const handleCanvasClick");

const emptyBgLogic = `
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
                </div>
`;

content = content.replace(
  /<div className="text-xs font-bold text-slate-500 uppercase flex flex-col items-center select-none pointer-events-none text-center px-4">[\s\S]*?<\/div>/g,
  emptyBgLogic
);

fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', content);
